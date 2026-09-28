import fs from 'node:fs';
import path from 'node:path';

import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import estaticos from '@fastify/static';
import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';

import type { Config } from './config';
import { crearCorreo, type Enviar } from './correo';
import type { Base } from './db/base';
import { ErrorHttp } from './http';
import { rutasAcceso } from './rutas/acceso';
import { rutasAuditoria } from './rutas/auditoria';
import { rutasCuenta } from './rutas/cuenta';
import { rutasSesiones } from './rutas/sesiones';
import { rutasUsuarios } from './rutas/usuarios';
import { registrarCabeceras } from './seguridad/cabeceras';
import { COOKIE, leerSesion } from './seguridad/sesiones';

/*
 * La aplicación: el panel compilado en /admin y la API en /admin/api.
 *
 * Se construye sin escuchar en ningún puerto para que las pruebas la usen con
 * `inject` y el servidor real con `listen`.
 */

export interface OpcionesApp {
    config: Config;
    base: Base;
    /** Sustituye el envío de correo (las pruebas lo espían). */
    enviarCorreo?: Enviar;
}

export async function crearApp({ config, base, enviarCorreo }: OpcionesApp): Promise<FastifyInstance> {
    const app = Fastify({
        trustProxy: config.confiarProxy,
        bodyLimit: 1_000_000,
        // Sin una línea por petición: los logs no guardan IPs ni rutas de cada
        // visita, solo avisos y errores.
        disableRequestLogging: config.produccion,
        logger:
            config.entorno === 'test'
                ? false
                : {
                      level: config.produccion ? 'info' : 'debug',
                      // Las cookies y la autorización nunca llegan a los logs.
                      redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]'],
                  },
    });

    app.decorate('base', base);
    app.decorate('config', config);
    app.decorate(
        'enviarCorreo',
        enviarCorreo ?? crearCorreo(config, (e) => app.log.warn({ err: e }, 'No se pudo enviar un correo'))
    );
    app.decorateRequest('sesion', null);

    await app.register(cookie);
    await app.register(rateLimit, {
        global: true,
        max: 300,
        timeWindow: '1 minute',
        errorResponseBuilder: () => ({
            statusCode: 429,
            error: 'Demasiadas peticiones seguidas. Hay que esperar un momento.',
        }),
    });

    registrarCabeceras(app);

    app.addHook('onRequest', async (req) => {
        req.sesion = null;
        if (!req.url.startsWith('/admin/api/')) return;
        const token = req.cookies[COOKIE];
        if (token) req.sesion = await leerSesion(base.db, token);
    });

    app.setErrorHandler((error: FastifyError | ErrorHttp, req, reply) => {
        if (error instanceof ErrorHttp) {
            return reply.code(error.codigo).send({ error: error.message, ...(error.campos ? { campos: error.campos } : {}) });
        }
        const codigo = (error as { statusCode?: number }).statusCode ?? 500;
        if (codigo === 429) {
            return reply.code(429).send({ error: (error as { error?: string }).error ?? 'Demasiadas peticiones.' });
        }
        // Una política de RLS o el disparador de columnas protegidas.
        if ((error as { code?: string }).code === '42501') {
            return reply.code(403).send({ error: 'El rol de esta cuenta no permite esta acción.' });
        }
        if (codigo < 500) {
            return reply.code(codigo).send({ error: 'Petición no válida.' });
        }
        req.log.error({ err: error }, 'Error no controlado');
        return reply.code(500).send({ error: 'Algo falló en el servidor. El error quedó registrado.' });
    });

    app.get('/admin/api/salud', async () => {
        await base.script('select 1');
        return { estado: 'ok' };
    });

    await app.register(
        async (api) => {
            await rutasAcceso(api);
            await rutasCuenta(api);
            await rutasSesiones(api);
            await rutasUsuarios(api);
            await rutasAuditoria(api);
        },
        { prefix: '/admin/api' }
    );

    // El panel compilado. Los archivos con hash se guardan un año; el HTML,
    // nunca, para que una versión nueva se vea al recargar.
    const indice = path.join(config.panelDir, 'index.html');
    const hayPanel = fs.existsSync(indice);
    if (hayPanel) {
        await app.register(estaticos, {
            root: config.panelDir,
            prefix: '/admin/',
            index: false,
            wildcard: false,
            setHeaders: (res, ruta) => {
                res.header(
                    'Cache-Control',
                    ruta.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache'
                );
            },
        });
    }

    app.get('/admin', async (_req, reply) => reply.redirect('/admin/', 308));

    app.setNotFoundHandler(async (req, reply) => {
        const esPanel = req.method === 'GET' && req.url.startsWith('/admin/') && !req.url.startsWith('/admin/api/');
        if (esPanel && hayPanel) {
            reply.header('Cache-Control', 'no-cache');
            return reply.sendFile('index.html');
        }
        return reply.code(404).send({ error: 'No existe.' });
    });

    return app;
}
