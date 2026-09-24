import React from 'react';

import {
    Anillo,
    Baldosa,
    Barrido,
    Conector,
    LIENZO,
    Lienzo,
    Marca,
    Pulso,
    Renglon,
    trazado,
    entrada,
    interpolar,
    vaivén,
} from '../primitivas';

/*
 * Las tres escenas de marca.
 *
 * Son las que llevan el logotipo, y por eso son las que construyen identidad:
 * quien recorre la web ve la misma marca haciendo tres cosas distintas —
 * conectando, construyéndose y firmando— en vez de un logotipo quieto repetido.
 */

const centroX = LIENZO.ancho / 2;
const centroY = LIENZO.alto / 2;

/* ==========================================================================
   NÚCLEO · portada
   --------------------------------------------------------------------------
   La marca en el centro y cuatro canales colgando de ella. Las líneas se
   dibujan solas, los pulsos recorren el trazado y un barrido cruza la escena.
   Dice de un vistazo lo que la empresa hace: todo pasa por el mismo sitio.
   ========================================================================== */

const CANALES = [
    { x: 92, y: 96, etiqueta: 'Sitio web' },
    { x: 548, y: 96, etiqueta: 'WhatsApp' },
    { x: 92, y: 304, etiqueta: 'Agenda' },
    { x: 548, y: 304, etiqueta: 'Redes' },
];

const Glifo = ({ tipo }) => {
    const trazo = { stroke: '#ffffff', strokeOpacity: 0.62, strokeWidth: 1.6, fill: 'none' };
    if (tipo === 0) {
        return (
            <g {...trazo} transform="translate(20 20)">
                <rect x="0" y="2" width="24" height="18" rx="3" />
                <line x1="0" y1="8" x2="24" y2="8" />
            </g>
        );
    }
    if (tipo === 1) {
        return (
            <g {...trazo} transform="translate(20 20)">
                <path d="M2 20 L4 13 A10 10 0 1 1 11 20 Z" />
            </g>
        );
    }
    if (tipo === 2) {
        return (
            <g {...trazo} transform="translate(20 20)">
                <rect x="1" y="3" width="22" height="18" rx="3" />
                <line x1="1" y1="9" x2="23" y2="9" />
                <line x1="7" y1="0" x2="7" y2="5" />
                <line x1="17" y1="0" x2="17" y2="5" />
            </g>
        );
    }
    return (
        <g {...trazo} transform="translate(20 20)">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3.5" />
        </g>
    );
};

/**
 * Del borde de la baldosa del canal al borde de la del centro.
 *
 * Una sola función, y la usan el conector y el pulso: si cada uno calculara el
 * suyo, la luz viajaría por una línea que no está dibujada.
 */
const rutaCanal = (c) => {
    const izquierda = c.x < centroX;
    return trazado(
        c.x + (izquierda ? 34 : -34),
        c.y,
        centroX + (izquierda ? -54 : 54),
        centroY,
        { radio: 26 }
    );
};

/*
 * La red: la marca en el centro y cuatro piezas colgando de ella. La portada
 * cuelga los canales del negocio; el índice de sectores, los cuatro giros.
 * El mecanismo es el mismo —todo pasa por el mismo sitio— y por eso se dibuja
 * con el mismo código.
 */
const Red = ({ frame, canales, Icono }) => {
    const pMarca = entrada(frame, 0, 26);
    const respiro = interpolar(vaivén(frame, 150), [0, 1], [1, 1.035]);

    return (
        <Lienzo>
            <circle cx={centroX} cy={centroY} r="150" fill="url(#d-halo)" opacity={pMarca * 0.9} />

            {canales.map((c, i) => {
                const p = entrada(frame, 16 + i * 7, 30);
                const d = rutaCanal(c);
                return (
                    <g key={c.etiqueta}>
                        <Conector d={d} p={p} />
                        {p > 0.98 && <Pulso d={d} frame={frame} periodo={96} retraso={i * 22} />}
                    </g>
                );
            })}

            {canales.map((c, i) => {
                const p = entrada(frame, 10 + i * 7, 26);
                return (
                    <g key={c.etiqueta}>
                        <Baldosa x={c.x} y={c.y} tam={68} p={p}>
                            <Icono tipo={i} />
                        </Baldosa>
                        <text
                            x={c.x}
                            y={c.y + 54}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#ffffff"
                            fillOpacity={0.5 * p}
                            fontFamily="inherit"
                            letterSpacing="0.1em"
                        >
                            {c.etiqueta.toUpperCase()}
                        </text>
                    </g>
                );
            })}

            <Barrido y={centroY} frame={frame} periodo={170} />

            <g transform={`translate(${centroX} ${centroY}) scale(${respiro}) translate(${-centroX} ${-centroY})`}>
                <Baldosa x={centroX} y={centroY} tam={108} destacada p={pMarca}>
                    <g transform="translate(54 54)">
                        <Marca x={0} y={0} tam={58} p={pMarca} />
                    </g>
                </Baldosa>
            </g>
        </Lienzo>
    );
};

