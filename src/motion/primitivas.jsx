import React from 'react';

import logoMarca from '../assets/logo/icono-diabolical-chatbot.svg';
import { entrada, interpolar, vaivén } from './tiempo';

/*
 * Gramática visual de todas las escenas.
 *
 * Trece servicios y seis sectores necesitan su propia animación, y ese es
 * exactamente el punto donde una web se llena de dibujos que se parecen sin ser
 * el mismo sistema. La salida no es dibujar diecinueve veces: es tener seis
 * piezas que significan algo y componerlas distinto en cada escena.
 *
 * Todo es SVG con viewBox. Un SVG se dibuja igual en el servidor que dentro del
 * reproductor de Remotion, escala sin perder nitidez y pesa lo que pesa el
 * markup. Una imagen exportada por escena serían diecinueve descargas.
 *
 * Monocromo estricto: blanco sobre negro. Lo que destaca se lo gana con peso,
 * tamaño o superficie, nunca con un color.
 */

/** Lienzo de referencia. Todas las escenas dibujan dentro de esta caja. */
export const LIENZO = { ancho: 640, alto: 400 };

const BLANCO = '#ffffff';

/** Rejilla de fondo, desvanecida hacia los bordes. Es el suelo de la escena. */
export const Rejilla = ({ paso = 40, opacidad = 0.06 }) => (
    <g opacity={opacidad}>
        {Array.from({ length: Math.ceil(LIENZO.ancho / paso) + 1 }, (_, i) => (
            <line
                key={`v${i}`}
                x1={i * paso}
                y1="0"
                x2={i * paso}
                y2={LIENZO.alto}
                stroke={BLANCO}
                strokeWidth="1"
            />
        ))}
        {Array.from({ length: Math.ceil(LIENZO.alto / paso) + 1 }, (_, i) => (
            <line
                key={`h${i}`}
                x1="0"
                y1={i * paso}
                x2={LIENZO.ancho}
                y2={i * paso}
                stroke={BLANCO}
                strokeWidth="1"
            />
        ))}
    </g>
);

/**
 * Baldosa: el contenedor de todo lo que es una pieza del sistema.
 *
 * Cuadrado redondeado con un degradado interior muy suave, como en la
 * referencia del pósters de agentes. `destacada` la sube al primer plano; es lo
 * que distingue el centro de una escena de sus satélites.
 */
export const Baldosa = ({ x, y, tam = 64, destacada = false, p = 1, children }) => {
    const escala = interpolar(p, [0, 1], [0.82, 1]);
    const desplazamiento = tam / 2;

    return (
        <g
            opacity={p}
            transform={`translate(${x} ${y}) scale(${escala}) translate(${-desplazamiento} ${-desplazamiento})`}
        >
            <rect
                width={tam}
                height={tam}
                rx={tam * 0.26}
                fill={destacada ? 'url(#baldosaAlta)' : 'url(#baldosaBase)'}
                stroke={BLANCO}
                strokeOpacity={destacada ? 0.35 : 0.14}
                strokeWidth="1"
            />
            {children}
        </g>
    );
};

/**
 * Trazado en ese/ele entre dos puntos, con las esquinas redondeadas.
 *
 * ES LA ÚNICA fuente del camino. La primera versión lo calculaba dos veces —una
 * dentro del conector y otra fuera para el pulso— y el resultado era que la luz
 * viajaba por una línea distinta de la dibujada. Cuando dos cosas tienen que ir
 * exactamente por el mismo sitio, el sitio se calcula una vez.
 *
 *   'ese'  sube o baja a mitad de camino. Para unir dos columnas.
 *   'ele'  avanza en horizontal y gira una vez. Para colgar de un eje.
 */
