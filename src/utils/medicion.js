/**
 * Medición de conversiones.
 *
 * Los eventos van al `dataLayer`, no a `gtag()`.
 *
 * Antes se llamaba a `window.gtag('event', ...)` con una guarda
 * `typeof window.gtag === 'function'`. Eso funcionaba solo porque la página
 * cargaba su propio gtag.js además de Google Tag Manager — dos contenedores
 * midiendo la misma propiedad, con las visitas contadas dos veces y 167 KiB de
 * más en la carga. Al quitar el gtag.js suelto, aquella guarda habría dejado de
 * cumplirse y las conversiones habrían dejado de registrarse SIN ERROR NINGUNO:
 * la condición simplemente sería falsa y el evento se perdería en silencio.
 *
 * El `dataLayer` no tiene ese problema. Es un array normal que existe desde la
 * primera línea del <head>, antes de que Tag Manager se haya descargado; los
 * eventos que se empujen mientras tanto se quedan encolados y el contenedor los
 * procesa en cuanto arranca. Por eso se puede diferir la carga de Tag Manager
 * sin perder ni un evento.
 *
 * REQUIERE CONFIGURACIÓN EN TAG MANAGER: para que `generate_lead` llegue a
 * GA4 hace falta una etiqueta de evento de GA4 con un activador de evento
 * personalizado llamado `generate_lead`. Sin esa etiqueta el evento llega al
 * dataLayer y se queda ahí.
 */

/**
 * Empuja un evento al dataLayer. Silencioso y sin efectos si se ejecuta en el
 * servidor durante el prerender, donde no hay `window`.
 *
 * @param {string} evento Nombre del evento, tal como lo espera el activador.
 * @param {object} datos  Parámetros adicionales del evento.
 */
export function medir(evento, datos = {}) {
    if (typeof window === 'undefined') return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: evento, ...datos });
}
