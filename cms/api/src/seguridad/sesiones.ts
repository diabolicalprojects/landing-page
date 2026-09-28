import { createHash, randomBytes } from 'node:crypto';

import { and, eq, gt, isNull, lt, ne, or } from 'drizzle-orm';

import { conContexto, SISTEMA, type Db, type Tx } from '../db/base';
import { sesiones, usuarios, type Usuario } from '../db/esquema';

/*
 * Sesiones en base de datos, revocables en cualquier momento.
 *
 * La cookie lleva un token aleatorio de 256 bits; la base de datos guarda solo
 * su SHA-256. Quien lea la tabla no puede entrar con lo que ve.
 *
 *   Inactividad   7 días sin usarla y caduca.
 *   Vida máxima   30 días desde que se abrió, se use o no.
 */

export const COOKIE = 'cms_sesion';
export const INACTIVIDAD_MS = 7 * 24 * 60 * 60 * 1000;
export const VIDA_MS = 30 * 24 * 60 * 60 * 1000;
const RENOVAR_MS = 5 * 60 * 1000;

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export interface DatosSesion {
    usuarioId: string;
    ip: string | undefined;
    agente: string | undefined;
    dispositivo: string;
}

export async function crearSesion(tx: Tx, datos: DatosSesion): Promise<{ token: string; expira: Date }> {
    const token = randomBytes(32).toString('base64url');
    const expira = new Date(Date.now() + VIDA_MS);
    await tx.insert(sesiones).values({
        id: hashToken(token),
        usuarioId: datos.usuarioId,
        ip: datos.ip ?? null,
        agente: datos.agente?.slice(0, 400) ?? null,
        dispositivo: datos.dispositivo,
        expiraEn: expira,
    });
    return { token, expira };
}

export interface SesionValida {
    id: string;
    publico: string;
    usuario: Usuario;
}

/** La sesión de una cookie, si sigue viva y su usuario está activo. */
export async function leerSesion(db: Db, token: string): Promise<SesionValida | null> {
    if (!token || token.length > 100) return null;
    const id = hashToken(token);
    const ahora = new Date();

    return conContexto(db, SISTEMA, async (tx) => {
        const [fila] = await tx
            .select({ sesion: sesiones, usuario: usuarios })
            .from(sesiones)
            .innerJoin(usuarios, eq(usuarios.id, sesiones.usuarioId))
            .where(
                and(
                    eq(sesiones.id, id),
                    isNull(sesiones.revocadaEn),
                    gt(sesiones.expiraEn, ahora),
                    gt(sesiones.ultimoUso, new Date(ahora.getTime() - INACTIVIDAD_MS)),
                    eq(usuarios.activo, true)
                )
            )
            .limit(1);
        if (!fila) return null;

        // No se escribe en cada petición: basta con renovar cada pocos minutos.
        if (ahora.getTime() - fila.sesion.ultimoUso.getTime() > RENOVAR_MS) {
            await tx.update(sesiones).set({ ultimoUso: ahora }).where(eq(sesiones.id, id));
        }
        return { id, publico: fila.sesion.publico, usuario: fila.usuario };
    });
}

/** Revoca todas las sesiones de un usuario menos, si se indica, una. */
export async function revocarDeUsuario(tx: Tx, usuarioId: string, salvo?: string): Promise<void> {
    const condicion = salvo
        ? and(eq(sesiones.usuarioId, usuarioId), isNull(sesiones.revocadaEn), ne(sesiones.id, salvo))
        : and(eq(sesiones.usuarioId, usuarioId), isNull(sesiones.revocadaEn));
    await tx.update(sesiones).set({ revocadaEn: new Date() }).where(condicion);
}

/** Borra lo que ya no sirve ni para el historial: sesiones caducadas hace más de 30 días. */
export async function limpiarSesiones(db: Db): Promise<void> {
    const limite = new Date(Date.now() - VIDA_MS);
    await conContexto(db, SISTEMA, (tx) =>
        tx.delete(sesiones).where(or(lt(sesiones.expiraEn, limite), lt(sesiones.revocadaEn, limite)))
    );
}
