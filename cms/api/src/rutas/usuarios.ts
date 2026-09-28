import { and, asc, eq, ne, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import {
    esquemaActualizarUsuario,
    esquemaCrearUsuario,
    esquemaRestablecerContrasena,
} from '@diabolical/esquemas';

import { registrar } from '../auditoria';
import { conContexto, type Tx } from '../db/base';
import { usuarios } from '../db/esquema';
import { ctx, ErrorHttp, origen, requiere, usuarioPublico, validar } from '../http';
import { cifrar, politicaContrasena } from '../seguridad/contrasenas';
import { revocarDeUsuario } from '../seguridad/sesiones';

/*
 * Gestión de usuarios, solo para administradores.
 *
 * No se borran usuarios: se desactivan. Así la auditoría conserva a quién
 * hizo cada cosa. Y siempre queda al menos un administrador activo.
 */

const paramId = z.object({ id: z.uuid('Usuario no válido.') });

async function otrosAdministradoresActivos(tx: Tx, salvo: string): Promise<number> {
    const [r] = await tx
        .select({ n: sql<number>`count(*)::int` })
        .from(usuarios)
        .where(and(eq(usuarios.rol, 'administrador'), eq(usuarios.activo, true), ne(usuarios.id, salvo)));
    return r?.n ?? 0;
}

export async function rutasUsuarios(app: FastifyInstance): Promise<void> {
    const admin = { preHandler: requiere('usuarios:gestionar') };

    app.get('/usuarios', admin, async (req) =>
        conContexto(app.base.db, ctx(req), async (tx) => {
            const lista = await tx.select().from(usuarios).orderBy(asc(usuarios.nombre));
            return lista.map(usuarioPublico);
        })
    );

    app.post('/usuarios', admin, async (req, reply) => {
        const datos = validar(esquemaCrearUsuario, req.body);
        const motivo = politicaContrasena(datos.contrasena, { correo: datos.correo });
        if (motivo) throw new ErrorHttp(400, motivo, { contrasena: motivo });
        const hash = await cifrar(datos.contrasena);
        const yo = req.sesion!.usuario;

        const creado = await conContexto(app.base.db, ctx(req), async (tx) => {
            const existe = await tx.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.correo, datos.correo)).limit(1);
            if (existe.length) {
                throw new ErrorHttp(409, 'Ya existe un usuario con ese correo.', { correo: 'Ya existe un usuario con ese correo.' });
            }
            const [u] = await tx
                .insert(usuarios)
                .values({ correo: datos.correo, nombre: datos.nombre, rol: datos.rol, hash })
                .returning();
            await registrar(tx, {
                usuarioId: yo.id,
                usuarioCorreo: yo.correo,
                accion: 'usuario.crear',
                entidad: 'usuario',
                entidadId: u!.id,
                cambios: { correo: datos.correo, nombre: datos.nombre, rol: datos.rol },
                ...origen(req),
            });
            return u!;
        });
        return reply.code(201).send(usuarioPublico(creado));
    });

    app.patch('/usuarios/:id', admin, async (req) => {
        const { id } = validar(paramId, req.params);
        const cambios = validar(esquemaActualizarUsuario, req.body);
        const yo = req.sesion!.usuario;

        const actualizado = await conContexto(app.base.db, ctx(req), async (tx) => {
            const [antes] = await tx.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
            if (!antes) throw new ErrorHttp(404, 'Ese usuario no existe.');

            const pierdeAdmin =
                antes.rol === 'administrador' &&
                antes.activo &&
                ((cambios.rol && cambios.rol !== 'administrador') || cambios.activo === false);
            if (pierdeAdmin && (await otrosAdministradoresActivos(tx, id)) === 0) {
                throw new ErrorHttp(409, 'Tiene que quedar al menos un administrador activo.');
            }
            if (id === yo.id && cambios.activo === false) {
                throw new ErrorHttp(409, 'Una cuenta no puede desactivarse a sí misma.');
            }

            const [u] = await tx.update(usuarios).set(cambios).where(eq(usuarios.id, id)).returning();
            if (cambios.activo === false) await revocarDeUsuario(tx, id);

            const diff: Record<string, unknown> = {};
            for (const clave of Object.keys(cambios) as (keyof typeof cambios)[]) {
                if (antes[clave] !== cambios[clave]) diff[clave] = { antes: antes[clave], despues: cambios[clave] };
            }
            await registrar(tx, {
                usuarioId: yo.id,
                usuarioCorreo: yo.correo,
                accion: 'usuario.actualizar',
                entidad: 'usuario',
                entidadId: id,
                cambios: diff,
                ...origen(req),
            });
            return u!;
        });
        return usuarioPublico(actualizado);
    });

    app.post('/usuarios/:id/contrasena', admin, async (req) => {
        const { id } = validar(paramId, req.params);
        const { contrasena } = validar(esquemaRestablecerContrasena, req.body);
        const yo = req.sesion!.usuario;

        const destino = await conContexto(app.base.db, ctx(req), async (tx) => {
            const [u] = await tx.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
            return u ?? null;
        });
        if (!destino) throw new ErrorHttp(404, 'Ese usuario no existe.');
        const motivo = politicaContrasena(contrasena, { correo: destino.correo });
        if (motivo) throw new ErrorHttp(400, motivo, { contrasena: motivo });
        const hash = await cifrar(contrasena);

        await conContexto(app.base.db, ctx(req), async (tx) => {
            await tx
                .update(usuarios)
                .set({ hash, contrasenaCambiadaEn: new Date(), intentosFallidos: 0, bloqueos: 0, bloqueadoHasta: null })
                .where(eq(usuarios.id, id));
            await revocarDeUsuario(tx, id, id === yo.id ? req.sesion!.id : undefined);
            await registrar(tx, {
                usuarioId: yo.id,
                usuarioCorreo: yo.correo,
                accion: 'usuario.contrasena',
                entidad: 'usuario',
                entidadId: id,
                ...origen(req),
            });
        });
        return { ok: true };
    });

    app.post('/usuarios/:id/desbloquear', admin, async (req) => {
        const { id } = validar(paramId, req.params);
        const yo = req.sesion!.usuario;
        const u = await conContexto(app.base.db, ctx(req), async (tx) => {
            const [fila] = await tx
                .update(usuarios)
                .set({ intentosFallidos: 0, bloqueos: 0, bloqueadoHasta: null })
                .where(eq(usuarios.id, id))
                .returning();
            if (!fila) throw new ErrorHttp(404, 'Ese usuario no existe.');
            await registrar(tx, {
                usuarioId: yo.id,
                usuarioCorreo: yo.correo,
                accion: 'usuario.actualizar',
                entidad: 'usuario',
                entidadId: id,
                cambios: { desbloqueo: true },
                ...origen(req),
            });
            return fila;
        });
        return usuarioPublico(u);
    });
}
