import assert from "node:assert/strict";
import test from "node:test";

import { serializeJsonForHtmlScript } from "../lib/security.ts";
import { onRequestPost as login } from "../functions/api/admin/login.ts";
import { hasValidImageSignature } from "../functions/api/admin/upload.ts";
import { onRequest as adminSecurityMiddleware } from "../functions/api/admin/_middleware.ts";

test("JSON-LD serialization prevents closing the script element", () => {
  const serialized = serializeJsonForHtmlScript({ value: "</script><script>alert(1)</script>" });
  assert.equal(serialized.includes("</script>"), false);
  assert.match(serialized, /\\u003c\/script\\u003e/);
});

test("login locks an IP after five failed attempts", async () => {
  const env = { ADMIN_PASSWORD: "correct-password", SESSION_SECRET: "test-session-secret" };
  const makeRequest = () => new Request("https://example.com/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "198.51.100.25" },
    body: JSON.stringify({ password: "wrong-password" })
  });

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await login({ request: makeRequest(), env });
    assert.equal(response.status, 401);
  }

  const lockedResponse = await login({ request: makeRequest(), env });
  assert.equal(lockedResponse.status, 429);
  assert.equal(lockedResponse.headers.get("Retry-After"), "900");

  const stillLockedResponse = await login({
    request: new Request("https://example.com/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "CF-Connecting-IP": "198.51.100.25" },
      body: JSON.stringify({ password: "correct-password" })
    }),
    env
  });
  assert.equal(stillLockedResponse.status, 429);
});

test("image signatures accept supported formats and reject disguised files", () => {
  const toBase64 = (bytes) => Buffer.from(bytes).toString("base64");

  assert.equal(hasValidImageSignature(toBase64([0x89, 0x50, 0x4e, 0x47]), "image/png"), true);
  assert.equal(hasValidImageSignature(toBase64([0xff, 0xd8, 0xff]), "image/jpeg"), true);
  assert.equal(hasValidImageSignature(toBase64([
    0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50
  ]), "image/webp"), true);
  assert.equal(hasValidImageSignature(Buffer.from("not an image").toString("base64"), "image/png"), false);
  assert.equal(hasValidImageSignature(Buffer.from("<svg onload='alert(1)'>").toString("base64"), "image/svg+xml"), false);
});

test("admin API middleware disables caching and adds security headers", async () => {
  const response = await adminSecurityMiddleware({
    next: async () => Response.json({ success: true })
  });

  assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(response.headers.get("X-Frame-Options"), "DENY");
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
});
