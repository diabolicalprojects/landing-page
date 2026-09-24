import React from 'react';

import Enlace from './Enlace';

/**
 * Texto con enlaces internos escritos como en Markdown: `[texto](/ruta)`.
 *
 * Los artículos del blog viven en JSON, y un párrafo sin enlaces no puede
 * llevar a quien lee a la landing del servicio que busca, que es para lo que
 * existen. Solo se admiten rutas del propio sitio y anclas: el blog no enlaza
 * fuera, por decisión del cliente.
 *
 * server/llms.js convierte la misma sintaxis a texto con la URL completa, así
 * que el enlace llega también a los motores que leen los llms.txt.
 */
const PATRON = /\[([^\]]+)\]\(((?:\/|#)[^)\s]*)\)/g;

const TextoConEnlaces = ({ texto = '', claseEnlace = 'enlace font-bold' }) => {
    const partes = [];
    let ultimo = 0;

    for (const coincidencia of texto.matchAll(PATRON)) {
        const [completo, etiqueta, destino] = coincidencia;
        if (coincidencia.index > ultimo) partes.push(texto.slice(ultimo, coincidencia.index));
        partes.push(
            <Enlace key={`${destino}-${coincidencia.index}`} destino={destino} className={claseEnlace}>
                {etiqueta}
            </Enlace>
        );
        ultimo = coincidencia.index + completo.length;
    }
    if (ultimo < texto.length) partes.push(texto.slice(ultimo));

    return <>{partes}</>;
};

/** El mismo texto sin la sintaxis de enlace: para metadatos y JSON-LD. */
export const textoPlano = (texto = '') => texto.replace(PATRON, '$1');

export default TextoConEnlaces;
