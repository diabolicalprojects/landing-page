import { and, desc, eq, gte, lt, type SQL } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

import { esquemaFiltroAuditoria, type EntradaAuditoria } from '@diabolical/esquemas';

import { conContexto } from '../db/base';
import { auditoria } from '../db/esquema';
import { ctx, requiere, validar } from '../http';

/*
 * El registro de auditoría, con filtros y paginación por cursor (el id de la
 * última fila vista): estable aunque entren registros nuevos mientras se lee.
 */
export async function rutasAuditoria(app: FastifyInstance): Promise<void> {
    app.get('/auditoria', { preHandler: requiere('auditoria:ver') }, async (req) => {
        const f = validar(esquemaFiltroAuditoria, req.query);
        const condiciones: SQL[] = [];
        if (f.accion) condiciones.push(eq(auditoria.accion, f.accion));
        if (f.usuario) condiciones.push(eq(auditoria.usuarioId, f.usuario));
        if (f.desde) condiciones.push(gte(auditoria.fecha, new Date(`${f.desde}T00:00:00-06:00`)));
        if (f.hasta) condiciones.push(lt(auditoria.fecha, new Date(new Date(`${f.hasta}T00:00:00-06:00`).getTime() + 86_400_000)));
        if (f.antesDe) condiciones.push(lt(auditoria.id, f.antesDe));

        const filas = await conContexto(app.base.db, ctx(req), (tx) =>
            tx
                .select()
                .from(auditoria)
                .where(condiciones.length ? and(...condiciones) : undefined)
                .orderBy(desc(auditoria.id))
                .limit(f.limite + 1)
        );

        const hayMas = filas.length > f.limite;
        const pagina = filas.slice(0, f.limite);
        const entradas: EntradaAuditoria[] = pagina.map((a) => ({
            id: a.id,
            fecha: a.fecha.toISOString(),
            usuario: { id: a.usuarioId, correo: a.usuarioCorreo },
            accion: a.accion,
            entidad: a.entidad,
            entidadId: a.entidadId,
            cambios: a.cambios ?? null,
            ip: a.ip,
        }));
        return { entradas, siguiente: hayMas ? pagina.at(-1)!.id : null };
    });
}
