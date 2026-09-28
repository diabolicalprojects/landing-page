import { and, eq, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

import { esquemaInicioSesion, permisosDe, type SesionActual } from '@diabolical/esquemas';

import { registrar } from '../auditoria';
import { avisoInicioSesion } from '../correo';
import { conContexto, SISTEMA } from '../db/base';
import { dispositivos, sesiones, usuarios } from '../db/esquema';
import { origen, requiere, usuarioPublico, validar } from '../http';
import { cifrar, comprobar, comprobarRelleno, necesitaRecifrar } from '../seguridad/contrasenas';
import { describirAgente, huellaDispositivo } from '../seguridad/dispositivo';
import { COOKIE, crearSesion, VIDA_MS } from '../seguridad/sesiones';

/*
 * Iniciar y cerrar sesión.
 *
 * Sin 2FA (riesgo aceptado en la especificación). Compensaciones:
 *   - Límite por IP: 10 intentos cada 15 minutos (CMS_LIMITE_ACCESO).
 *   - Bloqueo por cuenta: 5 fallos seguidos la bloquean 15 minutos; cada
 *     bloqueo nuevo dobla la espera, hasta 24 horas.
 *   - El mismo mensaje y el mismo tiempo de respuesta para un correo que no
 *     existe, una cuenta desactivada o una contraseña incorrecta.
 *   - Aviso por correo de cada entrada desde un dispositivo nuevo.
 */

export const FALLOS_PARA_BLOQUEO = 5;
const BLOQUEO_BASE_MS = 15 * 60 * 1000;
const BLOQUEO_MAX_MS = 24 * 60 * 60 * 1000;

const CREDENCIALES = 'Correo o contraseña incorrectos.';
const BLOQUEADA = 'Demasiados intentos. Hay que esperar unos minutos antes de volver a intentarlo.';

export function duracionBloqueo(bloqueosPrevios: number): number {
    return Math.min(BLOQUEO_BASE_MS * 2 ** bloqueosPrevios, BLOQUEO_MAX_MS);
}

export async function rutasAcceso(app: FastifyInstance): Promise<void> {
    const opcionesCookie = () => ({
        path: '/admin',
        httpOnly: true,
        secure: app.config.cookieSegura,
        sameSite: 'strict' as const,
    });

    app.post(
        '/sesion',
        { config: { rateLimit: { max: app.config.limiteAcceso, timeWindow: '15 minutes' } } },
        async (req, reply) => {
            const { correo, contrasena } = validar(esquemaInicioSesion, req.body);
            const { ip, agente } = origen(req);
            const ahora = new Date();

            const usuario = await conContexto(app.base.db, SISTEMA, async (tx) => {
                const [u] = await tx.select().from(usuarios).where(eq(usuarios.correo, correo)).limit(1);
                return u ?? null;
            });

            if (!usuario) {
                await comprobarRelleno(contrasena);
                await conContexto(app.base.db, SISTEMA, (tx) =>
                    registrar(tx, { usuarioCorreo: correo, accion: 'sesion.fallo', entidad: 'sesion', ip, agente, cambios: { motivo: 'correo' } })
                );
                return reply.code(401).send({ error: CREDENCIALES });
            }

            if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > ahora) {
                return reply.code(429).send({ error: BLOQUEADA });
            }

            const valida = await comprobar(usuario.hash, contrasena);

            if (!valida || !usuario.activo) {
                await conContexto(app.base.db, SISTEMA, async (tx) => {
                    if (!valida) {
                        const intentos = usuario.intentosFallidos + 1;
                        if (intentos >= FALLOS_PARA_BLOQUEO) {
                            const hasta = new Date(ahora.getTime() + duracionBloqueo(usuario.bloqueos));
                            await tx
                                .update(usuarios)
                                .set({ intentosFallidos: 0, bloqueos: usuario.bloqueos + 1, bloqueadoHasta: hasta })
                                .where(eq(usuarios.id, usuario.id));
                            await registrar(tx, {
                                usuarioId: usuario.id,
                                usuarioCorreo: usuario.correo,
                                accion: 'sesion.bloqueo',
                                entidad: 'usuario',
                                entidadId: usuario.id,
                                cambios: { hasta: hasta.toISOString() },
                                ip,
                                agente,
                            });
                        } else {
                            await tx.update(usuarios).set({ intentosFallidos: intentos }).where(eq(usuarios.id, usuario.id));
                        }
                    }
                    await registrar(tx, {
                        usuarioId: usuario.id,
                        usuarioCorreo: usuario.correo,
                        accion: 'sesion.fallo',
                        entidad: 'sesion',
                        cambios: { motivo: valida ? 'inactivo' : 'contrasena' },
                        ip,
                        agente,
                    });
                });
                return reply.code(401).send({ error: CREDENCIALES });
            }

            const dispositivo = describirAgente(agente);
            const huella = huellaDispositivo(agente, ip);
            const recifrar = necesitaRecifrar(usuario.hash) ? await cifrar(contrasena) : null;

            const { token, nuevo } = await conContexto(app.base.db, SISTEMA, async (tx) => {
                await tx
                    .update(usuarios)
                    .set({
                        intentosFallidos: 0,
                        bloqueos: 0,
                        bloqueadoHasta: null,
                        ultimoAcceso: ahora,
                        ...(recifrar ? { hash: recifrar } : {}),
                    })
                    .where(eq(usuarios.id, usuario.id));

                const conocido = await tx
                    .select({ huella: dispositivos.huella })
                    .from(dispositivos)
                    .where(and(eq(dispositivos.usuarioId, usuario.id), eq(dispositivos.huella, huella)))
                    .limit(1);
                if (conocido.length) {
                    await tx
                        .update(dispositivos)
                        .set({ vistoUltimo: ahora })
                        .where(and(eq(dispositivos.usuarioId, usuario.id), eq(dispositivos.huella, huella)));
                } else {
                    await tx.insert(dispositivos).values({ usuarioId: usuario.id, huella, descripcion: dispositivo });
                }

                const s = await crearSesion(tx, { usuarioId: usuario.id, ip, agente, dispositivo });
                await registrar(tx, {
                    usuarioId: usuario.id,
                    usuarioCorreo: usuario.correo,
                    accion: 'sesion.iniciar',
                    entidad: 'sesion',
                    cambios: { dispositivo, nuevo: !conocido.length },
                    ip,
                    agente,
                });
                return { token: s.token, nuevo: !conocido.length };
            });

            if (nuevo) {
                // Sin esperar: un correo lento no retrasa la entrada.
                const aviso = avisoInicioSesion({ nombre: usuario.nombre, dispositivo, ip, fecha: ahora });
                void app.enviarCorreo({ para: usuario.correo, ...aviso });
            }

            reply.setCookie(COOKIE, token, { ...opcionesCookie(), maxAge: Math.floor(VIDA_MS / 1000) });
            const cuerpo: SesionActual = {
                usuario: usuarioPublico({ ...usuario, ultimoAcceso: ahora, bloqueadoHasta: null }),
                permisos: permisosDe(usuario.rol),
            };
            return cuerpo;
        }
    );

    app.get('/sesion', { preHandler: requiere() }, async (req) => {
        const u = req.sesion!.usuario;
        const cuerpo: SesionActual = { usuario: usuarioPublico(u), permisos: permisosDe(u.rol) };
        return cuerpo;
    });

    app.delete('/sesion', async (req, reply) => {
        if (req.sesion) {
            const s = req.sesion;
            await conContexto(app.base.db, { rol: s.usuario.rol, usuarioId: s.usuario.id }, async (tx) => {
                await tx.update(sesiones).set({ revocadaEn: sql`now()` }).where(eq(sesiones.id, s.id));
                await registrar(tx, {
                    usuarioId: s.usuario.id,
                    usuarioCorreo: s.usuario.correo,
                    accion: 'sesion.cerrar',
                    entidad: 'sesion',
                    ...origen(req),
                });
            });
        }
        reply.clearCookie(COOKIE, opcionesCookie());
        return reply.code(204).send();
    });
}
