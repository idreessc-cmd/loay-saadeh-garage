const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

type LoginAttempt = {
  failedAttempts: number;
  lockedUntil: number;
};

const loginAttempts = new Map<string, LoginAttempt>();

function getClientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP")?.trim() || "unknown";
}

function getActiveLockout(clientIp: string, now: number): number | null {
  const attempt = loginAttempts.get(clientIp);
  if (!attempt) return null;

  if (attempt.lockedUntil > now) return attempt.lockedUntil;
  if (attempt.lockedUntil !== 0) loginAttempts.delete(clientIp);
  return null;
}

function recordFailedAttempt(clientIp: string, now: number): number | null {
  const current = loginAttempts.get(clientIp);
  const failedAttempts = (current?.failedAttempts ?? 0) + 1;
  const lockedUntil = failedAttempts >= MAX_FAILED_ATTEMPTS
    ? now + LOCKOUT_DURATION_MS
    : 0;

  loginAttempts.set(clientIp, { failedAttempts, lockedUntil });
  return lockedUntil || null;
}

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
  const clientIp = getClientIp(request);
  const now = Date.now();
  const lockedUntil = getActiveLockout(clientIp, now);

  if (lockedUntil) {
    const retryAfterSeconds = Math.max(1, Math.ceil((lockedUntil - now) / 1000));
    return new Response(
      JSON.stringify({ success: false, error: "محاولات كثيرة. حاول مرة أخرى بعد 15 دقيقة" }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfterSeconds.toString()
        }
      }
    );
  }

  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password;
    
    if (!password || password !== adminPassword) {
      const newLockout = recordFailedAttempt(clientIp, now);
      return new Response(
        JSON.stringify({
          success: false,
          error: newLockout
            ? "تم إيقاف محاولات الدخول لمدة 15 دقيقة"
            : "كلمة مرور خاطئة"
        }),
        {
          status: newLockout ? 429 : 401,
          headers: {
            "Content-Type": "application/json",
            ...(newLockout ? { "Retry-After": "900" } : {})
          }
        }
      );
    }

    loginAttempts.delete(clientIp);

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
