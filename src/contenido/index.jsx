import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import BASE from '../data/contenido.json';

/*
 * Contenido editable.
 *
 * El sitio se sirve renderizado en el servidor, así que el contenido tiene que
 * estar resuelto ANTES de pintar: si llegara por fetch después de hidratar, los
 * rastreadores (y quien entra con la red mala) verían el texto de fábrica y no
 * el que el equipo editó. Por eso viaja por dos caminos que acaban en el mismo
 * sitio:
 *
 *   servidor   → render(url, contenido) lo pasa por props al Provider
 *   navegador  → window.__CONTENIDO__, que el servidor inyecta en el HTML
 *
 * BASE (src/data/contenido.json) es el respaldo de fábrica y nunca se toca
 * desde el panel: si data/contenido.json se corrompe o se borra, el sitio
 * vuelve a este texto en vez de quedarse en blanco.
 */

const esObjetoPlano = (valor) =>
    valor !== null && typeof valor === 'object' && !Array.isArray(valor);

/**
 * Fusiona el contenido guardado sobre el de fábrica.
 *
 * Los arrays se reemplazan enteros a propósito: fusionarlos por índice haría
 * imposible borrar una tarjeta desde el panel, porque la de fábrica volvería a
 * aparecer debajo.
 */
export function fusionar(base, encima) {
    if (!esObjetoPlano(encima)) return encima === undefined ? base : encima;
    if (!esObjetoPlano(base)) return encima;

    const salida = { ...base };
    for (const clave of Object.keys(encima)) {
        salida[clave] = fusionar(base[clave], encima[clave]);
    }
    return salida;
}

/** Contenido de fábrica, sin nada encima. Lo usan el panel y las pruebas. */
export const CONTENIDO_BASE = BASE;

/**
 * Lee lo que el servidor dejó en el HTML. Devuelve null fuera del navegador o
 * si la inyección no llegó, y entonces se usa el de fábrica.
 */
export function contenidoDelDocumento() {
    if (typeof window === 'undefined') return null;
    const crudo = window.__CONTENIDO__;
    return esObjetoPlano(crudo) ? crudo : null;
}

const ContextoContenido = createContext(BASE);

/** Mensaje que el panel manda a la vista previa. Ver src/admin/VistaPrevia.jsx. */
export const MENSAJE_BORRADOR = 'diabolical:borrador';

export function ProveedorContenido({ valor, children }) {
    const base = useMemo(() => {
        const encima = valor ?? contenidoDelDocumento();
        return encima ? fusionar(BASE, encima) : BASE;
    }, [valor]);

    /*
     * Borrador en vivo.
     *
     * Cuando esta página se abre dentro del <iframe> del panel, el editor le
     * manda el contenido sin guardar en cada tecla y la página se repinta al
     * instante. Es lo que convierte el panel en un editor visual de verdad: se
     * escribe a la izquierda y se ve el sitio real cambiando a la derecha, no
     * una maqueta que se parece al sitio.
     *
     * Solo se aceptan mensajes del MISMO origen. Sin esa comprobación,
     * cualquier página que consiguiera meter este sitio en un iframe podría
     * reescribir lo que el visitante lee.
     */
    const [borrador, setBorrador] = useState(null);

    useEffect(() => {
        if (typeof window === 'undefined' || window.parent === window) return undefined;

        const alRecibir = (evento) => {
            if (evento.origin !== window.location.origin) return;
            const dato = evento.data;
            if (!dato || dato.tipo !== MENSAJE_BORRADOR) return;
            setBorrador(esObjetoPlano(dato.contenido) ? dato.contenido : null);
        };

        window.addEventListener('message', alRecibir);
        // Avisa al panel de que ya está lista para recibir: si el editor
        // mandara el borrador antes de que este listener existiera, la primera
        // vista previa saldría con el contenido publicado en vez del borrador.
        window.parent.postMessage({ tipo: `${MENSAJE_BORRADOR}:lista` }, window.location.origin);

        return () => window.removeEventListener('message', alRecibir);
    }, []);

    const resuelto = useMemo(
        () => (borrador ? fusionar(BASE, borrador) : base),
        [base, borrador]
    );

    return (
        <ContextoContenido.Provider value={resuelto}>{children}</ContextoContenido.Provider>
    );
}

/** Todo el árbol de contenido ya fusionado. */
export function useContenido() {
    return useContext(ContextoContenido);
}

/**
 * Un bloque por nombre. Devuelve siempre un objeto para que el componente
 * pueda desestructurar sin comprobar: un bloque que no exista en el guardado
 * cae al de fábrica, y uno que no exista en ninguno de los dos da {}.
 */
export function useBloque(nombre) {
    const contenido = useContenido();
    return contenido[nombre] ?? BASE[nombre] ?? {};
}
