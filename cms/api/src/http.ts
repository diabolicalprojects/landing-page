import type { FastifyReply, FastifyRequest } from 'fastify';
import type { z } from 'zod';

import { puede, type Permiso, type UsuarioPublico } from '@diabolical/esquemas';

import type { Base, Contexto } from './db/base';
import type { Config } from './config';
import type { Usuario } from './db/esquema';
import type { Enviar } from './correo';
import type { SesionValida } from './seguridad/sesiones';

/*
 * Piezas comunes de las rutas: tipos de Fastify, validación, permisos y la
 * forma pública de un usuario.
 */

declare module 'fastify' {
    interface FastifyInstance {
        base: Base;
        config: Config;
        enviarCorreo: Enviar;
    }
    interface FastifyRequest {
        sesion: SesionValida | null;
    }
}

/** Error con código HTTP y un mensaje que se puede enseñar tal cual en el panel. */
export class ErrorHttp extends Error {
    constructor(
        public readonly codigo: number,
        mensaje: string,
        public readonly campos?: Record<string, string>
    ) {
        super(mensaje);
    }
}

/** Valida con Zod o lanza un 400 con el primer mensaje y el de cada campo. */
export function validar<E extends z.ZodType>(esquema: E, datos: unknown): z.infer<E> {
    const r = esquema.safeParse(datos);
    if (r.success) return r.data;
    const campos: Record<string, string> = {};
    for (const issue of r.error.issues) {
        const clave = issue.path.join('.') || '_';
        campos[clave] ??= issue.message;
    }
    throw new ErrorHttp(400, r.error.issues[0]?.message ?? 'Datos no válidos.', campos);
}

/** preHandler: exige sesión y, si se indica, un permiso del rol. */
export function requiere(permiso?: Permiso) {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        if (!req.sesion) {
            return reply.code(401).send({ error: 'Sesión no válida o caducada.' });
        }
        if (permiso && !puede(req.sesion.usuario.rol, permiso)) {
            return reply.code(403).send({ error: 'El rol de esta cuenta no permite esta acción.' });
        }
        return undefined;
    };
}

/** El contexto de seguridad de la petición, para conContexto. */
export function ctx(req: FastifyRequest): Contexto {
    const u = req.sesion?.usuario;
    if (!u) throw new ErrorHttp(401, 'Sesión no válida o caducada.');
    return { rol: u.rol, usuarioId: u.id };
}

/** Datos de origen para la auditoría. */
export function origen(req: FastifyRequest) {
    return { ip: req.ip, agente: req.headers['user-agent'] };
}

export function usuarioPublico(u: Usuario): UsuarioPublico {
    return {
        id: u.id,
        correo: u.correo,
        nombre: u.nombre,
        rol: u.rol,
        activo: u.activo,
        creadoEn: u.creadoEn.toISOString(),
        ultimoAcceso: u.ultimoAcceso?.toISOString() ?? null,
        bloqueadoHasta: u.bloqueadoHasta && u.bloqueadoHasta > new Date() ? u.bloqueadoHasta.toISOString() : null,
    };
}
