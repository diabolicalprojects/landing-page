import React from 'react';

import { useContenido } from './index';

/*
 * Variables de tema editables.
 *
 * Se emiten como custom properties en un <style> propio en lugar de compilarse
 * en el CSS: así el panel puede cambiar el acento o la escala tipográfica y el
 * cambio viaja en el HTML servido, sin recompilar ni desplegar.
 *
 * Todo valor que entra aquí acaba dentro de una hoja de estilos, así que se
 * valida por forma antes de escribirlo. Un color no es «lo que haya escrito el
 * usuario», es exactamente #rgb, #rrggbb o #rrggbbaa; cualquier otra cosa se
 * descarta y queda el valor de fábrica. Sin esto, un `}` en un campo de texto
 * cerraría la regla y lo siguiente sería CSS arbitrario.
 */

const COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const LONGITUD = /^-?\d+(?:\.\d+)?(?:px|rem|em|%|vw|vh)$/;

const color = (valor, respaldo) => (COLOR.test(String(valor || '')) ? valor : respaldo);
const longitud = (valor, respaldo) => (LONGITUD.test(String(valor || '')) ? valor : respaldo);

const escala = (valor, respaldo) => {
    const numero = Number(valor);
    // Fuera de este rango la página deja de ser usable: por debajo de 0,75 el
    // texto no se lee y por encima de 1,5 los titulares desbordan en móvil.
    return Number.isFinite(numero) && numero >= 0.75 && numero <= 1.5 ? numero : respaldo;
};

export function variablesDeTema(tema = {}) {
    return {
        '--acento': color(tema.acento, '#FFFFFF'),
        '--acento-claro': color(tema.acentoClaro, '#0A0A0A'),
        '--acento-tinta': color(tema.acentoTinta, '#0A0A0A'),
        '--superficie-0': color(tema.fondo, '#000000'),
        '--superficie-1': color(tema.superficie1, '#0B0B0B'),
        '--superficie-2': color(tema.superficie2, '#151515'),
        '--papel': color(tema.papel, '#F2F1EE'),
        '--papel-2': color(tema.papel2, '#E6E4DF'),
        '--tinta': color(tema.tinta, '#0A0A0A'),
        '--radio': longitud(tema.radio, '1.5rem'),
        '--escala-titulo': escala(tema.escalaTitulo, 1),
        '--escala-texto': escala(tema.escalaTexto, 1),
    };
}

const Tema = () => {
    const { tema } = useContenido();
    const vars = variablesDeTema(tema);
    const cuerpo = Object.entries(vars)
        .map(([clave, valor]) => `${clave}:${valor}`)
        .join(';');

    // dangerouslySetInnerHTML es la única forma de emitir CSS desde React, y es
    // seguro aquí porque `cuerpo` solo puede contener valores que pasaron los
    // validadores de arriba.
    return <style data-tema="diabolical" dangerouslySetInnerHTML={{ __html: `:root{${cuerpo}}` }} />;
};

export default Tema;
