import { randomUUID } from 'node:crypto';

import { hash, verify } from '@node-rs/argon2';
import { dictionary } from '@zxcvbn-ts/language-common';

import { esquemaContrasena } from '@diabolical/esquemas';

/*
 * Contraseñas: Argon2id con los parámetros mínimos que recomienda OWASP
 * (19 MiB, 2 pasadas, 1 hilo). El algoritmo por defecto de @node-rs/argon2 ya
 * es Argon2id.
 *
 * La política sigue NIST SP 800-63B: de 8 a 128 caracteres, sin reglas de
 * composición, y rechazo de las contraseñas que aparecen en listas de
 * filtradas. La lista (49.233 contraseñas) va dentro del paquete: no se
 * consulta ningún servicio externo.
 */

const OPCIONES = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

export function cifrar(contrasena: string): Promise<string> {
    return hash(contrasena, OPCIONES);
}

export async function comprobar(guardado: string, contrasena: string): Promise<boolean> {
    try {
        return await verify(guardado, contrasena);
    } catch {
        return false;
    }
}

/**
 * Cuando el correo no existe se comprueba igualmente contra un hash de
 * relleno: la respuesta tarda lo mismo y no delata qué correos tienen cuenta.
 */
let relleno: Promise<string> | null = null;
export async function comprobarRelleno(contrasena: string): Promise<void> {
    relleno ??= cifrar(`relleno-${randomUUID()}`);
    await comprobar(await relleno, contrasena);
}

/** Si subimos los parámetros, los hashes viejos se renuevan al entrar. */
export function necesitaRecifrar(guardado: string): boolean {
    return !guardado.includes(`m=${OPCIONES.memoryCost},t=${OPCIONES.timeCost},p=${OPCIONES.parallelism}`);
}

let comunes: Set<string> | null = null;

/** Devuelve el motivo del rechazo, o null si la contraseña vale. */
export function politicaContrasena(contrasena: string, datos: { correo?: string } = {}): string | null {
    const r = esquemaContrasena.safeParse(contrasena);
    if (!r.success) return r.error.issues[0]?.message ?? 'Contraseña no válida.';

    comunes ??= new Set(
        ((dictionary as Record<string, string[] | undefined>)['passwords-common'] ?? []).map((p) => p.toLowerCase())
    );
    const baja = contrasena.toLowerCase();
    if (comunes.has(baja)) {
        return 'Esa contraseña aparece en listas de contraseñas filtradas. Hace falta otra.';
    }

    const local = datos.correo?.split('@')[0]?.toLowerCase();
    if (local && local.length >= 4 && baja.includes(local)) {
        return 'La contraseña no puede contener el correo.';
    }
    return null;
}
