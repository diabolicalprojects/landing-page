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
import { LOGO } from '../logo';

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
   El logo construyéndose como en su guía de marca, y a tamaño grande:

     0 a 1 s     la retícula se abre desde el centro y se trazan los círculos
                 guía y las marcas de encuadre
     0,7 s       las cotas: el logo se dibuja sobre un cuadrado de 136
     1 a 2,8 s   el contorno del disco y el de la cabeza se dibujan en blanco;
                 los cuernos y el ojo marcan sus puntos de construcción
     2,8 s       el disco se llena, la cabeza queda en negro y se abre el ojo
     3,7 s       el andamio se retira, los anillos empiezan a girar y se
                 escribe «DIABOLICAL SERVICES»
     después     respira, parpadea y un barrido lo recorre; al final del ciclo
                 se funde y vuelve a construirse

   Las piezas salen del propio archivo del logo (motion/logo.js): el estado
   final es el logo exacto.
   ========================================================================== */

const LADO_LOGO = 200; // el logo, en unidades del lienzo
const ESCALA = LADO_LOGO / LOGO.lado;
const R_DISCO = LOGO.radio * ESCALA;
const ORIGEN_X = centroX - LADO_LOGO / 2;
const ORIGEN_Y = centroY - LADO_LOGO / 2;
const NOMBRE = 'DIABOLICAL SERVICES';

// Entrada y salida suaves, para los trazos: la curva de la casa frena de golpe
// y un contorno que se dibuja se ve mejor acelerando y frenando.
const suave = (t) => {
    const x = Math.min(1, Math.max(0, t));
    return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};
const tramo = (frame, desde, duracion) => suave((frame - desde) / duracion);

/** Cota de plano: la línea, sus topes y la medida. */
const Cota = ({ x1, y1, x2, y2, texto }) => {
    const vertical = x1 === x2;
    const t = 5;
    return (
        <g stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1" fill="none">
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            {vertical ? (
                <>
                    <line x1={x1 - t} y1={y1} x2={x1 + t} y2={y1} />
                    <line x1={x2 - t} y1={y2} x2={x2 + t} y2={y2} />
                </>
            ) : (
                <>
                    <line x1={x1} y1={y1 - t} x2={x1} y2={y1 + t} />
                    <line x1={x2} y1={y2 - t} x2={x2} y2={y2 + t} />
                </>
            )}
            <text
                x={vertical ? x1 + 10 : (x1 + x2) / 2}
                y={vertical ? (y1 + y2) / 2 + 3 : y1 - 9}
                textAnchor={vertical ? 'start' : 'middle'}
                fontSize="10"
                fill="#ffffff"
                fillOpacity="0.6"
                stroke="none"
                fontFamily="inherit"
                letterSpacing="0.08em"
            >
                {texto}
            </text>
        </g>
    );
};

