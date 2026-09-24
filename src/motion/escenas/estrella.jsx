import React from 'react';

import {
    Anillo,
    Baldosa,
    Burbuja,
    Conector,
    Lienzo,
    Marca,
    Pulso,
    Renglon,
    Telefono,
    trazado,
    Ventana,
    entrada,
    interpolar,
    vaivén,
} from '../primitivas';
import { acotar } from '../tiempo';

/*
 * Las escenas de los servicios principales y la del proceso.
 *
 *   Chatbots        tres canales entran al mismo sistema y reciben la misma
 *                   respuesta: el criterio es uno, los canales son varios
 *   Agendamiento    la semana se llena sola, llega el recordatorio y una cita
 *                   se mueve sin dejar el hueco perdido
 *   Proceso         la línea de pasos de cómo trabajamos, dibujada a partir de
 *                   los pasos que haya en el contenido editable
 *
 * Las tres se desvanecen al final del ciclo para que el bucle no salte de la
 * escena completa al lienzo vacío.
 */

const BLANCO = '#ffffff';
const NEGRO = '#0a0a0a';

export const CICLO_CHATBOTS = 300;
export const CICLO_AGENDAMIENTO = 300;

/** Lienzo panorámico del proceso: una línea de pasos no cabe en 16:10. */
export const LIENZO_PROCESO = { ancho: 960, alto: 250 };

const cierre = (frame, ciclo) => 1 - entrada(frame, ciclo - 26, 24);

const Etiqueta = ({ x, y, texto, p = 1, ancla = 'middle', tam = 11 }) => (
    <text
        x={x}
        y={y}
        textAnchor={ancla}
        fontSize={tam}
        fill={BLANCO}
        fillOpacity={0.55 * p}
        fontFamily="inherit"
        letterSpacing="0.1em"
    >
        {texto}
    </text>
);

