# Configurar el formulario de contacto en Cloudflare Pages

El sitio puede seguir siendo estático: el envío se procesa con una Cloudflare Pages Function y el correo se entrega mediante Resend. Cloudflare Turnstile protege el formulario contra spam y su token se verifica en el servidor (no basta con el widget del navegador).

## 1. Crear las claves de Turnstile

1. En el panel de Cloudflare, crea un widget Turnstile para los dominios donde se publicará la web (incluye el dominio de producción y, si hace falta, el de vista previa).
2. Usa el modo **Managed**.
3. Guarda la **Site Key** y la **Secret Key**. La Site Key es pública; la Secret Key es privada.

## 2. Preparar el correo

Crea una cuenta/proyecto de Resend, verifica el dominio de envío y genera una API key. El remitente `CONTACT_FROM` debe pertenecer al dominio verificado por Resend, por ejemplo `Iberlogo <web@tu-dominio.es>`; configura `CONTACT_TO` con la dirección que recibirá los mensajes.

## 3. Añadir variables en Cloudflare Pages

En **Workers & Pages → tu proyecto → Settings → Variables and Secrets**, configura estas variables para el entorno de producción (y vista previa si corresponde):

| Variable | Tipo | Valor |
| --- | --- | --- |
| `TURNSTILE_SITE_KEY` | Variable | Site Key del widget |
| `TURNSTILE_SECRET_KEY` | Secret | Secret Key de Turnstile |
| `RESEND_API_KEY` | Secret | API key de Resend |
| `CONTACT_TO` | Variable | Dirección que recibirá los mensajes |
| `CONTACT_FROM` | Variable | Remitente del dominio verificado |

Después de guardar las variables, vuelve a desplegar Pages. No incluyas las claves secretas en el HTML ni en JavaScript.

## 4. Publicar y probar

Conecta el repositorio a Cloudflare Pages y deja la raíz del proyecto como directorio de salida para este sitio sin proceso de build. Pages detectará `functions/api/contact-config.js` y `functions/api/contact.js` al desplegar el proyecto. Prueba el formulario en el dominio publicado: supera Turnstile, envía un mensaje de prueba y confirma que llega al buzón; responde al correo recibido para comprobar que `Reply-To` es la dirección del cliente.

El endpoint requiere el mismo origen, valida los campos, limita el tamaño del mensaje y descarta el campo trampa. Para una defensa adicional en producción, se recomienda configurar una regla de rate limiting de Cloudflare para `/api/contact`.
