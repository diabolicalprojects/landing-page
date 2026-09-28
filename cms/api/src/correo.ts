import nodemailer, { type Transporter } from 'nodemailer';

import type { Config } from './config';

/*
 * Correo saliente, sin terceros: por SMTP al Postfix de BillionMail que ya
 * corre en el servidor. Sin SMTP configurado (desarrollo, pruebas) no se envía
 * nada y se devuelve false: un aviso que no sale nunca bloquea una operación.
 */

export interface Mensaje {
    para: string;
    asunto: string;
    texto: string;
}

export type Enviar = (m: Mensaje) => Promise<boolean>;

export function crearCorreo(config: Config, registrarError: (e: unknown) => void): Enviar {
    const smtp = config.smtp;
    if (!smtp) return async () => false;

    let transporte: Transporter | null = null;
    return async (m) => {
        try {
            transporte ??= nodemailer.createTransport({
                host: smtp.host,
                port: smtp.puerto,
                secure: smtp.seguro,
                auth: smtp.usuario ? { user: smtp.usuario, pass: smtp.contrasena } : undefined,
            });
            await transporte.sendMail({ from: smtp.remitente, to: m.para, subject: m.asunto, text: m.texto });
            return true;
        } catch (error) {
            registrarError(error);
            return false;
        }
    };
}

const fechaLarga = new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City',
});

/** El aviso de un inicio de sesión desde un dispositivo nuevo. */
export function avisoInicioSesion(datos: { nombre: string; dispositivo: string; ip: string | undefined; fecha: Date }): {
    asunto: string;
    texto: string;
} {
    return {
        asunto: 'Nuevo inicio de sesión en el panel de Diabolical',
        texto: [
            `Hola, ${datos.nombre}.`,
            '',
            'Se inició sesión en el panel de Diabolical desde un dispositivo nuevo:',
            '',
            `  Dispositivo: ${datos.dispositivo}`,
            `  IP: ${datos.ip ?? 'desconocida'}`,
            `  Fecha: ${fechaLarga.format(datos.fecha)}`,
            '',
            'Si no se reconoce este acceso, conviene cambiar la contraseña y cerrar las demás sesiones desde Cuenta, en el panel.',
        ].join('\n'),
    };
}
