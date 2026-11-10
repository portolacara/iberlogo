const MAX_BODY_BYTES = 12_000;
const ALLOWED_TOPICS = new Set(["clases", "traduccion", "espanol", "otro"]);

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maxLength) : "";
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  if (!origin || new URL(origin).host !== new URL(request.url).host) {
    return json({ error: "Solicitud no válida." }, 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json({ error: "Formato de solicitud no válido." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return json({ error: "El mensaje es demasiado grande." }, 413);

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "No se pudo leer el mensaje." }, 400);
  }

  // Honeypot: silently accept bot submissions without sending email.
  if (clean(data.website, 200)) return json({ ok: true });

  const name = clean(data.name, 100);
  const email = clean(data.email, 254);
  const tel = clean(data.tel, 40);
  const message = clean(data.msg, 5000);
  const topic = clean(data.topic, 40);
  const token = clean(data.turnstileToken, 2048);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !ALLOWED_TOPICS.has(topic)) {
    return json({ error: "Revisa el nombre, el email, el tema y el mensaje." }, 400);
  }
  if (!token || !env.TURNSTILE_SECRET_KEY) {
    return json({ error: "No se pudo verificar la protección antispam. Recarga la página e inténtalo de nuevo." }, 400);
  }
  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    return json({ error: "El envío de mensajes aún no está configurado." }, 503);
  }

  const verification = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token
  });
  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp) verification.set("remoteip", remoteIp);

  let challenge;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verification
    });
    challenge = await response.json();
  } catch {
    return json({ error: "No se pudo verificar la protección antispam. Inténtalo de nuevo." }, 502);
  }

  if (!challenge.success || challenge.hostname !== new URL(request.url).hostname || challenge.action !== "contact") {
    return json({ error: "La verificación antispam ha caducado o no es válida. Inténtalo de nuevo." }, 400);
  }

  const topicNames = {
    clases: "Clases de inglés",
    traduccion: "Traducción",
    espanol: "Español online",
    otro: "Otro"
  };
  const text = [
    "Nuevo mensaje desde el formulario de contacto de Iberlogo",
    "",
    `Tema: ${topicNames[topic]}`,
    `Nombre: ${name}`,
    `Email: ${email}`,
    `Teléfono: ${tel || "No indicado"}`,
    "",
    "Mensaje:",
    message
  ].join("\n");

  let mailResponse;
  try {
    mailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: "Nuevo mensaje desde la web de Iberlogo",
        text
      })
    });
  } catch {
    return json({ error: "No se pudo enviar el mensaje. Inténtalo de nuevo más tarde." }, 502);
  }

  if (!mailResponse.ok) {
    console.error("Contact email provider returned status", mailResponse.status);
    return json({ error: "No se pudo enviar el mensaje. Inténtalo de nuevo más tarde." }, 502);
  }

  return json({ ok: true });
}