const Visto = ({ x, y, p, color = NEGRO, grosor = 2 }) => (
    <path
        d={`M ${x - 4.5} ${y} L ${x - 1} ${y + 3.5} L ${x + 5} ${y - 3.5}`}
        fill="none"
        stroke={color}
        strokeWidth={grosor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="20"
        strokeDashoffset={20 * (1 - p)}
    />
);

const Hecho = ({ x, y, p, r = 9 }) => (
    <g opacity={p}>
        <circle cx={x} cy={y} r={r * interpolar(p, [0, 1], [0.6, 1])} fill={BLANCO} />
        <Visto x={x} y={y} p={p} />
    </g>
);

/* --- Iconos de canal, dibujados en el centro de una baldosa ------------- */

const IconoWhatsapp = () => (
    <g fill="none" stroke={BLANCO} strokeOpacity="0.8" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M -11 9 L -8.5 3 A 11 11 0 1 1 -3 8.5 Z" />
        <path d="M -4 -3 Q -3.5 3 3 4" strokeLinecap="round" />
    </g>
);

const IconoSitio = () => (
    <g fill="none" stroke={BLANCO} strokeOpacity="0.8" strokeWidth="1.8">
        <rect x="-12" y="-9" width="24" height="18" rx="3" />
        <line x1="-12" y1="-3.5" x2="12" y2="-3.5" />
    </g>
);

const IconoInstagram = () => (
    <g fill="none" stroke={BLANCO} strokeOpacity="0.8" strokeWidth="1.8">
        <rect x="-11" y="-11" width="22" height="22" rx="6.5" />
        <circle r="5" />
        <circle cx="6" cy="-6" r="1.2" fill={BLANCO} stroke="none" />
    </g>
);

/* --- Chatbots ------------------------------------------------------------ */

/**
 * Chatbots: WhatsApp, el sitio web e Instagram entran al mismo sistema, y la
 * conversación de la derecha avanza sola: pregunta, respuesta, cita confirmada
 * y, cuando hace falta criterio, el paso a una persona.
 */
export const Chatbots = ({ frame }) => {
    const fin = cierre(frame, CICLO_CHATBOTS);
    const canales = [
        { y: 100, texto: 'WHATSAPP', Icono: IconoWhatsapp },
        { y: 200, texto: 'SITIO WEB', Icono: IconoSitio },
        { y: 300, texto: 'INSTAGRAM', Icono: IconoInstagram },
    ];
    const pHub = entrada(frame, 22, 28);
    const escribiendo = frame > 58 && frame < 100;

    return (
        <Lienzo>
            <g opacity={fin}>
                {canales.map((c, i) => {
                    const pc = entrada(frame, i * 8, 24);
                    const d = trazado(114, c.y, 262, 200, { radio: 20 });
                    return (
                        <g key={c.texto}>
                            <Baldosa x={86} y={c.y} tam={56} p={pc}>
                                <g transform="translate(28 28)">
                                    <c.Icono />
                                </g>
                            </Baldosa>
                            <Etiqueta x={86} y={c.y + 46} texto={c.texto} p={pc} tam={10} />
                            <Conector d={d} p={entrada(frame, 16 + i * 8, 24)} />
                            {frame > 40 && <Pulso d={d} frame={frame} periodo={110} retraso={40 + i * 26} largo={32} />}
                        </g>
                    );
                })}

                <Baldosa x={308} y={200} tam={92} destacada p={pHub}>
                    <g transform="translate(46 46)">
                        <Marca x={0} y={0} tam={50} p={1} />
                    </g>
                </Baldosa>
                <g opacity={pHub}>
                    <Anillo x={308} y={200} radio={66} frame={frame} velocidad={0.3} opacidad={0.2} hueco={0.6} />
                </g>

                <Conector d="M 354 200 H 400" p={entrada(frame, 34, 18)} />

                <Ventana x={400} y={58} ancho={210} alto={284} p={entrada(frame, 30, 24)} titulo="conversación">
                    <Burbuja x={12} y={16} ancho={128} alto={26} p={entrada(frame, 44, 20)} />
                    {escribiendo && (
                        <g transform="translate(186 70)">
                            {[0, 1, 2].map((i) => (
                                <circle
                                    key={i}
                                    cx={-28 + i * 10}
                                    cy="0"
                                    r="3"
                                    fill={BLANCO}
                                    fillOpacity={0.25 + 0.6 * vaivén(frame + i * 6, 24)}
                                />
                            ))}
                        </g>
                    )}
                    <Burbuja x={198} y={56} ancho={150} alto={30} propia p={entrada(frame, 100, 18)} />
                    <Burbuja x={12} y={98} ancho={96} alto={24} p={entrada(frame, 130, 18)} />

                    {/* La respuesta que agenda: una tarjeta de cita dentro del chat. */}
                    <g opacity={entrada(frame, 158, 22)}>
                        <rect x="48" y="134" width="150" height="46" rx="10" fill={BLANCO} fillOpacity="0.9" />
                        <g transform="translate(62 146)">
                            <rect width="20" height="20" rx="4" fill="none" stroke={NEGRO} strokeOpacity="0.6" strokeWidth="1.6" />
                            <line x1="0" y1="6" x2="20" y2="6" stroke={NEGRO} strokeOpacity="0.6" strokeWidth="1.6" />
                        </g>
                        <rect x="92" y="148" width="72" height="6" rx="3" fill={NEGRO} fillOpacity="0.55" />
                        <rect x="92" y="160" width="48" height="5" rx="2.5" fill={NEGRO} fillOpacity="0.3" />
                        <Hecho x={190} y={136} p={entrada(frame, 172, 16)} />
                    </g>

                    {/* Cuando la consulta pide criterio, entra una persona. */}
                    <g opacity={entrada(frame, 210, 22)}>
                        <line x1="12" y1="202" x2="198" y2="202" stroke={BLANCO} strokeOpacity="0.1" />
                        <circle cx="26" cy="226" r="10" fill={BLANCO} fillOpacity="0.14" stroke={BLANCO} strokeOpacity="0.35" />
                        <circle cx="26" cy="223" r="3.5" fill={BLANCO} fillOpacity="0.55" />
                        <Renglon x={44} y={218} ancho={96} alto={6} opacidad={0.5} />
                        <Renglon x={44} y={230} ancho={64} alto={5} opacidad={0.22} />
                    </g>
                </Ventana>

                <Etiqueta x={505} y={366} texto="CITA CONFIRMADA · PASA A PERSONA" p={entrada(frame, 180, 22)} tam={10} />
                <Etiqueta x={200} y={386} texto="UN SOLO CRITERIO EN CADA CANAL" p={pHub} />
            </g>
        </Lienzo>
    );
};

/* --- Agendamiento automatizado ------------------------------------------ */

/**
 * Agendamiento: la petición llega por WhatsApp, el hueco se ocupa en la
 * agenda real, sale el recordatorio y una cita se mueve a otro día sin que el
 * hueco original se pierda.
 */
export const Agendamiento = ({ frame }) => {
    const fin = cierre(frame, CICLO_AGENDAMIENTO);
    const p = entrada(frame, 0, 24);

    const columnas = [0, 1, 2, 3, 4];
    const filas = [0, 1, 2, 3, 4, 5];
    const celda = (c, r) => ({ x: 18 + c * 74, y: 34 + r * 36 });
    const ocupadas = new Set(['0-1', '1-3', '2-0', '3-4', '4-2', '0-5', '1-0', '3-1']);

    // La cita nueva y la que se reagenda.
    const nueva = celda(2, 2);
    const pNueva = entrada(frame, 84, 22);
    const origen = celda(3, 4);
    const destino = celda(4, 1);
    const mover = entrada(frame, 196, 36);
    const movida = {
        x: interpolar(mover, [0, 1], [origen.x, destino.x]),
        y: interpolar(mover, [0, 1], [origen.y, destino.y]),
    };
    const campana = frame > 140 && frame < 196 ? vaivén(frame - 140, 18) : 0;

    return (
        <Lienzo>
            <g opacity={fin}>
                <Telefono x={36} y={88} ancho={116} alto={224} p={p}>
                    <Marca x={18} y={12} tam={14} p={1} />
                    <Renglon x={30} y={9} ancho={46} alto={5} opacidad={0.4} />
                    <Burbuja x={12} y={40} ancho={82} alto={24} p={entrada(frame, 12, 20)} />
                    <Burbuja x={104} y={74} ancho={86} alto={30} propia p={entrada(frame, 42, 20)} />
                    <Burbuja x={12} y={114} ancho={58} alto={22} p={entrada(frame, 68, 20)} />
                </Telefono>

                <Conector d="M 152 200 H 206" p={entrada(frame, 60, 18)} />
                {frame > 70 && <Pulso d="M 152 200 H 206" frame={frame} periodo={120} retraso={70} largo={24} />}

                <Ventana x={206} y={46} ancho={398} alto={284} p={entrada(frame, 6, 24)} titulo="agenda · semana">
                    {columnas.map((c) => (
                        <Renglon key={`d${c}`} x={celda(c, 0).x} y={16} ancho={34} alto={5} opacidad={0.3} />
                    ))}
                    {columnas.map((c) =>
                        filas.map((r) => {
                            const { x, y } = celda(c, r);
                            const clave = `${c}-${r}`;
                            const esOrigen = c === 3 && r === 4;
                            return (
                                <rect
                                    key={clave}
                                    x={x}
                                    y={y}
                                    width="70"
                                    height="30"
                                    rx="6"
                                    fill={BLANCO}
                                    fillOpacity={
                                        esOrigen ? 0.12 * (1 - mover) + 0.03 : ocupadas.has(clave) ? 0.12 : 0.03
                                    }
                                    stroke={BLANCO}
                                    strokeOpacity="0.08"
                                />
                            );
                        })
                    )}

                    {/* La cita que entra por WhatsApp. */}
                    <g opacity={pNueva}>
                        <rect x={nueva.x} y={nueva.y} width="70" height="30" rx="6" fill={BLANCO} fillOpacity="0.9" />
                        <rect x={nueva.x + 10} y={nueva.y + 12} width="34" height="6" rx="3" fill={NEGRO} fillOpacity="0.5" />
                    </g>
                    <Hecho x={nueva.x + 66} y={nueva.y + 2} p={entrada(frame, 98, 16)} />

                    {/* La que se mueve a otro día: el hueco viejo queda libre. */}
                    {frame >= 196 && (
                        <rect
                            x={movida.x}
                            y={movida.y}
                            width="70"
                            height="30"
                            rx="6"
                            fill={BLANCO}
                            fillOpacity={0.12 + 0.5 * mover}
                            stroke={BLANCO}
                            strokeOpacity={0.5 * mover}
                        />
                    )}
                </Ventana>

                {/* Recordatorio del día anterior. */}
                <g opacity={entrada(frame, 136, 22)} transform="translate(206 344)">
                    <rect width="196" height="30" rx="15" fill={BLANCO} fillOpacity="0.08" stroke={BLANCO} strokeOpacity="0.16" />
                    <g transform={`translate(20 15) rotate(${Math.sin(campana * Math.PI * 2) * 14})`}>
                        <path
                            d="M -6 3 V -1 A 6 6 0 0 1 6 -1 V 3 L 8 5 H -8 Z"
                            fill="none"
                            stroke={BLANCO}
                            strokeOpacity="0.75"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                        />
                        <circle cy="7.5" r="1.6" fill={BLANCO} fillOpacity="0.75" />
                    </g>
                    <text x="38" y="19" fontSize="10.5" fill={BLANCO} fillOpacity="0.6" fontFamily="inherit" letterSpacing="0.1em">
                        RECORDATORIO · 24 H
                    </text>
                </g>

                <Etiqueta x={506} y={364} texto="SOLO HORARIOS QUE EXISTEN" p={pNueva} />
            </g>
        </Lienzo>
    );
};

/* --- Proceso --------------------------------------------------------------- */

/** Parte un título en líneas de pocos caracteres: SVG no hace saltos solo. */
function partir(texto = '', maximo = 17) {
    const lineas = [];
    let actual = '';
    for (const palabra of String(texto).split(/\s+/).filter(Boolean)) {
        const prueba = actual ? `${actual} ${palabra}` : palabra;
        if (prueba.length > maximo && actual) {
            lineas.push(actual);
            actual = palabra;
        } else {
            actual = prueba;
        }
    }
    if (actual) lineas.push(actual);
    return lineas.slice(0, 3);
}

const PASOS_POR_DEFECTO = [
    { titulo: 'Diagnóstico', duracion: 'Semana 1' },
    { titulo: 'Diseño', duracion: 'Semana 1' },
    { titulo: 'Conexión', duracion: 'Semana 2' },
    { titulo: 'Puesta en marcha', duracion: 'Semana 3' },
];

const pasosDe = (datos) => {
    const pasos = (datos?.pasos ?? []).filter((p) => p?.titulo);
    return pasos.length >= 2 ? pasos.slice(0, 6) : PASOS_POR_DEFECTO;
};

/** Cuándo se enciende cada paso. Lo comparten la escena y su duración. */
const INICIO = 30;
/** Media baldosa más un respiro: donde empieza y acaba cada tramo de línea. */
const MARGEN = 40;
const TRAMO = 48;
export const cicloProceso = (datos) => INICIO + pasosDe(datos).length * TRAMO + 90;
export const posterProceso = (datos) => INICIO + pasosDe(datos).length * TRAMO + 20;

/**
 * Proceso: los pasos de cómo trabajamos, en línea. La luz avanza de uno a
 * otro, cada paso se enciende al llegar y queda marcado como hecho al pasar
 * al siguiente. Los títulos y los plazos son los del contenido editable.
 */
export const Proceso = ({ frame, datos }) => {
    const pasos = pasosDe(datos);
    const n = pasos.length;
    const ciclo = cicloProceso(datos);
    const fin = cierre(frame, ciclo);
    const { ancho } = LIENZO_PROCESO;

    const x0 = 96;
    const x1 = ancho - 96;
    const y = 84;
    const xs = pasos.map((_, i) => x0 + (i * (x1 - x0)) / (n - 1));
    const llega = (i) => INICIO + i * TRAMO;

    // Dónde está la luz: avanza de nodo en nodo con la curva de la casa.
    let cabeza = x0;
    for (let i = 0; i < n - 1; i += 1) {
        const t = entrada(frame, llega(i) + 6, TRAMO - 10);
        if (t > 0) cabeza = interpolar(t, [0, 1], [xs[i], xs[i + 1]]);
    }
    const activo = pasos.reduce((a, _, i) => (frame >= llega(i) ? i : a), -1);

    return (
        <Lienzo ancho={LIENZO_PROCESO.ancho} alto={LIENZO_PROCESO.alto}>
            <g opacity={fin}>
                {/* La línea va por tramos, de borde a borde de cada paso: las
                    baldosas son translúcidas y una línea continua se vería
                    cruzándolas por dentro. */}
                {xs.slice(0, -1).map((x, i) => {
                    const desde = x + MARGEN;
                    const hasta = xs[i + 1] - MARGEN;
                    const avance = acotar(cabeza, desde, hasta);
                    return (
                        <g key={`tramo-${x}`}>
                            <Conector d={`M ${desde} ${y} H ${hasta}`} p={entrada(frame, i * 6, 30)} />
                            {avance > desde && (
                                <line
                                    x1={desde}
                                    y1={y}
                                    x2={avance}
                                    y2={y}
                                    stroke={BLANCO}
                                    strokeOpacity="0.85"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            )}
                        </g>
                    );
                })}
                {frame > INICIO &&
                    cabeza < x1 - 1 &&
                    xs.every((x) => Math.abs(cabeza - x) > MARGEN) && (
                        <circle cx={cabeza} cy={y} r="5" fill={BLANCO} opacity={0.6 + 0.4 * vaivén(frame, 20)} />
                    )}

                {pasos.map((paso, i) => {
                    const encendido = entrada(frame, llega(i), 18);
                    const hecho = i < n - 1 ? entrada(frame, llega(i + 1), 16) : entrada(frame, llega(i) + 30, 16);
                    const lineas = partir(paso.titulo);
                    return (
                        <g key={`${paso.titulo}-${i}`}>
                            <Baldosa x={xs[i]} y={y} tam={68} destacada={encendido > 0.5} p={entrada(frame, i * 6, 24)}>
                                <text
                                    x="34"
                                    y="41"
                                    textAnchor="middle"
                                    fontSize="20"
                                    fontWeight="700"
                                    fill={BLANCO}
                                    fillOpacity={0.35 + 0.65 * encendido}
                                    fontFamily="inherit"
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </text>
                            </Baldosa>
                            {i === activo && (
                                <Anillo x={xs[i]} y={y} radio={50} frame={frame} velocidad={0.5} opacidad={0.25} hueco={0.55} />
                            )}
                            <Hecho x={xs[i] + 30} y={y - 30} p={hecho} r={10} />

                            <text
                                x={xs[i]}
                                y={y + 76}
                                textAnchor="middle"
                                fontSize="17"
                                fontWeight="700"
                                fill={BLANCO}
                                fillOpacity={0.4 + 0.6 * encendido}
                                fontFamily="inherit"
                            >
                                {lineas.map((linea, j) => (
                                    <tspan key={linea} x={xs[i]} dy={j === 0 ? 0 : 21}>
                                        {linea}
                                    </tspan>
                                ))}
                            </text>
                            {paso.duracion && (
                                <text
                                    x={xs[i]}
                                    y={y + 76 + lineas.length * 21 + 6}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fill={BLANCO}
                                    fillOpacity={0.3 + 0.35 * encendido}
                                    fontFamily="inherit"
                                    letterSpacing="0.08em"
                                >
                                    {String(paso.duracion).toUpperCase()}
                                </text>
                            )}
                        </g>
                    );
                })}
            </g>
        </Lienzo>
    );
};
