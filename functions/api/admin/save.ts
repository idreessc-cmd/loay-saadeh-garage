async function verifySessionCookie(secret: string, cookieValue: string): Promise<boolean> {
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return false;
  
  const [payload, signatureHex] = parts;
  const expiryTime = parseInt(payload, 10);
  if (isNaN(expiryTime) || expiryTime < Date.now()) return false;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  
  try {
    const signatureBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    const data = encoder.encode(payload);
    return await crypto.subtle.verify("HMAC", key, signatureBytes, data);
  } catch {
    return false;
  }
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map(c => c.trim());
  for (const cookie of cookies) {
    const [key, val] = cookie.split("=");
    if (key === name) return val;
  }
  return null;
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binString = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binString += String.fromCharCode(bytes[i]);
  }
  return btoa(binString);
}

function validateData(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return "تنسيق البيانات غير صحيح";
  const candidate = data as Partial<CenterData>;
  
  if (!candidate.name || typeof candidate.name !== 'string' || candidate.name.trim().length < 3) {
    return "اسم المركز يجب أن يكون 3 حروف على الأقل";
  }
  
  if (!candidate.phone || typeof candidate.phone !== 'string' || candidate.phone.trim().length < 7) {
    return "رقم الهاتف غير صحيح";
  }
  
  if (!candidate.whatsapp || typeof candidate.whatsapp !== 'string' || candidate.whatsapp.trim().length < 7) {
    return "رقم الواتساب غير صحيح";
  }
  
  if (!Array.isArray(candidate.services) || candidate.services.length < 3) {
    return "يجب وجود 3 خدمات على الأقل";
  }
  
  for (const s of candidate.services) {
    if (!s.id || !s.title || !s.desc) {
      return `بيانات الخدمة (${s.title || 'غير مسماة'}) غير مكتملة`;
    }
  }
  
  if (!Array.isArray(candidate.faqs) || candidate.faqs.length < 2) {
    return "يجب وجود سؤالين شائعين على الأقل";
  }
  
  for (const f of candidate.faqs) {
    if (!f.q || !f.a) {
      return "هناك أسئلة أو أجوبة فارغة في الأسئلة الشائعة";
    }
  }
  
  if (!candidate.metadata || typeof candidate.metadata !== 'object') {
    return "إعدادات SEO غير موجودة";
  }
  
  if (!candidate.metadata.title || candidate.metadata.title.trim().length < 10) {
    return "عنوان SEO قصير جداً (10 حروف على الأقل)";
  }
  
  if (!candidate.metadata.description || candidate.metadata.description.trim().length < 20) {
    return "وصف SEO قصير جداً (20 حرفاً على الأقل)";
  }
  
  return null;
}

export const onRequestPost = async (context: {
  request: Request;
  env: {
    SESSION_SECRET?: string;
    GITHUB_TOKEN?: string;
    GITHUB_OWNER?: string;
    GITHUB_REPO?: string;
    GITHUB_BRANCH?: string;
    SITE_DATA_PATH?: string;
  };
}) => {
  const { request, env } = context;

  if (!env.SESSION_SECRET || !env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO || !env.GITHUB_BRANCH || !env.SITE_DATA_PATH) {
    return new Response(JSON.stringify({ success: false, error: "لم يتم تكوين متغيرات البيئة المطلوبة" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }

  const sessionSecret = env.SESSION_SECRET;
  const githubToken = env.GITHUB_TOKEN;
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH;
  const path = env.SITE_DATA_PATH;

  // 1. Authenticate Request
  const token = getCookie(request, "admin_session");
  if (!token || !(await verifySessionCookie(sessionSecret, token))) {
    return new Response(JSON.stringify({ success: false, error: "غير مصرح بالدخول" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { data } = (await request.json()) as { data?: unknown };
    
    // 2. Validate Data
    const validationError = validateData(data);
    if (validationError) {
      return new Response(JSON.stringify({ success: false, error: validationError }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const validData = data as CenterData;
    validData.updatedAt = new Date().toISOString();
    const formattedJson = JSON.stringify(validData, null, 2);

    // 3. Get existing file SHA from GitHub
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const getRes = await fetch(getUrl, {
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "User-Agent": "Cloudflare-Pages-Function",
        "Accept": "application/vnd.github.v3+json"
      }
    });

    let sha = "";
    if (getRes.status === 200) {
      const fileInfo = (await getRes.json()) as { sha: string };
      sha = fileInfo.sha;
    } else if (getRes.status !== 404) {
      const errText = await getRes.text();
      return new Response(
        JSON.stringify({ success: false, error: `فشل جلب الملف من GitHub: ${errText}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Update file in GitHub repo
    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const base64Content = utf8ToBase64(formattedJson);
    
    const putRes = await fetch(putUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "User-Agent": "Cloudflare-Pages-Function",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "update site content from admin dashboard",
        content: base64Content,
        sha: sha || undefined,
        branch: branch
      })
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      return new Response(
        JSON.stringify({ success: false, error: `فشل الكتابة في GitHub: ${errText}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "تم تحديث البيانات وجاري بدء عملية بناء جديدة على Cloudflare", updatedAt: validData.updatedAt }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
import type { CenterData } from "../../../data/site-data";
