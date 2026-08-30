/**
 * ¿El sistema pide reducir el movimiento?
 *
 * Se consulta en el momento de animar, no una sola vez al arrancar, porque la
 * preferencia puede cambiar durante la sesión y porque el prerender corre en
 * Node, donde no existe `window`.
 *
 * Quien la activa suele hacerlo por mareo o migraña con el movimiento en
 * pantalla, así que la respuesta correcta es mostrar el resultado final de una
 * vez, no acelerar la animación: una entrada de 0.01s sigue siendo un
 * parpadeo. Las reglas de `prefers-reduced-motion` en index.css se encargan de
 * que el contenido sea visible sin que GSAP intervenga.
 */
export const prefiereMenosMovimiento = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
