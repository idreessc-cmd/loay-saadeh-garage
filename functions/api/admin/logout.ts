export const onRequestGet = async () => {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  });
};

export const onRequestPost = onRequestGet;