export const Identidad = ({ frame }) => {
    const pRed = entrada(frame, 0, 30);
    const pGuias = tramo(frame, 6, 36);
    const pCotas = entrada(frame, 20, 24);
    const pTrazo = tramo(frame, 30, 54);
    const pPuntos = entrada(frame, 44, 22);
    const pRelleno = entrada(frame, 84, 26);
    const pOjo = entrada(frame, 104, 14);
    const pFinal = entrada(frame, 112, 36);
    const letras = Math.round(interpolar(frame, [120, 156], [0, NOMBRE.length]));
    const fundido = 1 - interpolar(frame, [336, 358], [0, 1]);

    // El andamio no desaparece del todo: queda como fondo tenue.
    const andamio = 1 - pFinal * 0.72;
    const respiro = interpolar(vaivén(Math.max(0, frame - 112), 120), [0, 1], [1, 1.018]);

    // Un parpadeo cada cinco segundos, ya terminado el logo.
    const fase = (frame - 170) % 150;
    const parpadeo = frame > 170 && fase < 8 ? 1 - Math.sin((fase / 8) * Math.PI) * 0.92 : 1;

    const lineas = [-150, -100, -50, 0, 50, 100, 150];
    const [cx, cy] = LOGO.centroOjo;

    return (
        <Lienzo rejilla={false}>
            <defs>
                <radialGradient id="identidad-difumina">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.7" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
                <mask id="identidad-mascara">
                    <rect width={LIENZO.ancho} height={LIENZO.alto} fill="url(#identidad-difumina)" />
                </mask>
                <clipPath id="identidad-disco">
                    <circle cx="68" cy="68" r="68" />
                </clipPath>
            </defs>

            <g opacity={fundido}>
                <circle
                    cx={centroX}
                    cy={centroY}
                    r="200"
                    fill="url(#d-halo)"
                    opacity={0.3 + pRelleno * 0.7 * (0.85 + 0.15 * vaivén(frame, 120))}
                />

                {/* 1. La retícula, abriéndose desde el centro. */}
                <g mask="url(#identidad-mascara)" opacity={andamio}>
                    {lineas.map((d) => (
                        <line
                            key={`v${d}`}
                            x1={centroX + d}
                            y1={centroY - 200 * pRed}
                            x2={centroX + d}
                            y2={centroY + 200 * pRed}
                            stroke="#ffffff"
                            strokeOpacity={d === 0 ? 0.26 : 0.12}
                        />
                    ))}
                    {lineas.map((d) => (
                        <line
                            key={`h${d}`}
                            x1={centroX - 320 * pRed}
                            y1={centroY + d}
                            x2={centroX + 320 * pRed}
                            y2={centroY + d}
                            stroke="#ffffff"
                            strokeOpacity={d === 0 ? 0.26 : 0.12}
                        />
                    ))}
                    {[45, -45].map((a) => (
                        <line
                            key={a}
                            x1={centroX - 190 * pRed}
                            y1={centroY}
                            x2={centroX + 190 * pRed}
                            y2={centroY}
                            stroke="#ffffff"
                            strokeOpacity="0.1"
                            strokeDasharray="3 5"
                            transform={`rotate(${a} ${centroX} ${centroY})`}
                        />
                    ))}
                </g>

                {/* Círculos guía y marcas de encuadre. */}
                <g fill="none" stroke="#ffffff" opacity={andamio}>
                    {[R_DISCO * 0.5, R_DISCO + 32, R_DISCO + 58].map((r, i) => (
                        <circle
                            key={r}
                            cx={centroX}
                            cy={centroY}
                            r={r}
                            strokeOpacity={0.18 - i * 0.03}
                            pathLength="1"
                            strokeDasharray="1"
                            strokeDashoffset={1 - pGuias}
                            transform={`rotate(${-90 + i * 40} ${centroX} ${centroY})`}
                        />
                    ))}
                    {[
                        [-1, -1],
                        [1, -1],
                        [-1, 1],
                        [1, 1],
                    ].map(([sx, sy]) => {
                        const d = R_DISCO + 42;
                        return (
                            <path
                                key={`${sx}${sy}`}
                                d={`M ${centroX + sx * d} ${centroY + sy * d - sy * 16} V ${centroY + sy * d} H ${centroX + sx * d - sx * 16}`}
                                strokeOpacity={0.5 * pGuias}
                                strokeWidth="1.5"
                            />
                        );
                    })}
                </g>

                {/* 2. Las cotas del plano. Se van cuando el logo está hecho. */}
                <g opacity={pCotas * (1 - pFinal)}>
                    <Cota x1={ORIGEN_X} y1={ORIGEN_Y - 24} x2={ORIGEN_X + LADO_LOGO} y2={ORIGEN_Y - 24} texto="136" />
                    <Cota
                        x1={ORIGEN_X + LADO_LOGO + 24}
                        y1={ORIGEN_Y}
                        x2={ORIGEN_X + LADO_LOGO + 24}
                        y2={ORIGEN_Y + LADO_LOGO}
                        texto="136"
                    />
                </g>

                {/* 5. Los anillos, cuando el logo ya está. */}
                <g opacity={pFinal}>
                    <Anillo x={centroX} y={centroY} radio={R_DISCO + 32} frame={frame} velocidad={0.22} opacidad={0.3} hueco={0.35} />
                    <Anillo x={centroX} y={centroY} radio={R_DISCO + 58} frame={-frame} velocidad={0.14} opacidad={0.2} hueco={0.5} />
                </g>

                {/* 3 y 4. El logo: se traza, se llena y abre el ojo. */}
                <g transform={`translate(${centroX} ${centroY}) scale(${respiro}) translate(${-centroX} ${-centroY})`}>
                    <g transform={`translate(${ORIGEN_X} ${ORIGEN_Y}) scale(${ESCALA})`}>
                        {/* El contorno del disco. */}
                        <circle
                            cx="68"
                            cy="68"
                            r="67.4"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.2"
                            strokeOpacity={1 - pRelleno}
                            pathLength="1"
                            strokeDasharray="1"
                            strokeDashoffset={1 - pTrazo}
                            transform="rotate(-90 68 68)"
                        />
                        {/* El disco se llena desde el centro. */}
                        <circle cx="68" cy="68" r={68 * pRelleno} fill="#ffffff" />

                        <g clipPath="url(#identidad-disco)">
                            <path
                                d={LOGO.cabeza}
                                fill="#000000"
                                fillOpacity={pRelleno}
                                stroke="#ffffff"
                                strokeWidth="1.4"
                                strokeLinejoin="round"
                                strokeOpacity={1 - pRelleno}
                                pathLength="1"
                                strokeDasharray="1"
                                strokeDashoffset={1 - pTrazo}
                            />
                            {pOjo > 0 && (
                                <g transform={`translate(${cx} ${cy}) scale(1 ${pOjo * parpadeo}) translate(${-cx} ${-cy})`}>
                                    <path d={LOGO.ojo} fill="#ffffff" />
                                    <path d={LOGO.pupila} fill="#000000" />
                                </g>
                            )}
                        </g>

                        {/* Puntos de construcción: los cuernos y el ojo. */}
                        <g opacity={pPuntos * (1 - pRelleno)} fill="none" stroke="#ffffff" strokeWidth="0.7">
                            {LOGO.cuernos.map(([x, y]) => (
                                <g key={x}>
                                    <line x1="68" y1="68" x2={x} y2={y} strokeOpacity="0.35" strokeDasharray="2 3" />
                                    <circle cx={x} cy={y} r="3.4" strokeOpacity="0.8" />
                                    <circle cx={x} cy={y} r="0.9" fill="#ffffff" stroke="none" />
                                </g>
                            ))}
                            <circle cx={cx} cy={cy} r={LOGO.radioOjo} strokeOpacity="0.5" strokeDasharray="2 2.5" />
                            <circle cx="68" cy="68" r="1.1" fill="#ffffff" stroke="none" />
                        </g>
                    </g>
                </g>

                <g opacity={pFinal}>
                    <Barrido y={centroY} frame={frame} periodo={170} />
                </g>

                {/* El nombre, escribiéndose. */}
                <text
                    x={centroX}
                    y={centroY + R_DISCO + 86}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#ffffff"
                    fillOpacity="0.55"
                    fontFamily="inherit"
                    letterSpacing="0.32em"
                >
                    {NOMBRE.slice(0, letras)}
                </text>
            </g>
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