export function trazado(x1, y1, x2, y2, { radio = 22, modo = 'ese' } = {}) {
    const signoX = x2 >= x1 ? 1 : -1;
    const signoY = y2 >= y1 ? 1 : -1;

    // Sin desnivel no hay curva que dibujar: una recta y listo.
    if (Math.abs(y2 - y1) < 1) return `M ${x1} ${y1} H ${x2}`;

    // El radio no puede comerse más de la mitad del tramo o la curva se cruza
    // consigo misma y aparece el gancho que delata un diagrama mal generado.
    const r = Math.min(radio, Math.abs(y2 - y1) / 2, Math.abs(x2 - x1) / 2);

    if (modo === 'ele') {
        return `M ${x1} ${y1} H ${x2 - r * signoX} Q ${x2} ${y1} ${x2} ${y1 + r * signoY} V ${y2}`;
    }

    const medio = (x1 + x2) / 2;
    return (
        `M ${x1} ${y1} H ${medio - r * signoX} ` +
        `Q ${medio} ${y1} ${medio} ${y1 + r * signoY} ` +
        `V ${y2 - r * signoY} ` +
        `Q ${medio} ${y2} ${medio + r * signoX} ${y2} H ${x2}`
    );
}

/**
 * Conector: la línea que une dos piezas.
 *
 * Se dibuja sola de origen a destino. Es la parte que cuenta el mecanismo: no
 * es que haya cajas, es que algo va de una a otra.
 */
export const Conector = ({ d, p = 1 }) => {
    // Longitud generosa: pasarse no se ve, quedarse corto deja la línea a medias.
    const largo = 1200;

    return (
        <path
            d={d}
            fill="none"
            stroke={BLANCO}
            strokeOpacity="0.28"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={largo}
            strokeDashoffset={largo * (1 - p)}
        />
    );
};

/**
 * Pulso: el punto de luz que recorre un conector.
 *
 * Es lo que convierte un diagrama en un sistema funcionando. Recibe el MISMO
 * trazado que el conector, así que no puede despegarse de él.
 */
