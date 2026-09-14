import { N8N_WEBHOOK_URL, WHATSAPP_PHONE } from '../config';

/**
 * Abre WhatsApp con el mensaje prellenado.
 *
 * Android e iOS necesitan el esquema nativo (`intent://` / `whatsapp://`): con
 * la URL https algunos navegadores (Opera GX entre ellos) se quedan colgados en
 * una pestaña en blanco. En escritorio se usa api.whatsapp.com en pestaña nueva.
 */
export function openWhatsApp(message) {
    const encoded = encodeURIComponent(message);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    let url = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encoded}`;
    if (isAndroid) {
        url = `intent://send/?phone=${WHATSAPP_PHONE}&text=${encoded}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
    } else if (isIOS) {
        url = `whatsapp://send?phone=${WHATSAPP_PHONE}&text=${encoded}`;
    }

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = isAndroid || isIOS ? '_top' : '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => anchor.remove(), 150);
}

const TIEMPO_LIMITE = 8000;

async function enviarA(url, payload, opciones = {}) {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), TIEMPO_LIMITE);

    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controlador.signal,
            ...opciones,
        });
        return respuesta.ok;
    } catch (error) {
        console.error(`[leads] No se pudo entregar el lead a ${url}:`, error);
        return false;
    } finally {
        clearTimeout(temporizador);
    }
}

/**
 * Entrega el prospecto por los dos caminos a la vez.
 *
 * n8n sigue siendo el embudo de siempre y no cambia. La copia en el propio
 * servidor se añadió porque antes un fallo del webhook era un prospecto perdido
 * sin rastro: nadie se enteraba de que alguien había escrito. Ahora queda en la
 * bandeja del panel aunque n8n esté caído.
 *
 * Devuelve si llegó a ALGUNO de los dos, que es lo que de verdad importa
 * responderle a quien acaba de enviar el formulario. En paralelo y no en serie:
 * encadenarlos duplicaría la espera justo en el momento de más ansiedad.
 */
export async function sendLead(payload) {
    const [n8n, local] = await Promise.all([
        enviarA(N8N_WEBHOOK_URL, payload),
        // credentials same-origin: la ruta es del propio sitio.
        enviarA('/api/leads', payload),
    ]);

    return n8n || local;
}
