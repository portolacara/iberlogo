function json() {
  return Response.json(
    { error: "El formulario de contacto por email ya no está disponible. Contacta con Iberlogo por teléfono o WhatsApp." },
    { status: 410, headers: { "Cache-Control": "no-store" } }
  );
}

export async function onRequestGet() { return json(); }
export async function onRequestPost() { return json(); }
export async function onRequestPut() { return json(); }
export async function onRequestDelete() { return json(); }
