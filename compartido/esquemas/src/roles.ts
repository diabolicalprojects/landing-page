/*
 * Roles y permisos del CMS.
 *
 * Tres roles, decididos en la especificación: administrador, editor y solo
 * lectura. La matriz vive aquí para que el panel (que solo oculta lo que el
 * rol no puede hacer) y la API (que es la barrera de verdad, junto con el RLS
 * de Postgres) lean exactamente la misma tabla.
 */

export const ROLES = ['administrador', 'editor', 'lector'] as const;
export type Rol = (typeof ROLES)[number];

export const ETIQUETA_ROL: Record<Rol, string> = {
    administrador: 'Administrador',
    editor: 'Editor',
    lector: 'Solo lectura',
};

export const PERMISOS = [
    'contenido:ver',
    'contenido:editar',
    'solicitudes:ver',
    'solicitudes:gestionar',
    'analitica:ver',
    'ajustes:gestionar',
    'codigo:gestionar',
    'usuarios:gestionar',
    'auditoria:ver',
] as const;
export type Permiso = (typeof PERMISOS)[number];

const MATRIZ: Record<Rol, readonly Permiso[]> = {
    administrador: PERMISOS,
    editor: ['contenido:ver', 'contenido:editar', 'solicitudes:ver', 'solicitudes:gestionar', 'analitica:ver'],
    lector: ['contenido:ver', 'solicitudes:ver', 'analitica:ver'],
};

/** ¿Puede este rol hacer esto? */
export function puede(rol: Rol, permiso: Permiso): boolean {
    return MATRIZ[rol].includes(permiso);
}

/** Todos los permisos de un rol, para mandarlos al panel con la sesión. */
export function permisosDe(rol: Rol): Permiso[] {
    return [...MATRIZ[rol]];
}
