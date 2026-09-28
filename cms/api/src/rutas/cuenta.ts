import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

import { esquemaActualizarCuenta, esquemaCambiarContrasena } from '@diabolical/esquemas';

import { registrar } from '../auditoria';
import { conContexto } from '../db/base';
import { auditoria, sesiones, usuarios } from '../db/esquema';
import { ctx, ErrorHttp, origen, requiere, usuarioPublico, validar } from '../http';
import { cifrar, comprobar, politicaContrasena } from '../seguridad/contrasenas';
import { INACTIVIDAD_MS, revocarDeUsuario } from '../seguridad/sesiones';

/*
 * La cuenta propia: nombre, contraseña y un resumen para la pantalla de inicio.
 * Todo con el contexto del propio usuario: el RLS no le deja tocar otra fila.
 */
export async function rutasCuenta(app: FastifyInstance): Promise<void> {
    app.patch('/cuenta', { preHandler: requiere() }, async (req) => {
        const { nombre } = validar(esquemaActualizarCuenta, req.body);
        const yo = req.sesion!.usuario;
        const actualizado = await conContexto(app.base.db, ctx(req), async (tx) => {
            const [u] = await tx.update(usuarios).set({ nombre }).where(eq(usuarios.id, yo.id)).returning();
            await registrar(tx, {
                usuarioId: yo.id,
                usuarioCorreo: yo.correo,
                accion: 'cuenta.actualizar',
                entidad: 'usuario',
                entidadId: yo.id,
                cambios: { nombre: { antes: yo.nombre, despues: nombre } },
                ...origen(req),
            });
            return u!;
        });
        return usuarioPublico(actualizado);
    });

    app.post(
        '/cuenta/contrasena',
        { preHandler: requiere(), config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } },
        async (req) => {
            const { actual, nueva } = validar(esquemaCambiarContrasena, req.body);
            const yo = req.sesion!.usuario;

            if (!(await comprobar(yo.hash, actual))) {
                throw new ErrorHttp(400, 'La contraseña actual no es correcta.', { actual: 'La contraseña actual no es correcta.' });
            }
            const motivo = politicaContrasena(nueva, { correo: yo.correo });
            if (motivo) throw new ErrorHttp(400, motivo, { nueva: motivo });
            if (actual === nueva) {
                throw new ErrorHttp(400, 'La contraseña nueva tiene que ser distinta de la actual.', {
                    nueva: 'Tiene que ser distinta de la actual.',
                });
            }

            const hash = await cifrar(nueva);
            await conContexto(app.base.db, ctx(req), async (tx) => {
                await tx
                    .update(usuarios)
                    .set({ hash, contrasenaCambiadaEn: new Date() })
                    .where(eq(usuarios.id, yo.id));
                // Cambiar la contraseña cierra las demás sesiones: si alguien
                // la tenía, deja de tener acceso en ese momento.
                await revocarDeUsuario(tx, yo.id, req.sesion!.id);
                await registrar(tx, {
                    usuarioId: yo.id,
                    usuarioCorreo: yo.correo,
                    accion: 'cuenta.contrasena',
                    entidad: 'usuario',
                    entidadId: yo.id,
                    ...origen(req),
                });
            });
            return { ok: true };
        }
    );

    /** Resumen de la pantalla de inicio. */
    app.get('/inicio', { preHandler: requiere() }, async (req) => {
        const yo = req.sesion!.usuario;
        return conContexto(app.base.db, ctx(req), async (tx) => {
            const activas = await tx
                .select({ id: sesiones.publico })
                .from(sesiones)
                .where(
                    and(
                        eq(sesiones.usuarioId, yo.id),
                        isNull(sesiones.revocadaEn),
                        gt(sesiones.expiraEn, new Date()),
                        gt(sesiones.ultimoUso, new Date(Date.now() - INACTIVIDAD_MS))
                    )
                );
            const actividad = await tx
                .select()
                .from(auditoria)
                .where(eq(auditoria.usuarioId, yo.id))
                .orderBy(desc(auditoria.fecha), desc(auditoria.id))
                .limit(8);
            const entradas = actividad.filter((a) => a.accion === 'sesion.iniciar');
            // La primera es la de esta misma sesión: la anterior es la segunda.
            const anterior = entradas[1] ?? null;

            return {
                sesionesActivas: activas.length,
                accesoAnterior: anterior ? { fecha: anterior.fecha.toISOString(), ip: anterior.ip } : null,
                actividad: actividad.map((a) => ({
                    id: a.id,
                    fecha: a.fecha.toISOString(),
                    accion: a.accion,
                    entidad: a.entidad,
                    ip: a.ip,
                })),
            };
        });
    });
}
