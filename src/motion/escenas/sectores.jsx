import React from 'react';

import {
    Anillo,
    Baldosa,
    Burbuja,
    Conector,
    LIENZO,
    Lienzo,
    Marca,
    Pulso,
    Renglon,
    Telefono,
    trazado,
    entrada,
    interpolar,
    vaivén,
} from '../primitivas';

/*
 * Una escena por sector.
 *
 * Comparten esqueleto a propósito: en los seis giros pasa lo mismo —entra un
 * mensaje, el sistema lo resuelve, queda un registro— y dibujar seis mecanismos
 * distintos sería mentir sobre el producto.
 *
 * Lo que cambia es el ARTEFACTO: lo que el sistema produce en cada giro. En una
 * inmobiliaria es una visita agendada con su ficha; en un salón, el hueco de una
 * estilista; en un despacho, un expediente abierto. Ahí está la diferencia que
 * el visitante reconoce, y por eso es lo único que se dibuja distinto.
 */

const cx = LIENZO.ancho / 2;
const BLANCO = '#ffffff';

const Etiqueta = ({ x, y, texto, p = 1 }) => (
    <text
        x={x}
        y={y}
        textAnchor="middle"
        fontSize="10"
        fill={BLANCO}
        fillOpacity={0.5 * p}
        fontFamily="inherit"
        letterSpacing="0.1em"
    >
        {texto}
    </text>
);

/** El esqueleto común: teléfono, marca y el artefacto que produce el sistema. */
const EsqueletoSector = ({ frame, etiqueta, mensajes, Artefacto }) => {
    const pTelefono = entrada(frame, 0, 26);
    const pMarca = entrada(frame, 26, 28);
    const pArtefacto = entrada(frame, 52, 32);
    const respiro = interpolar(vaivén(frame, 170), [0, 1], [1, 1.03]);
    const d = 'M 216 200 H 250 Q 268 200 268 200 H 286';

    return (
        <Lienzo>
            <Telefono x={84} y={62} ancho={128} alto={276} p={pTelefono}>
                <g>
                    <rect x="0" y="0" width="128" height="28" fill={BLANCO} fillOpacity="0.06" />
                    <Marca x={19} y={14} tam={15} p={pTelefono} />
                    <Renglon x={32} y={10} ancho={50} alto={5} opacidad={0.4} />

                    {mensajes.map((m, i) => (
                        <Burbuja
                            key={i}
                            x={m.propia ? 116 : 12}
                            y={44 + i * 34}
                            ancho={m.ancho}
                            alto={26}
                            propia={m.propia}
                            p={entrada(frame, 14 + i * 12, 24)}
                        />
                    ))}
                </g>
            </Telefono>

            <Conector d={trazado(216, 200, 286, 200, { modo: 'ele' })} p={pMarca} />
            {pMarca > 0.95 && <Pulso d={d} frame={frame} periodo={84} largo={26} />}

            <g transform={`translate(${cx - 8} 200) scale(${respiro}) translate(${-(cx - 8)} -200)`}>
                <Baldosa x={cx - 8} y={200} tam={86} destacada p={pMarca}>
                    <g transform="translate(43 43)">
                        <Marca x={0} y={0} tam={46} p={1} />
                    </g>
                </Baldosa>
            </g>
            <Anillo x={cx - 8} y={200} radio={62} frame={frame} velocidad={0.26} opacidad={0.2} hueco={0.64} />

            <Conector d={trazado(358, 200, 410, 200, { modo: 'ele' })} p={pArtefacto} />

            <g opacity={pArtefacto}>
                <Artefacto frame={frame} p={pArtefacto} />
            </g>

            <Etiqueta x={504} y={348} texto={etiqueta} p={pArtefacto} />
        </Lienzo>
    );
};

/* --- Artefactos: lo que el sistema deja hecho en cada giro --------------- */

