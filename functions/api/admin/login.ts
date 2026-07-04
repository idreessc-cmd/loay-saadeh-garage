async function generateSessionCookie(secret: string, expiryTime: number): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const payload = expiryTime.toString();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${payload}.${signatureHex}`;
}

export const onRequestPost = async (context: {
  request: Request;
  env: {
    ADMIN_PASSWORD?: string;
    SESSION_SECRET?: string;
  };
}) => {
  const { request, env } = context;

  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return new Response(
      JSON.stringify({ success: false, error: "لم يتم تكوين متغيرات البيئة المطلوبة" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const adminPassword = env.ADMIN_PASSWORD;
  const sessionSecret = env.SESSION_SECRET;

  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password;
    
    if (!password || password !== adminPassword) {
      return new Response(
        JSON.stringify({ success: false, error: "كلمة مرور خاطئة" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    const token = await generateSessionCookie(sessionSecret, expiry);
    
    const cookie = `admin_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`;

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie
        }
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