export const Pulso = ({ d, frame, periodo = 70, retraso = 0, largo = 54 }) => {
    if (frame < retraso) return null;
    const ciclo = ((frame - retraso) % periodo) / periodo;

    return (
        <path
            d={d}
            fill="none"
            stroke={BLANCO}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${largo} 2000`}
            strokeDashoffset={largo - ciclo * (900 + largo)}
            opacity={0.9}
        />
    );
};

/** La marca, que es el centro de todas las escenas donde aparece el sistema. */
export const Marca = ({ x, y, tam = 46, p = 1, giro = 0 }) => (
    <g opacity={p} transform={`translate(${x} ${y}) rotate(${giro})`}>
        <image
            href={logoMarca}
            x={-tam / 2}
            y={-tam / 2}
            width={tam}
            height={tam}
            preserveAspectRatio="xMidYMid meet"
        />
    </g>
);

/**
 * Anillo que gira alrededor de la marca. El hueco del trazo es lo que hace ver
 * que gira; un anillo continuo girando es un anillo quieto.
 */
export const Anillo = ({ x, y, radio, frame, velocidad = 0.35, opacidad = 0.22, hueco = 0.28 }) => {
    const perimetro = 2 * Math.PI * radio;
    return (
        <circle
            cx={x}
            cy={y}
            r={radio}
            fill="none"
            stroke={BLANCO}
            strokeOpacity={opacidad}
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray={`${perimetro * (1 - hueco)} ${perimetro * hueco}`}
            transform={`rotate(${frame * velocidad} ${x} ${y})`}
        />
    );
};

/**
 * Barrido: la línea de luz horizontal que cruza la escena.
 *
 * Sale de la referencia del pósters de agentes, y aquí significa algo: es el
 * instante en el que el sistema atiende. Por eso pasa una vez por ciclo y no
 * está siempre encendida.
 */
export const Barrido = ({ y, frame, periodo = 140 }) => {
    const t = (frame % periodo) / periodo;
    const x = interpolar(t, [0, 1], [-120, LIENZO.ancho + 120]);
    const intensidad = Math.sin(t * Math.PI);

    return (
        <g opacity={intensidad * 0.85}>
            <rect x={x - 110} y={y - 0.75} width="220" height="1.5" fill="url(#barrido)" />
        </g>
    );
};

/** Ventana de navegador: para todo lo que vive en un sitio web. */
export const Ventana = ({ x, y, ancho, alto, p = 1, titulo, children }) => (
    <g opacity={p} transform={`translate(${x} ${y})`}>
        <rect
            width={ancho}
            height={alto}
            rx="14"
            fill="url(#baldosaBase)"
            stroke={BLANCO}
            strokeOpacity="0.16"
        />
        <line x1="0" y1="26" x2={ancho} y2="26" stroke={BLANCO} strokeOpacity="0.12" />
        {[13, 25, 37].map((cx) => (
            <circle key={cx} cx={cx} cy="13" r="2.5" fill={BLANCO} fillOpacity="0.22" />
        ))}
        {titulo && (
            <text
                x="52"
                y="17"
                fontSize="8.5"
                fill={BLANCO}
                fillOpacity="0.45"
                fontFamily="inherit"
                letterSpacing="0.08em"
            >
                {titulo}
            </text>
        )}
        <g transform="translate(0 26)">{children}</g>
    </g>
);

/** Teléfono: para todo lo que pasa en la mano del cliente. */
export const Telefono = ({ x, y, ancho = 132, alto = 250, p = 1, children }) => (
    <g opacity={p} transform={`translate(${x} ${y})`}>
        <rect
            width={ancho}
            height={alto}
            rx="20"
            fill="url(#baldosaBase)"
            stroke={BLANCO}
            strokeOpacity="0.22"
            strokeWidth="1.5"
        />
        <rect x={ancho / 2 - 18} y="9" width="36" height="4" rx="2" fill={BLANCO} fillOpacity="0.18" />
        <g transform="translate(0 24)">{children}</g>
    </g>
);

/** Barra de texto simulada. El relleno de una maqueta, con su jerarquía. */
export const Renglon = ({ x, y, ancho, alto = 5, opacidad = 0.16, radio = 3 }) => (
    <rect x={x} y={y} width={ancho} height={alto} rx={radio} fill={BLANCO} fillOpacity={opacidad} />
);

/** Burbuja de conversación. */
export const Burbuja = ({ x, y, ancho, alto = 26, propia = false, p = 1 }) => (
    <g opacity={p}>
        <rect
            x={propia ? x - ancho : x}
            y={y}
            width={ancho}
            height={alto}
            rx="9"
            fill={BLANCO}
            fillOpacity={propia ? 0.9 : 0.1}
        />
    </g>
);

/**
 * Definiciones compartidas. Van una sola vez por escena y las usan todas las
 * primitivas: sin esto, cada degradado se declararía cuatro veces por dibujo.
 */
export const Defs = ({ id = 'd' }) => (
    <defs>
        <linearGradient id="baldosaBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLANCO} stopOpacity="0.07" />
            <stop offset="100%" stopColor={BLANCO} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="baldosaAlta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLANCO} stopOpacity="0.16" />
            <stop offset="100%" stopColor={BLANCO} stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="barrido" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={BLANCO} stopOpacity="0" />
            <stop offset="50%" stopColor={BLANCO} stopOpacity="0.75" />
            <stop offset="100%" stopColor={BLANCO} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%">
            <stop offset="0%" stopColor={BLANCO} stopOpacity="0.20" />
            <stop offset="100%" stopColor={BLANCO} stopOpacity="0" />
        </radialGradient>
    </defs>
);

/** Envoltorio común: viewBox, definiciones y fondo. */
export const Lienzo = ({ children, rejilla = true }) => (
    <svg
        viewBox={`0 0 ${LIENZO.ancho} ${LIENZO.alto}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
        aria-hidden="true"
        focusable="false"
    >
        <Defs />
        {rejilla && <Rejilla />}
        {children}
    </svg>
);

export { entrada, interpolar, vaivén };
