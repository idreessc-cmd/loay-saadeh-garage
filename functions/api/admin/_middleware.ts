export const onRequest = async (context: {
  next: () => Promise<Response>;
}): Promise<Response> => {
  const response = await context.next();
  const headers = new Headers(response.headers);

  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "no-referrer");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
