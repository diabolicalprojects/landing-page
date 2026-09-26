/**
 * Configuración del cliente. Los valores llegan desde .env vía Vite
 * (`VITE_*`) y caen a los actuales de producción si no están definidos, para
 * que un checkout limpio siga funcionando sin configurar nada.
 *
 * Nada de esto es secreto: Vite lo compila dentro del bundle público.
 */
import CONTACTO from './data/contacto.json';

const env = import.meta.env;

export const SITE_URL = env.VITE_SITE_URL || 'https://diabolicalservices.tech';

/*
 * El número y el correo de la casa viven en UN sitio: src/data/contacto.json.
 * De ahí salen los enlaces de WhatsApp, el pie, el JSON-LD y los llms.txt;
 * cambiar de número es cambiar ese archivo y nada más.
 */
export const WHATSAPP_PHONE = env.VITE_WHATSAPP_PHONE || CONTACTO.whatsapp;
export const WHATSAPP_VISIBLE = CONTACTO.whatsappVisible;

export const N8N_WEBHOOK_URL =
    env.VITE_N8N_WEBHOOK_URL ||
    'https://n8n.diabolicalservices.tech/webhook/9b0c65c5-32f4-4f80-aa01-0730f9812e88';

export const CONTACT_EMAIL = env.VITE_CONTACT_EMAIL || CONTACTO.email;