export const Nucleo = ({ frame }) => <Red frame={frame} canales={CANALES} Icono={Glifo} />;

/* ==========================================================================
   GIROS · índice de sectores
   --------------------------------------------------------------------------
   La misma red, con los cuatro giros del enfoque en lugar de los canales. Un
   solo sistema detrás de la inmobiliaria, el gimnasio, el spa y el salón.
   ========================================================================== */

const GIROS = [
    { x: 92, y: 96, etiqueta: 'Inmobiliarias' },
    { x: 548, y: 96, etiqueta: 'Gimnasios' },
    { x: 92, y: 304, etiqueta: 'Spas' },
    { x: 548, y: 304, etiqueta: 'Salones de uñas' },
];

/** Casa, mancuerna, hoja y frasco de esmalte: lo mínimo para leer cada giro. */
const GlifoGiro = ({ tipo }) => {
    const trazo = { stroke: '#ffffff', strokeOpacity: 0.62, strokeWidth: 1.6, fill: 'none', strokeLinejoin: 'round' };
    if (tipo === 0) {
        return (
            <g {...trazo} transform="translate(22 22)">
                <path d="M1 11 L12 2 L23 11" />
                <path d="M4 9 V22 H20 V9" />
                <path d="M10 22 V15 H14 V22" />
            </g>
        );
    }
    if (tipo === 1) {
        return (
            <g {...trazo} transform="translate(22 22)">
                <rect x="2" y="6" width="4" height="12" rx="1.2" />
                <rect x="18" y="6" width="4" height="12" rx="1.2" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="0" y1="10" x2="0" y2="14" />
                <line x1="24" y1="10" x2="24" y2="14" />
            </g>
        );
    }
    if (tipo === 2) {
        return (
            <g {...trazo} transform="translate(22 22)">
                <path d="M12 23 C3 18 3 7 12 1 C21 7 21 18 12 23 Z" />
                <path d="M12 23 V9" />
            </g>
        );
    }
    return (
        <g {...trazo} transform="translate(22 22)">
            <rect x="8" y="0" width="8" height="8" rx="1.5" />
            <rect x="4" y="8" width="16" height="15" rx="4" />
        </g>
    );
};

export const Giros = ({ frame }) => <Red frame={frame} canales={GIROS} Icono={GlifoGiro} />;

/* ==========================================================================
   IDENTIDAD · quiénes somos
   --------------------------------------------------------------------------
   La marca construyéndose: primero la retícula sobre la que está dibujada,
   luego los anillos, luego el logotipo. Cuenta que detrás de lo que se ve hay
   un sistema, que es literalmente lo que vende la empresa.
   ========================================================================== */

