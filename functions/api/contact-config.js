export async function onRequestGet({ env }) {
  if (!env.TURNSTILE_SITE_KEY) {
    return Response.json({ error: "Contact form is not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  return Response.json(
    { siteKey: env.TURNSTILE_SITE_KEY },
    { headers: { "Cache-Control": "no-store" } }
  );
}
