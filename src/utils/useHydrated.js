import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/**
 * Devuelve false durante el prerender y la hidratación, true después.
 *
 * Sirve para montar componentes pesados (el chatbot) solo cuando la página ya
 * está hidratada: renderizarlos dentro de un <Suspense> durante el prerender
 * deja el boundary sin resolver y React descarta todo el HTML del servidor.
 */
export function useHydrated() {
    return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