export const Identidad = ({ frame }) => {
    const pGuias = entrada(frame, 0, 34);
    const pAnillos = entrada(frame, 20, 38);
    const pMarca = entrada(frame, 44, 34);
    const giro = frame * 0.12;

    const guias = [-120, -60, 0, 60, 120];

    return (
        <Lienzo rejilla={false}>
            <circle cx={centroX} cy={centroY} r="170" fill="url(#d-halo)" opacity={pMarca} />

            {/* La retícula de construcción. Se dibuja primero y se queda muy
                tenue: es el andamio, no el edificio. */}
            <g opacity={pGuias * 0.5}>
                {guias.map((d) => (
                    <line
                        key={`v${d}`}
                        x1={centroX + d}
                        y1={centroY - 150 * pGuias}
                        x2={centroX + d}
                        y2={centroY + 150 * pGuias}
                        stroke="#ffffff"
                        strokeOpacity="0.16"
                    />
                ))}
                {guias.map((d) => (
                    <line
                        key={`h${d}`}
                        x1={centroX - 190 * pGuias}
                        y1={centroY + d}
                        x2={centroX + 190 * pGuias}
                        y2={centroY + d}
                        stroke="#ffffff"
                        strokeOpacity="0.16"
                    />
                ))}
            </g>

            <g opacity={pAnillos}>
                <Anillo x={centroX} y={centroY} radio={132} frame={frame} velocidad={0.18} opacidad={0.18} hueco={0.42} />
                <Anillo x={centroX} y={centroY} radio={106} frame={-frame} velocidad={0.26} opacidad={0.26} hueco={0.3} />
            </g>

            {/* Cuatro marcas de encuadre, como las de una guía de marca. */}
            {pAnillos > 0.5 &&
                [
                    [-1, -1],
                    [1, -1],
                    [-1, 1],
                    [1, 1],
                ].map(([sx, sy]) => (
                    <g key={`${sx}${sy}`} opacity={pAnillos * 0.55}>
                        <path
                            d={`M ${centroX + sx * 86} ${centroY + sy * 86 - sy * 14} V ${centroY + sy * 86} H ${centroX + sx * 86 - sx * 14}`}
                            stroke="#ffffff"
                            strokeOpacity="0.4"
                            fill="none"
                            strokeWidth="1.5"
                        />
                    </g>
                ))}

            <g transform={`rotate(${interpolar(pMarca, [0, 1], [-12, 0])} ${centroX} ${centroY})`}>
                <Marca x={centroX} y={centroY} tam={interpolar(pMarca, [0, 1], [64, 92])} p={pMarca} />
            </g>

            <g opacity={pMarca}>
                <Anillo x={centroX} y={centroY} radio={70} frame={frame} velocidad={-0.4} opacidad={0.3} hueco={0.7} />
            </g>

            <g opacity={pMarca * 0.9} transform={`translate(${centroX} ${centroY + 150})`}>
                <text
                    textAnchor="middle"
                    fontSize="11"
                    fill="#ffffff"
                    fillOpacity="0.45"
                    fontFamily="inherit"
                    letterSpacing="0.28em"
                >
                    DIABOLICAL SERVICES
                </text>
            </g>
            <g style={{ transform: `rotate(${giro}deg)` }} />
        </Lienzo>
    );
};

/* ==========================================================================
   SELLO · cierre
   --------------------------------------------------------------------------
   La marca firmando el trabajo. Un barrido la recorre y un anillo la orbita.
   ========================================================================== */

export const Sello = ({ frame }) => {
    const p = entrada(frame, 0, 30);
    const respiro = interpolar(vaivén(frame, 190), [0, 1], [0.985, 1.015]);

    return (
        <Lienzo rejilla={false}>
            <circle cx={centroX} cy={centroY} r="140" fill="url(#d-halo)" opacity={p} />

            {[0, 1, 2].map((i) => (
                <g key={i} opacity={p * (0.5 - i * 0.13)}>
                    <Anillo
                        x={centroX}
                        y={centroY}
                        radio={92 + i * 26}
                        frame={i % 2 === 0 ? frame : -frame}
                        velocidad={0.14 + i * 0.06}
                        opacidad={0.3}
                        hueco={0.55 - i * 0.1}
                    />
                </g>
            ))}

            <g transform={`translate(${centroX} ${centroY}) scale(${respiro}) translate(${-centroX} ${-centroY})`}>
                <Baldosa x={centroX} y={centroY} tam={132} destacada p={p}>
                    <g transform="translate(66 66)">
                        <Marca x={0} y={0} tam={72} p={p} />
                    </g>
                </Baldosa>
            </g>

            <Barrido y={centroY} frame={frame} periodo={210} />

            <g opacity={p * 0.8}>
                <Renglon x={centroX - 90} y={centroY + 116} ancho={180} alto={1} opacidad={0.2} radio={0} />
            </g>
        </Lienzo>
    );
};