/** Inmobiliarias: la ficha de la propiedad con la visita puesta en agenda. */
const FichaPropiedad = ({ frame }) => (
    <g transform="translate(414 96)">
        <rect width="180" height="208" rx="12" fill="url(#baldosaBase)" stroke={BLANCO} strokeOpacity="0.18" />
        <rect x="14" y="14" width="152" height="72" rx="8" fill={BLANCO} fillOpacity="0.07" />
        {/* Silueta de casa: lo mínimo para que se lea como propiedad. */}
        <path d="M 60 62 V 40 L 90 22 L 120 40 V 62 Z" fill="none" stroke={BLANCO} strokeOpacity="0.3" strokeWidth="1.5" />
        <Renglon x={14} y={98} ancho={110 * entrada(frame, 58, 22)} alto={8} opacidad={0.7} />
        <Renglon x={14} y={114} ancho={140 * entrada(frame, 62, 22)} alto={5} opacidad={0.18} />
        <rect
            x="14"
            y="140"
            width={152 * entrada(frame, 72, 26)}
            height="28"
            rx="8"
            fill={BLANCO}
            fillOpacity="0.9"
        />
        <Renglon x={14} y={180} ancho={96} alto={5} opacidad={0.18} />
    </g>
);

/** Salones: la agenda de las estilistas y el hueco que se acaba de ocupar. */
const AgendaEstilistas = ({ frame }) => {
    const columnas = [0, 1, 2];
    const franjas = [0, 1, 2, 3, 4];
    // La celda que se ocupa sola durante la escena.
    const nueva = { c: 1, f: 2 };

    return (
        <g transform="translate(414 106)">
            <rect width="180" height="188" rx="12" fill="url(#baldosaBase)" stroke={BLANCO} strokeOpacity="0.18" />
            {columnas.map((c) => (
                <Renglon key={`t${c}`} x={16 + c * 54} y={16} ancho={40} alto={5} opacidad={0.3} />
            ))}
            {columnas.map((c) =>
                franjas.map((f) => {
                    const esNueva = c === nueva.c && f === nueva.f;
                    const ocupada = (c + f) % 3 === 0;
                    return (
                        <rect
                            key={`${c}-${f}`}
                            x={16 + c * 54}
                            y={32 + f * 28}
                            width="42"
                            height="22"
                            rx="5"
                            fill={BLANCO}
                            fillOpacity={
                                esNueva ? 0.9 * entrada(frame, 70, 26) : ocupada ? 0.12 : 0.03
                            }
                            stroke={BLANCO}
                            strokeOpacity={esNueva ? 0 : 0.1}
                        />
                    );
                })
            )}
        </g>
    );
};

/** Clínicas: la cita confirmada con su recordatorio programado. */
const CitaConfirmada = ({ frame }) => (
    <g transform="translate(414 112)">
        <rect width="180" height="176" rx="12" fill="url(#baldosaBase)" stroke={BLANCO} strokeOpacity="0.18" />
        <circle cx="90" cy="52" r="26" fill="none" stroke={BLANCO} strokeOpacity="0.3" strokeWidth="1.5" />
        <path
            d="M 78 52 L 87 61 L 103 43"
            fill="none"
            stroke={BLANCO}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="40"
            strokeDashoffset={40 * (1 - entrada(frame, 66, 26))}
        />
        <Renglon x={30} y={96} ancho={120 * entrada(frame, 60, 22)} alto={7} opacidad={0.6} />
        <Renglon x={44} y={112} ancho={92 * entrada(frame, 64, 22)} alto={5} opacidad={0.2} />
        <rect
            x="30"
            y="134"
            width={120 * entrada(frame, 78, 24)}
            height="22"
            rx="11"
            fill={BLANCO}
            fillOpacity="0.12"
        />
    </g>
);

/** Gimnasios: los planes y la clase de prueba apartada. */
const PlanesGimnasio = ({ frame }) => (
    <g transform="translate(414 96)">
        <rect width="180" height="208" rx="12" fill="url(#baldosaBase)" stroke={BLANCO} strokeOpacity="0.18" />
        {[0, 1, 2].map((i) => {
            const elegido = i === 1;
            return (
                <rect
                    key={i}
                    x="16"
                    y={18 + i * 50}
                    width="148"
                    height={40 * entrada(frame, 58 + i * 6, 22)}
                    rx="8"
                    fill={BLANCO}
                    fillOpacity={elegido ? 0.9 : 0.06}
                    stroke={BLANCO}
                    strokeOpacity={elegido ? 0 : 0.12}
                />
            );
        })}
        <rect
            x="16"
            y="172"
            width={148 * entrada(frame, 78, 26)}
            height="22"
            rx="11"
            fill={BLANCO}
            fillOpacity="0.14"
        />
    </g>
);

