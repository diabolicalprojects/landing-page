import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { puede, type SesionPublica } from '@diabolical/esquemas';

import { registrar } from '../auditoria';
import { conContexto } from '../db/base';
import { sesiones, usuarios } from '../db/esquema';
import { ctx, ErrorHttp, origen, requiere, validar } from '../http';
import { INACTIVIDAD_MS } from '../seguridad/sesiones';

/*
 * Sesiones abiertas y su cierre a distancia. Cada usuario ve y cierra las
 * suyas; un administrador, las de todos (`?todas=1`). El RLS aplica lo mismo
 * en la base de datos: la consulta es igual para los dos.
 */
export async function rutasSesiones(app: FastifyInstance): Promise<void> {
    app.get('/sesiones', { preHandler: requiere() }, async (req) => {
        const { todas } = validar(z.object({ todas: z.enum(['1', '0']).optional() }), req.query);
        const yo = req.sesion!.usuario;
        const verTodas = todas === '1' && puede(yo.rol, 'usuarios:gestionar');
        const ahora = new Date();

        return conContexto(app.base.db, ctx(req), async (tx) => {
            const vivas = and(
                isNull(sesiones.revocadaEn),
                gt(sesiones.expiraEn, ahora),
                gt(sesiones.ultimoUso, new Date(ahora.getTime() - INACTIVIDAD_MS))
            );
            const filas = await tx
                .select({ s: sesiones, u: { id: usuarios.id, nombre: usuarios.nombre, correo: usuarios.correo } })
                .from(sesiones)
                .innerJoin(usuarios, eq(usuarios.id, sesiones.usuarioId))
                .where(verTodas ? vivas : and(vivas, eq(sesiones.usuarioId, yo.id)))
                .orderBy(desc(sesiones.ultimoUso));

            return filas.map(({ s, u }): SesionPublica => ({
                id: s.publico,
                actual: s.id === req.sesion!.id,
                dispositivo: s.dispositivo || 'Dispositivo desconocido',
                ip: s.ip,
                creadaEn: s.creadaEn.toISOString(),
                ultimoUso: s.ultimoUso.toISOString(),
                expiraEn: s.expiraEn.toISOString(),
                ...(verTodas ? { usuario: u } : {}),
            }));
        });
    });

    app.delete('/sesiones/:id', { preHandler: requiere() }, async (req, reply) => {
        const { id } = validar(z.object({ id: z.uuid('Sesión no válida.') }), req.params);
        const yo = req.sesion!.usuario;

        const revocada = await conContexto(app.base.db, ctx(req), async (tx) => {
            // El RLS ya impide tocar sesiones ajenas sin ser administrador: si
            // no es suya ni se puede, simplemente no aparece.
            const [s] = await tx
                .update(sesiones)
                .set({ revocadaEn: new Date() })
                .where(and(eq(sesiones.publico, id), isNull(sesiones.revocadaEn)))
                .returning({ usuarioId: sesiones.usuarioId, id: sesiones.id });
            if (!s) return null;
            await registrar(tx, {
                usuarioId: yo.id,
                usuarioCorreo: yo.correo,
                accion: 'sesion.revocar',
                entidad: 'sesion',
                entidadId: id,
                cambios: { de: s.usuarioId },
                ...origen(req),
            });
            return s;
        });
        if (!revocada) throw new ErrorHttp(404, 'Esa sesión ya no está abierta.');
        return reply.code(204).send();
    });
}
