import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

/*
 * Configuración del CMS, toda desde variables de entorno y validada al
 * arrancar: una variable mal escrita tumba el arranque con un mensaje claro en
 * vez de descubrirse con el primer usuario.
 *
 * CMS_BASE_DATOS admite tres formas:
 *   postgres://usuario:clave@host:5432/base   producción (usuario cms_app)
 *   pglite:./.datos                           desarrollo, en disco
 *   pglite:memoria                            pruebas
 */

const aqui = path.dirname(fileURLToPath(import.meta.url));

const booleano = z
    .enum(['1', '0', 'true', 'false', 'si', 'no'])
    .transform((v) => v === '1' || v === 'true' || v === 'si');

const esquema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CMS_PUERTO: z.coerce.number().int().min(1).max(65535).default(3100),
    CMS_HOST: z.string().default('0.0.0.0'),
    /** Origen público del sitio, para comprobar la cabecera Origin. */
    CMS_ORIGEN: z.url().default('http://localhost:5174'),
    CMS_BASE_DATOS: z.string().min(1).default('pglite:./.datos'),
    /** Conexión con el dueño del esquema, solo para migrar. Si falta, se usa la de arriba. */
    CMS_BASE_DATOS_MIGRAR: z.string().optional(),
    CMS_COOKIE_SEGURA: booleano.optional(),
    /** Detrás de Traefik: la IP real llega en X-Forwarded-For. */
    CMS_CONFIAR_PROXY: booleano.default(false),
    CMS_PANEL_DIR: z.string().optional(),
    /** Intentos de inicio de sesión por IP cada 15 minutos. */
    CMS_LIMITE_ACCESO: z.coerce.number().int().min(1).default(10),
    SMTP_HOST: z.string().optional(),
    SMTP_PUERTO: z.coerce.number().int().default(587),
    SMTP_SEGURO: booleano.default(false),
    SMTP_USUARIO: z.string().optional(),
    SMTP_CONTRASENA: z.string().optional(),
    SMTP_REMITENTE: z.string().default('Panel Diabolical <panel@diabolicalservices.tech>'),
});

export interface Config {
    entorno: 'development' | 'production' | 'test';
    produccion: boolean;
    puerto: number;
    host: string;
    origen: string;
    baseDatos: string;
    baseDatosMigrar: string;
    cookieSegura: boolean;
    confiarProxy: boolean;
    panelDir: string;
    limiteAcceso: number;
    smtp: {
        host: string;
        puerto: number;
        seguro: boolean;
        usuario?: string;
        contrasena?: string;
        remitente: string;
    } | null;
}

export function leerConfig(entorno: NodeJS.ProcessEnv = process.env): Config {
    const r = esquema.safeParse(entorno);
    if (!r.success) {
        const detalle = r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        throw new Error(`Configuración del CMS no válida: ${detalle}`);
    }
    const e = r.data;
    const produccion = e.NODE_ENV === 'production';
    return {
        entorno: e.NODE_ENV,
        produccion,
        puerto: e.CMS_PUERTO,
        host: e.CMS_HOST,
        origen: new URL(e.CMS_ORIGEN).origin,
        baseDatos: e.CMS_BASE_DATOS,
        baseDatosMigrar: e.CMS_BASE_DATOS_MIGRAR ?? e.CMS_BASE_DATOS,
        cookieSegura: e.CMS_COOKIE_SEGURA ?? produccion,
        confiarProxy: e.CMS_CONFIAR_PROXY,
        panelDir: e.CMS_PANEL_DIR ?? path.resolve(aqui, '../../panel/dist'),
        limiteAcceso: e.CMS_LIMITE_ACCESO,
        smtp: e.SMTP_HOST
            ? {
                  host: e.SMTP_HOST,
                  puerto: e.SMTP_PUERTO,
                  seguro: e.SMTP_SEGURO,
                  usuario: e.SMTP_USUARIO,
                  contrasena: e.SMTP_CONTRASENA,
                  remitente: e.SMTP_REMITENTE,
              }
            : null,
    };
}
