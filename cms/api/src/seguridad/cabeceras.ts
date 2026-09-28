import type { FastifyInstance } from 'fastify';

/*
 * Cabeceras de seguridad y protección CSRF.
 *
 * CSP estricta: el panel es una SPA compilada sin scripts ni estilos en línea,
 * así que basta con 'self'. Nada se carga de otros dominios (las fuentes van
 * dentro del paquete).
 *
 * CSRF, en tres capas: la cookie es SameSite=Strict, toda petición que cambia
 * algo tiene que traer la cabecera `X-CMS: 1` (un formulario de otro sitio no
 * puede añadirla sin una comprobación previa que el navegador no le deja
 * pasar) y, si trae Origin, tiene que ser el del sitio.
 */

const CSP = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
].join('; ');

const METODOS_SEGUROS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function registrarCabeceras(app: FastifyInstance): void {
    app.addHook('onRequest', async (req, reply) => {
        if (!req.url.startsWith('/admin/api/') || METODOS_SEGUROS.has(req.method)) return;
        const origen = req.headers.origin;
        if (req.headers['x-cms'] !== '1' || (origen && origen !== app.config.origen)) {
            return reply.code(403).send({ error: 'Petición no permitida.' });
        }
        return undefined;
    });

    app.addHook('onSend', async (req, reply, cuerpo) => {
        reply.header('Content-Security-Policy', CSP);
        reply.header('X-Content-Type-Options', 'nosniff');
        reply.header('X-Frame-Options', 'DENY');
        reply.header('Referrer-Policy', 'no-referrer');
        reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
        reply.header('Cross-Origin-Opener-Policy', 'same-origin');
        reply.header('Cross-Origin-Resource-Policy', 'same-origin');
        if (app.config.produccion) {
            reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
        if (req.url.startsWith('/admin/api/')) {
            reply.header('Cache-Control', 'no-store');
        }
        return cuerpo;
    });
}
