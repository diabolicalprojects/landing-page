/**
 * Configuración del cliente. Los valores llegan desde .env vía Vite
 * (`VITE_*`) y caen a los actuales de producción si no están definidos, para
 * que un checkout limpio siga funcionando sin configurar nada.
 *
 * Nada de esto es secreto: Vite lo compila dentro del bundle público.
 */
const env = import.meta.env;

export const SITE_URL = env.VITE_SITE_URL || 'https://diabolicalservices.tech';

export const WHATSAPP_PHONE = env.VITE_WHATSAPP_PHONE || '524495136907';

export const N8N_WEBHOOK_URL =
    env.VITE_N8N_WEBHOOK_URL ||
    'https://n8n.diabolicalservices.tech/webhook/9b0c65c5-32f4-4f80-aa01-0730f9812e88';

export const CONTACT_EMAIL = env.VITE_CONTACT_EMAIL || 'contacto@diabolicalservices.tech';
