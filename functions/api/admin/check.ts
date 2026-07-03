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

export const onRequestGet = async (context: {
  request: Request;
  env: {
    SESSION_SECRET?: string;
  };
}) => {
  const { request, env } = context;
  const sessionSecret = env.SESSION_SECRET || "default_session_secret_change_me";

  const token = getCookie(request, "admin_session");
  if (!token) {
    return new Response(JSON.stringify({ authenticated: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  const isValid = await verifySessionCookie(sessionSecret, token);
  
  return new Response(JSON.stringify({ authenticated: isValid }), {
    headers: { "Content-Type": "application/json" }
  });
};
export const onRequestPost = onRequestGet; // Allow POST as well
