async function verifySessionCookie(secret: string, cookieValue: string): Promise<boolean> {
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return false;
  const [payload, signatureHex] = parts;
  const expiryTime = parseInt(payload, 10);
  if (isNaN(expiryTime) || expiryTime < Date.now()) return false;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  try {
    const signatureBytes = new Uint8Array(signatureHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const data = encoder.encode(payload);
    return await crypto.subtle.verify("HMAC", key, signatureBytes, data);
  } catch { return false; }
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  for (const c of cookieHeader.split(";").map(c => c.trim())) {
    const [key, val] = c.split("=");
    if (key === name) return val;
  }
  return null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};
const MAX_SIZE = 2 * 1024 * 1024;

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 40);
}

const DEFAULT_PATHS: Record<string, string> = {
  electric: "/electric.png",
  hybrid: "/hybrid.png",
  defaultCar: "/defualt.png",
  ogImage: "/og-image.png",
  favicon: "/favicon.ico",
  logo: "",
  hero: ""
};

async function getRefSha(owner: string, repo: string, branch: string, token: string): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": "Cloudflare-Pages-Function", Accept: "application/vnd.github.v3+json" }
  });
  if (!res.ok) throw new Error("فشل في قراءة ref من GitHub");
  const data = (await res.json()) as { object: { sha: string } };
  return data.object.sha;
}

async function getCommitTree(owner: string, repo: string, commitSha: string, token: string): Promise<{ treeSha: string; tree: GitTreeEntry[] }> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/commits/${commitSha}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": "Cloudflare-Pages-Function", Accept: "application/vnd.github.v3+json" }
  });
  if (!res.ok) throw new Error("فشل في قراءة commit من GitHub");
  const data = (await res.json()) as { tree: { sha: string }; sha: string };
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${data.tree.sha}?recursive=1`;
  const treeRes = await fetch(treeUrl, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": "Cloudflare-Pages-Function", Accept: "application/vnd.github.v3+json" }
  });
  if (!treeRes.ok) throw new Error("فشل في قراءة tree من GitHub");
  const treeData = (await treeRes.json()) as { sha: string; tree: GitTreeEntry[] };
  return { treeSha: treeData.sha, tree: treeData.tree };
}

async function createBlob(owner: string, repo: string, content: string, encoding: "base64" | "utf-8", token: string): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/blobs`;
  const body: { content: string; encoding: "base64" | "utf-8" } = { content, encoding };
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "User-Agent": "Cloudflare-Pages-Function", "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`فشل في إنشاء blob: ${errText}`);
  }
  const data = (await res.json()) as { sha: string };
  return data.sha;
}

