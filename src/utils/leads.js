import { N8N_WEBHOOK_URL, WHATSAPP_PHONE } from '../config';

/**
 * Abre WhatsApp con el mensaje prellenado.
 *
 * Android y iOS necesitan el esquema nativo (`intent://` / `whatsapp://`): con
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

/**
 * Envía el lead al webhook de n8n.
 *
 * Devuelve si se entregó: WhatsApp depende de que el usuario complete el envío
 * en la app, así que si esto falla el lead puede perderse sin que nadie se
 * entere. Quien llama debe avisar al usuario en ese caso.
 */
export async function sendLead(payload) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        return response.ok;
    } catch (error) {
        console.error('[leads] No se pudo entregar el lead a n8n:', error);
        return false;
    } finally {
        clearTimeout(timeout);
    }
}
