import { z } from 'zod';

/*
 * El registro de auditoría: quién cambió qué, cuándo y desde qué IP.
 *
 * Las acciones son un catálogo cerrado para poder filtrarlas y nombrarlas en
 * el panel; una acción nueva se añade aquí primero.
 */

export const ACCIONES = {
    'sesion.iniciar': 'Inició sesión',
    'sesion.fallo': 'Intento de acceso fallido',
    'sesion.bloqueo': 'Cuenta bloqueada por intentos',
    'sesion.cerrar': 'Cerró sesión',
    'sesion.revocar': 'Cerró una sesión a distancia',
    'usuario.crear': 'Creó un usuario',
    'usuario.actualizar': 'Cambió un usuario',
    'usuario.contrasena': 'Restableció una contraseña',
    'cuenta.actualizar': 'Cambió su cuenta',
    'cuenta.contrasena': 'Cambió su contraseña',
} as const;
export type Accion = keyof typeof ACCIONES;

export const esquemaFiltroAuditoria = z.object({
    accion: z.string().max(40).optional(),
    usuario: z.uuid().optional(),
    desde: z.iso.date().optional(),
    hasta: z.iso.date().optional(),
    antesDe: z.coerce.number().int().positive().optional(),
    limite: z.coerce.number().int().min(1).max(100).default(50),
});
export type FiltroAuditoria = z.infer<typeof esquemaFiltroAuditoria>;

export interface EntradaAuditoria {
    id: number;
    fecha: string;
    usuario: { id: string | null; correo: string | null };
    accion: string;
    entidad: string;
    entidadId: string | null;
    cambios: Record<string, unknown> | null;
    ip: string | null;
}