export function hasValidImageSignature(base64: string, mimeType: string): boolean {
  try {
    const prefix = base64.replace(/\s/g, "").slice(0, 32);
    const binary = atob(prefix);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

    if (mimeType === "image/png") {
      return bytes.length >= 4 &&
        bytes[0] === 0x89 && bytes[1] === 0x50 &&
        bytes[2] === 0x4e && bytes[3] === 0x47;
    }

    if (mimeType === "image/jpeg") {
      return bytes.length >= 3 &&
        bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    }

    if (mimeType === "image/webp") {
      return bytes.length >= 12 &&
        bytes[0] === 0x52 && bytes[1] === 0x49 &&
        bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 &&
        bytes[10] === 0x42 && bytes[11] === 0x50;
    }

    return false;
  } catch {
    return false;
  }
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
  const siteDataPath = env.SITE_DATA_PATH;

  const token = getCookie(request, "admin_session");
  if (!token || !(await verifySessionCookie(sessionSecret, token))) {
    return new Response(JSON.stringify({ success: false, error: "غير مصرح بالدخول" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  try {
    const body = (await request.json()) as { image?: string; filename?: string; key?: string; contentType?: string; restoreDefault?: boolean; imageKey?: string };
    
    const { image, filename, key, contentType, restoreDefault, imageKey } = body;

    // Handle restoring default path
    if (restoreDefault && imageKey) {
      const safeKey = sanitizeKey(imageKey);
      const defaultPath = DEFAULT_PATHS[safeKey];
      if (defaultPath === undefined) {
        return new Response(JSON.stringify({ success: false, error: "مفتاح الصورة غير موجود" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      // Fetch current site-data.json to update
      const dataUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${siteDataPath}?ref=${branch}`;
      const dataRes = await fetch(dataUrl, {
        headers: { Authorization: `Bearer ${githubToken}`, "User-Agent": "Cloudflare-Pages-Function", Accept: "application/vnd.github.v3+json" }
      });
      if (dataRes.status !== 200) {
        return new Response(JSON.stringify({ success: false, error: "فشل في قراءة ملف البيانات" }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
      const dataFile = (await dataRes.json()) as { sha: string; content: string };
      const decoded = atob(dataFile.content.replace(/\n/g, ""));
      const jsonData = JSON.parse(decoded);

      const oldPath = jsonData.images[safeKey] || "";
      jsonData.images[safeKey] = defaultPath;
      jsonData.updatedAt = new Date().toISOString();
      if (!jsonData.mediaHistory) jsonData.mediaHistory = [];
      jsonData.mediaHistory.unshift({ timestamp: jsonData.updatedAt, key: safeKey, oldPath, newPath: defaultPath });
      if (jsonData.mediaHistory.length > 5) jsonData.mediaHistory.length = 5;

      const formattedJson = JSON.stringify(jsonData, null, 2);
      const base64Json = btoa(new TextEncoder().encode(formattedJson).reduce((s, b) => s + String.fromCharCode(b), ""));

      const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${siteDataPath}`;
      const putRes = await fetch(putUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${githubToken}`, "User-Agent": "Cloudflare-Pages-Function", "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" },
        body: JSON.stringify({ message: `restore default image: ${safeKey}`, content: base64Json, sha: dataFile.sha, branch })
      });
      if (!putRes.ok) {
        const errText = await putRes.text();
        return new Response(JSON.stringify({ success: false, error: `فشل حفظ البيانات: ${errText}` }), { status: 500, headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ success: true, message: "تم استرجاع المسار الافتراضي", newPath: defaultPath, updatedAt: jsonData.updatedAt }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Validate file upload
    if (!image || !filename || !key) {
      return new Response(JSON.stringify({ success: false, error: "البيانات غير مكتملة: image, filename, key مطلوبة" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const safeKey = sanitizeKey(key);
    if (!DEFAULT_PATHS.hasOwnProperty(safeKey)) {
      return new Response(JSON.stringify({ success: false, error: "مفتاح الصورة غير صالح" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Determine MIME type from base64 prefix, then from provided contentType, then from filename
    let mimeType = "";
    if (image.startsWith("data:")) {
      mimeType = image.substring(5, image.indexOf(";"));
    } else if (contentType) {
      mimeType = contentType;
    } else {
      const ext = filename.split(".").pop()?.toLowerCase();
      const extMap: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
      mimeType = extMap[ext || ""] || "image/png";
    }

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return new Response(JSON.stringify({ success: false, error: `نوع الملف غير مسموح: ${mimeType}. المسموح: jpg, png, webp` }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Extract raw base64 data
    let rawBase64 = image;
    if (rawBase64.includes("base64,")) {
      rawBase64 = rawBase64.substring(rawBase64.indexOf("base64,") + 7);
    }

    if (!hasValidImageSignature(rawBase64, mimeType)) {
      return new Response(JSON.stringify({ success: false, error: "محتوى الملف لا يطابق نوع الصورة المحدد" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Validate size
    const decodedSize = Math.ceil((rawBase64.length * 3) / 4);
    if (decodedSize > MAX_SIZE) {
      return new Response(JSON.stringify({ success: false, error: `حجم الملف كبير جداً: ${(decodedSize / 1024 / 1024).toFixed(2)}MB. الحد الأقصى: 2MB` }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Generate safe filename
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    const ext = ALLOWED_EXTENSIONS[mimeType] || ".png";
    const safeFilename = `${safeKey}-${dateStr}-${timeStr}${ext}`;
    const uploadPath = `public/uploads/${safeFilename}`;

    // Fetch current commit ref
    const refSha = await getRefSha(owner, repo, branch, githubToken);

    // Fetch current site-data.json content and sha
    const dataUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${siteDataPath}?ref=${branch}`;
    const dataRes = await fetch(dataUrl, {
      headers: { Authorization: `Bearer ${githubToken}`, "User-Agent": "Cloudflare-Pages-Function", Accept: "application/vnd.github.v3+json" }
    });
    if (dataRes.status !== 200) {
      return new Response(JSON.stringify({ success: false, error: "فشل في قراءة ملف البيانات من GitHub" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    const dataFile = (await dataRes.json()) as { sha: string; content: string };
    const decodedData = atob(dataFile.content.replace(/\n/g, ""));
    const jsonData = JSON.parse(decodedData);

    const oldPath = jsonData.images[safeKey] || "";
    const newPath = `/uploads/${safeFilename}`;
    jsonData.images[safeKey] = newPath;
    jsonData.updatedAt = now.toISOString();
    if (!jsonData.mediaHistory) jsonData.mediaHistory = [];
    jsonData.mediaHistory.unshift({ timestamp: jsonData.updatedAt, key: safeKey, oldPath, newPath });
    if (jsonData.mediaHistory.length > 5) jsonData.mediaHistory.length = 5;

    const formattedJson = JSON.stringify(jsonData, null, 2);
    const jsonBytes = new TextEncoder().encode(formattedJson);

    // Create blobs for both files
    const imageBlobSha = await createBlob(owner, repo, rawBase64, "base64", githubToken);

    const uint8Array = new Uint8Array(jsonBytes.length);
    for (let i = 0; i < jsonBytes.length; i++) {
      uint8Array[i] = jsonBytes[i];
    }
    let binaryString = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const jsonBase64 = btoa(binaryString);

    const jsonBlobSha = await createBlob(owner, repo, jsonBase64, "base64", githubToken);

    // Get current tree
    const { treeSha, tree } = await getCommitTree(owner, repo, refSha, githubToken);

    // Build new tree: keep all existing entries, add/update the image and site-data.json
    const newTree = tree
      .filter((entry) => entry.path !== uploadPath && entry.path !== siteDataPath)
      .map((entry) => ({ path: entry.path, mode: entry.mode, type: entry.type, sha: entry.sha }));
    newTree.push({ path: uploadPath, mode: "100644", type: "blob", sha: imageBlobSha });
    newTree.push({ path: siteDataPath, mode: "100644", type: "blob", sha: jsonBlobSha });

    // Create new tree
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees`;
    const treeRes = await fetch(treeUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${githubToken}`, "User-Agent": "Cloudflare-Pages-Function", "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({ base_tree: treeSha, tree: newTree })
    });
    if (!treeRes.ok) {
      const errText = await treeRes.text();
      return new Response(JSON.stringify({ success: false, error: `فشل إنشاء tree: ${errText}` }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    const treeData = (await treeRes.json()) as { sha: string };

    // Create commit
    const commitUrl = `https://api.github.com/repos/${owner}/${repo}/git/commits`;
    const commitRes = await fetch(commitUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${githubToken}`, "User-Agent": "Cloudflare-Pages-Function", "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({
        message: `upload image: ${safeKey} → ${safeFilename}`,
        tree: treeData.sha,
        parents: [refSha]
      })
    });
    if (!commitRes.ok) {
      const errText = await commitRes.text();
      return new Response(JSON.stringify({ success: false, error: `فشل إنشاء commit: ${errText}` }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    const commitData = (await commitRes.json()) as { sha: string };

    // Update branch ref
    const refUrl = `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`;
    const refRes = await fetch(refUrl, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${githubToken}`, "User-Agent": "Cloudflare-Pages-Function", "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({ sha: commitData.sha, force: false })
    });
    if (!refRes.ok) {
      const errText = await refRes.text();
      return new Response(JSON.stringify({ success: false, error: `فشل تحديث ref: ${errText}` }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "تم رفع الصورة وتحديث البيانات. سيظهر التغيير بعد انتهاء نشر Cloudflare خلال دقائق.",
      newPath,
      filename: safeFilename,
      updatedAt: jsonData.updatedAt
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return new Response(JSON.stringify({ success: false, error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
type GitTreeEntry = {
  path: string;
  mode: string;
  type: string;
  sha: string;
};