/** Despachos: el expediente abierto con los datos del caso ya recogidos. */
const ExpedienteAbierto = ({ frame }) => (
    <g transform="translate(414 100)">
        <rect width="180" height="200" rx="12" fill="url(#baldosaBase)" stroke={BLANCO} strokeOpacity="0.18" />
        <rect x="16" y="16" width="60" height="14" rx="7" fill={BLANCO} fillOpacity="0.85" />
        {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
                <rect
                    x="16"
                    y={44 + i * 28}
                    width="12"
                    height="12"
                    rx="3"
                    fill={BLANCO}
                    fillOpacity={0.1 + 0.7 * entrada(frame, 60 + i * 7, 20)}
                />
                <Renglon
                    x={36}
                    y={48 + i * 28}
                    ancho={(112 - i * 10) * entrada(frame, 60 + i * 7, 20)}
                    alto={5}
                    opacidad={0.2}
                />
            </g>
        ))}
    </g>
);

/** Comercio: el pedido en camino con su seguimiento. */
const PedidoEnCamino = ({ frame }) => (
    <g transform="translate(414 106)">
        <rect width="180" height="188" rx="12" fill="url(#baldosaBase)" stroke={BLANCO} strokeOpacity="0.18" />
        <rect x="62" y="24" width="56" height="44" rx="6" fill={BLANCO} fillOpacity="0.08" stroke={BLANCO} strokeOpacity="0.2" />
        <line x1="62" y1="40" x2="118" y2="40" stroke={BLANCO} strokeOpacity="0.2" />
        <line x1="90" y1="24" x2="90" y2="68" stroke={BLANCO} strokeOpacity="0.2" />

        <line x1="26" y1="100" x2="154" y2="100" stroke={BLANCO} strokeOpacity="0.18" />
        {[0, 1, 2].map((i) => {
            const activo = entrada(frame, 62 + i * 12, 22);
            return (
                <circle
                    key={i}
                    cx={26 + i * 64}
                    cy={100}
                    r="7"
                    fill={BLANCO}
                    fillOpacity={0.12 + 0.78 * activo}
                />
            );
        })}
        <Renglon x={26} y={126} ancho={128 * entrada(frame, 76, 24)} alto={6} opacidad={0.45} />
        <Renglon x={26} y={142} ancho={92 * entrada(frame, 80, 24)} alto={5} opacidad={0.18} />
    </g>
);

/* --- Las seis escenas --------------------------------------------------- */

const conversacion = (a, b, c) => [
    { ancho: a, propia: false },
    { ancho: b, propia: true },
    { ancho: c, propia: false },
    { ancho: b - 12, propia: true },
];

export const Inmobiliarias = ({ frame }) => (
    <EsqueletoSector
        frame={frame}
        etiqueta="VISITA AGENDADA"
        mensajes={conversacion(88, 106, 70)}
        Artefacto={FichaPropiedad}
    />
);

export const SalonesDeBelleza = ({ frame }) => (
    <EsqueletoSector
        frame={frame}
        etiqueta="HUECO OCUPADO"
        mensajes={conversacion(76, 98, 84)}
        Artefacto={AgendaEstilistas}
    />
);

export const Clinicas = ({ frame }) => (
    <EsqueletoSector
        frame={frame}
        etiqueta="CITA CONFIRMADA"
        mensajes={conversacion(94, 100, 66)}
        Artefacto={CitaConfirmada}
    />
);

export const Gimnasios = ({ frame }) => (
    <EsqueletoSector
        frame={frame}
        etiqueta="CLASE DE PRUEBA"
        mensajes={conversacion(70, 104, 88)}
        Artefacto={PlanesGimnasio}
    />
);

export const Despachos = ({ frame }) => (
    <EsqueletoSector
        frame={frame}
        etiqueta="EXPEDIENTE ABIERTO"
        mensajes={conversacion(98, 94, 74)}
        Artefacto={ExpedienteAbierto}
    />
);

export const Comercio = ({ frame }) => (
    <EsqueletoSector
        frame={frame}
        etiqueta="PEDIDO EN CAMINO"
        mensajes={conversacion(82, 108, 78)}
        Artefacto={PedidoEnCamino}
    />
);
