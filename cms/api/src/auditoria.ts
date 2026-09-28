import type { Accion } from '@diabolical/esquemas';

import type { Tx } from './db/base';
import { auditoria } from './db/esquema';

/*
 * Una línea en el registro de auditoría. Va dentro de la misma transacción que
 * el cambio: si el cambio se deshace, su registro también, y al revés.
 *
 * Nunca se guardan contraseñas ni hashes en `cambios`.
 */
export interface Registro {
    usuarioId?: string | null;
    usuarioCorreo?: string | null;
    accion: Accion;
    entidad: string;
    entidadId?: string | null;
    cambios?: Record<string, unknown> | null;
    ip?: string | null;
    agente?: string | null;
}

export async function registrar(tx: Tx, r: Registro): Promise<void> {
    await tx.insert(auditoria).values({
        usuarioId: r.usuarioId ?? null,
        usuarioCorreo: r.usuarioCorreo ?? null,
        accion: r.accion,
        entidad: r.entidad,
        entidadId: r.entidadId ?? null,
        cambios: r.cambios ?? null,
        ip: r.ip ?? null,
        agente: r.agente?.slice(0, 400) ?? null,
    });
}
