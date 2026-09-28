import { z } from 'zod';

import { ROLES } from './roles';

/*
 * Acceso, usuarios y sesiones.
 *
 * La contraseña: de 8 a 128 caracteres (NIST SP 800-63B). La comprobación
 * contra la lista de contraseñas filtradas se hace solo en el servidor, porque
 * la lista pesa demasiado para el panel.
 */

export const CONTRASENA_MIN = 8;
export const CONTRASENA_MAX = 128;

export const esquemaCorreo = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Escriba un correo válido.').max(254, 'El correo es demasiado largo.'));

export const esquemaContrasena = z
    .string()
    .min(CONTRASENA_MIN, `La contraseña necesita al menos ${CONTRASENA_MIN} caracteres.`)
    .max(CONTRASENA_MAX, `La contraseña admite como mucho ${CONTRASENA_MAX} caracteres.`);

export const esquemaNombre = z
    .string()
    .trim()
    .min(1, 'Escriba un nombre.')
    .max(80, 'El nombre admite como mucho 80 caracteres.');

export const esquemaRol = z.enum(ROLES, { message: 'Elija un rol válido.' });

/** Lo que manda el formulario de acceso. La contraseña no se valida aquí más
 * allá de su tamaño: una política nueva no debe impedir entrar con una vieja. */
export const esquemaInicioSesion = z.object({
    correo: esquemaCorreo,
    contrasena: z.string().min(1, 'Escriba la contraseña.').max(CONTRASENA_MAX),
});
export type InicioSesion = z.infer<typeof esquemaInicioSesion>;

export const esquemaCrearUsuario = z.object({
    correo: esquemaCorreo,
    nombre: esquemaNombre,
    rol: esquemaRol,
    contrasena: esquemaContrasena,
});
export type CrearUsuario = z.infer<typeof esquemaCrearUsuario>;

export const esquemaActualizarUsuario = z
    .object({
        nombre: esquemaNombre.optional(),
        rol: esquemaRol.optional(),
        activo: z.boolean().optional(),
    })
    .refine((d) => Object.keys(d).length > 0, 'No hay cambios que guardar.');
export type ActualizarUsuario = z.infer<typeof esquemaActualizarUsuario>;

export const esquemaRestablecerContrasena = z.object({
    contrasena: esquemaContrasena,
});

export const esquemaCambiarContrasena = z.object({
    actual: z.string().min(1, 'Escriba la contraseña actual.').max(CONTRASENA_MAX),
    nueva: esquemaContrasena,
});
export type CambiarContrasena = z.infer<typeof esquemaCambiarContrasena>;

export const esquemaActualizarCuenta = z.object({
    nombre: esquemaNombre,
});

/** Un usuario tal como sale de la API: nunca con su hash. */
export interface UsuarioPublico {
    id: string;
    correo: string;
    nombre: string;
    rol: (typeof ROLES)[number];
    activo: boolean;
    creadoEn: string;
    ultimoAcceso: string | null;
    bloqueadoHasta: string | null;
}

/** La sesión actual: el usuario y lo que su rol le deja hacer. */
export interface SesionActual {
    usuario: UsuarioPublico;
    permisos: string[];
}

export interface SesionPublica {
    id: string;
    actual: boolean;
    dispositivo: string;
    ip: string | null;
    creadaEn: string;
    ultimoUso: string;
    expiraEn: string;
    usuario?: { id: string; nombre: string; correo: string };
}
