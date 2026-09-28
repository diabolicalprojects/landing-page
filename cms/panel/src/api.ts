/*
 * El cliente de la API. Toda petición lleva la cabecera X-CMS (la API rechaza
 * sin ella cualquier cambio: es parte de la protección CSRF) y la cookie de
 * sesión, que el navegador manda solo porque es del mismo sitio.
 *
 * Un 401 fuera del propio inicio de sesión avisa al resto del panel de que la
 * sesión terminó, para volver a la pantalla de acceso.
 */

export class ErrorApi extends Error {
    constructor(
        public readonly estado: number,
        mensaje: string,
        public readonly campos: Record<string, string> = {}
    ) {
        super(mensaje);
    }
}

export const SESION_CADUCADA = 'cms:sesion-caducada';

type Metodo = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export async function api<T>(ruta: string, opciones: { metodo?: Metodo; cuerpo?: unknown } = {}): Promise<T> {
    const { metodo = 'GET', cuerpo } = opciones;
    let respuesta: Response;
    try {
        respuesta = await fetch(`/admin/api${ruta}`, {
            method: metodo,
            credentials: 'same-origin',
            headers: {
                'x-cms': '1',
                ...(cuerpo !== undefined ? { 'content-type': 'application/json' } : {}),
            },
            body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
        });
    } catch {
        throw new ErrorApi(0, 'Sin conexión con el servidor. Hay que revisar la red y volver a intentarlo.');
    }

    if (respuesta.status === 204) return undefined as T;
    const datos = (await respuesta.json().catch(() => ({}))) as { error?: string; campos?: Record<string, string> };

    if (!respuesta.ok) {
        if (respuesta.status === 401 && !(ruta === '/sesion' && metodo === 'POST')) {
            window.dispatchEvent(new Event(SESION_CADUCADA));
        }
        throw new ErrorApi(respuesta.status, datos.error ?? 'Algo falló. Hay que volver a intentarlo.', datos.campos);
    }
    return datos as T;
}
