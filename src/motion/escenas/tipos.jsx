import React from 'react';

import {
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

/*
 * Una escena por tipo de página web.
 *
 * La misma regla que las de servicios: cada dibujo enseña el MECANISMO del
 * tipo de sitio, no su tema. Los cuatro se reconocen por lo que hacen, no por
 * cómo se ven:
 *
 *   Landing       una página que se recorre entera y acaba en una sola acción
 *   Corporativo   el árbol del sitio: una página por servicio, cada una indexada
 *   Tienda        del producto al carrito, al pago y al pedido en camino
 *   A medida      el panel donde se edita y la página que cambia a la vez
 *
 * Se ven más pequeñas que las de servicio —dentro de una tarjeta, no en un
 * hero—, así que las etiquetas van a más cuerpo y cada escena cuenta una sola
 * cosa. Las cuatro se desvanecen al final del ciclo para que el bucle no salte
 * de la escena completa al lienzo vacío.
 *
 * Los ciclos se exportan porque el registro (index.js) y el fundido de salida
 * tienen que usar el mismo número: si divergen, el bucle corta a media escena.
 */

const BLANCO = '#ffffff';
const NEGRO = '#0a0a0a';

export const CICLO_LANDING = 240;
export const CICLO_CORPORATIVO = 270;
export const CICLO_TIENDA = 300;
export const CICLO_MEDIDA = 300;

/** Fundido de salida en los últimos fotogramas del ciclo. */
const cierre = (frame, ciclo) => 1 - entrada(frame, ciclo - 26, 24);

const Etiqueta = ({ x, y, texto, p = 1, ancla = 'middle', tam = 12 }) => (
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

/** Marca de verificación que se dibuja sola. */
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

/** Insignia redonda con visto: «hecho». */
const Hecho = ({ x, y, p, r = 9 }) => (
    <g opacity={p}>
        <circle cx={x} cy={y} r={r * interpolar(p, [0, 1], [0.6, 1])} fill={BLANCO} />
        <Visto x={x} y={y} p={p} />
    </g>
);

/** Puntero del ratón. */
const Puntero = ({ x, y, p = 1, escala = 1 }) => (
    <g opacity={p} transform={`translate(${x} ${y}) scale(${escala})`}>
        <path
            d="M0 0 L0 17 L4.6 12.6 L7.8 19.6 L10.6 18.4 L7.4 11.4 L13.4 11.4 Z"
            fill={BLANCO}
            stroke={NEGRO}
            strokeWidth="1"
            strokeLinejoin="round"
        />
    </g>
);

/* --- Landing ----------------------------------------------------------- */

/**
 * Landing: la página se recorre entera y todo desemboca en un solo botón. El
 * clic sale del sitio y llega como solicitud al teléfono del negocio.
 */
export const TipoLanding = ({ frame }) => {
    const fin = cierre(frame, CICLO_LANDING);
    const p = entrada(frame, 0, 24);
    const recorrido = interpolar(entrada(frame, 26, 70), [0, 1], [0, -150]);
    const boton = entrada(frame, 18, 24);
    const llegada = entrada(frame, 96, 34);
    const puntero = entrada(frame, 90, 14) * (1 - entrada(frame, 150, 16));
    const pulsado = frame >= 130 && frame < 140;
    const envio = entrada(frame, 138, 26);
    const aviso1 = entrada(frame, 160, 22);
    const aviso2 = entrada(frame, 176, 22);
    const llamada = frame > 40 && frame < 130 ? vaivén(frame - 40, 44) : 0;

    // Ventana: 272 × 316. El cuerpo empieza 26 px por debajo del borde.
    const vx = 64;
    const vy = 40;
    const ancho = 272;
    const salidaBoton = { x: vx + ancho, y: vy + 26 + 261 };
    const camino = trazado(salidaBoton.x, salidaBoton.y, 446, 196, { radio: 20 });

    return (
        <Lienzo>
            <defs>
                <clipPath id="tipo-landing-recorte">
                    <rect x="0" y="0" width={ancho} height="226" />
                </clipPath>
            </defs>

            <g opacity={fin}>
                <Ventana x={vx} y={vy} ancho={ancho} alto={316} p={p} titulo="tunegocio.mx/oferta">
                    <g clipPath="url(#tipo-landing-recorte)">
                        <g transform={`translate(0 ${recorrido})`}>
                            <Renglon x={24} y={24} ancho={172} alto={14} opacidad={0.8} />
                            <Renglon x={24} y={48} ancho={222} alto={6} opacidad={0.18} />
                            <Renglon x={24} y={60} ancho={188} alto={6} opacidad={0.18} />
                            <rect
                                x="24"
                                y="82"
                                width="224"
                                height="96"
                                rx="10"
                                fill={BLANCO}
                                fillOpacity="0.05"
                                stroke={BLANCO}
                                strokeOpacity="0.12"
                            />
                            <Renglon x={24} y={198} ancho={124} alto={9} opacidad={0.5} />
                            {[220, 240, 260].map((y) => (
                                <g key={y}>
                                    <circle cx="29" cy={y + 3} r="3" fill={BLANCO} fillOpacity="0.4" />
                                    <Renglon x={40} y={y} ancho={170} alto={6} opacidad={0.18} />
                                </g>
                            ))}
                            <rect
                                x="24"
                                y="290"
                                width="224"
                                height="70"
                                rx="10"
                                fill={BLANCO}
                                fillOpacity="0.05"
                                stroke={BLANCO}
                                strokeOpacity="0.12"
                            />
                            <Renglon x={24} y={378} ancho={150} alto={9} opacidad={0.5} />
                            <Renglon x={24} y={396} ancho={210} alto={6} opacidad={0.18} />
                            <Renglon x={24} y={408} ancho={176} alto={6} opacidad={0.18} />
                        </g>
                    </g>

                    <line x1="0" y1="232" x2={ancho} y2="232" stroke={BLANCO} strokeOpacity="0.1" />

                    {/* La única acción de la página. Late mientras espera. */}
                    <g opacity={boton}>
                        <rect
                            x={24 - 4 * llamada}
                            y={246 - 4 * llamada}
                            width={224 + 8 * llamada}
                            height={30 + 8 * llamada}
                            rx={15 + 4 * llamada}
                            fill="none"
                            stroke={BLANCO}
                            strokeOpacity={0.35 * (1 - llamada)}
                        />
                        <g
                            transform={
                                pulsado
                                    ? 'translate(136 261) scale(0.94) translate(-136 -261)'
                                    : undefined
                            }
                        >
                            <rect x="24" y="246" width="224" height="30" rx="15" fill={BLANCO} fillOpacity="0.92" />
                            <rect x="96" y="258" width="80" height="6" rx="3" fill={NEGRO} fillOpacity="0.55" />
                        </g>
                    </g>
                </Ventana>

                <Puntero
                    x={interpolar(llegada, [0, 1], [392, 214])}
                    y={interpolar(llegada, [0, 1], [236, 324])}
                    p={puntero}
                    escala={pulsado ? 0.9 : 1}
                />

                <Conector d={camino} p={envio} />
                {frame > 150 && <Pulso d={camino} frame={frame} periodo={80} retraso={150} />}

                <Telefono x={446} y={74} ancho={134} alto={252} p={entrada(frame, 8, 26)}>
                    <Marca x={24} y={12} tam={16} p={1} />
                    <Renglon x={38} y={9} ancho={56} alto={6} opacidad={0.5} />
                    <line x1="0" y1="28" x2="134" y2="28" stroke={BLANCO} strokeOpacity="0.1" />
                    <Burbuja x={12} y={44} ancho={98} alto={30} p={aviso1} />
                    <Burbuja x={12} y={82} ancho={74} alto={22} p={aviso2} />
                    <g opacity={aviso1}>
                        <Renglon x={20} y={52} ancho={64} alto={5} opacidad={0.5} />
                        <Renglon x={20} y={62} ancho={44} alto={5} opacidad={0.25} />
                    </g>
                </Telefono>

                <Etiqueta x={vx + ancho / 2} y={384} texto="UNA PÁGINA · UNA ACCIÓN" p={p} />
                <Etiqueta x={513} y={352} texto="SOLICITUD RECIBIDA" p={aviso1} tam={11} />
            </g>
        </Lienzo>
    );
};

/* --- Sitio corporativo ------------------------------------------------- */

/**
 * Sitio corporativo: la portada se ramifica en una página por servicio, y cada
 * una queda indexada por separado. Es la estructura la que posiciona.
 */
export const TipoCorporativo = ({ frame }) => {
    const fin = cierre(frame, CICLO_CORPORATIVO);
    const inicio = entrada(frame, 0, 24);
    const tallo = 'M 320 122 V 150';
    const centros = [92, 244, 396, 548];

    return (
        <Lienzo>
            <g opacity={fin}>
                <Ventana x={240} y={22} ancho={160} alto={100} p={inicio} titulo="inicio">
                    <Renglon x={14} y={14} ancho={92} alto={9} opacidad={0.75} />
                    <Renglon x={14} y={31} ancho={124} alto={5} opacidad={0.18} />
                    <rect x="14" y="46" width="52" height="16" rx="8" fill={BLANCO} fillOpacity="0.85" />
                </Ventana>

                <Conector d={tallo} p={entrada(frame, 22, 14)} />

                {centros.map((c, i) => {
                    const camino = trazado(320, 150, c, 212, { modo: 'ele', radio: 18 });
                    const pagina = entrada(frame, 48 + i * 10, 24);
                    const indexada = entrada(frame, 132 + i * 14, 20);
                    return (
                        <g key={c}>
                            <Conector d={camino} p={entrada(frame, 30 + i * 8, 26)} />
                            <Pulso d={camino} frame={frame} periodo={96} retraso={84 + i * 12} largo={40} />
                            <Ventana
                                x={c - 56}
                                y={212}
                                ancho={112}
                                alto={96}
                                p={pagina}
                                titulo={`/servicio-${i + 1}`}
                            >
                                <Renglon x={12} y={12} ancho={64} alto={7} opacidad={0.6} />
                                <Renglon x={12} y={26} ancho={84} alto={4} opacidad={0.16} />
                                <Renglon x={12} y={36} ancho={70} alto={4} opacidad={0.16} />
                                <rect x="12" y="48" width="40" height="12" rx="6" fill={BLANCO} fillOpacity="0.7" />
                            </Ventana>
                            <Hecho x={c + 50} y={214} p={indexada} />
                        </g>
                    );
                })}

                <Etiqueta x={320} y={350} texto="UNA PÁGINA POR SERVICIO" p={entrada(frame, 60, 24)} />
                <Etiqueta
                    x={320}
                    y={370}
                    texto="CADA UNA, INDEXADA EN GOOGLE"
                    p={entrada(frame, 150, 24)}
                    tam={10}
                />
            </g>
        </Lienzo>
    );
};

/* --- Tienda en línea --------------------------------------------------- */

/** Carrito dibujado dentro de una baldosa de 60. */
const IconoCarrito = () => (
    <g fill="none" stroke={BLANCO} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85">
        <path d="M14 18 H20 L25 38 H43 L47 24 H22" />
        <circle cx="27" cy="44" r="2.4" />
        <circle cx="41" cy="44" r="2.4" />
    </g>
);

/** Tarjeta de pago dentro de una baldosa de 60. */
const IconoPago = () => (
    <g fill="none" stroke={BLANCO} strokeWidth="2" strokeOpacity="0.85" strokeLinecap="round">
        <rect x="13" y="19" width="34" height="23" rx="4" />
        <line x1="13" y1="26" x2="47" y2="26" />
        <line x1="18" y1="35" x2="27" y2="35" />
    </g>
);

/**
 * Tienda en línea: un producto se elige, viaja al carrito, se paga y el pedido
 * avanza solo por sus estados. Cada paso avisa sin que nadie lo empuje.
 */
export const TipoTienda = ({ frame }) => {
    const fin = cierre(frame, CICLO_TIENDA);
    const p = entrada(frame, 0, 24);
    const elegido = entrada(frame, 40, 16);
    const enCarrito = frame >= 92;

    const alCarrito = trazado(308, 121, 370, 96, { radio: 16 });
    const alPago = 'M 430 96 H 530';
    const alEstado = 'M 560 126 V 158 Q 560 170 548 170 H 404 Q 392 170 392 182 V 223';

    // Estados del pedido: cada nodo se enciende cuando le llega la línea.
    const nodos = [
        { x: 392, texto: 'PAGADO', desde: 150 },
        { x: 486, texto: 'ENVIADO', desde: 192 },
        { x: 580, texto: 'ENTREGADO', desde: 234 },
    ];
    const avance = interpolar(frame, [150, 234], [0, 1]);

    return (
        <Lienzo>
            <g opacity={fin}>
                <Ventana x={28} y={40} ancho={280} alto={300} p={p} titulo="tunegocio.mx/tienda">
                    {[0, 1, 2, 3].map((i) => {
                        const x = 18 + (i % 2) * 130;
                        const y = 18 + Math.floor(i / 2) * 128;
                        const destacado = i === 0 ? elegido : 0;
                        return (
                            <g key={i} opacity={entrada(frame, 8 + i * 6, 22)}>
                                <rect
                                    x={x}
                                    y={y}
                                    width="114"
                                    height="74"
                                    rx="8"
                                    fill={BLANCO}
                                    fillOpacity={0.05 + 0.04 * destacado}
                                    stroke={BLANCO}
                                    strokeOpacity={0.12 + 0.4 * destacado}
                                />
                                <Renglon x={x} y={y + 84} ancho={72} alto={6} opacidad={0.35} />
                                <Renglon x={x} y={y + 98} ancho={40} alto={7} opacidad={0.7} />
                                <rect
                                    x={x + 78}
                                    y={y + 92}
                                    width="36"
                                    height="16"
                                    rx="8"
                                    fill={BLANCO}
                                    fillOpacity={0.14 + 0.76 * destacado}
                                />
                            </g>
                        );
                    })}
                </Ventana>

                <Conector d={alCarrito} p={entrada(frame, 56, 20)} />
                <Pulso d={alCarrito} frame={frame} periodo={120} retraso={62} largo={36} />

                <Baldosa x={400} y={96} tam={60} destacada={enCarrito} p={entrada(frame, 46, 22)}>
                    <IconoCarrito />
                    <g opacity={entrada(frame, 88, 12)}>
                        <circle cx="54" cy="6" r="9" fill={BLANCO} />
                        <text
                            x="54"
                            y="9.5"
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="700"
                            fill={NEGRO}
                            fontFamily="inherit"
                        >
                            1
                        </text>
                    </g>
                </Baldosa>

                <Conector d={alPago} p={entrada(frame, 100, 18)} />

                <Baldosa x={560} y={96} tam={60} p={entrada(frame, 108, 22)}>
                    <IconoPago />
                    <Hecho x={54} y={6} p={entrada(frame, 130, 16)} />
                </Baldosa>

                <Conector d={alEstado} p={entrada(frame, 136, 20)} />

                <g opacity={entrada(frame, 140, 20)}>
                    <line x1="392" y1="230" x2="580" y2="230" stroke={BLANCO} strokeOpacity="0.14" strokeWidth="2" />
                    <line
                        x1="392"
                        y1="230"
                        x2={392 + 188 * avance}
                        y2="230"
                        stroke={BLANCO}
                        strokeOpacity="0.8"
                        strokeWidth="2"
                    />
                </g>
                {nodos.map((n) => {
                    const encendido = entrada(frame, n.desde, 14);
                    return (
                        <g key={n.x} opacity={entrada(frame, 140, 20)}>
                            <circle
                                cx={n.x}
                                cy="230"
                                r="8"
                                fill={NEGRO}
                                stroke={BLANCO}
                                strokeOpacity={0.3 + 0.6 * encendido}
                                strokeWidth="1.5"
                            />
                            <circle cx={n.x} cy="230" r={5 * encendido} fill={BLANCO} />
                            <Etiqueta x={n.x} y={258} texto={n.texto} p={0.4 + 0.6 * encendido} tam={10} />
                        </g>
                    );
                })}

                <Etiqueta x={486} y={320} texto="PEDIDO EN CAMINO" p={entrada(frame, 236, 20)} />
                <Etiqueta x={168} y={374} texto="CATÁLOGO · CARRITO · PAGO" p={p} />
            </g>
        </Lienzo>
    );
};

/* --- Sitio a medida con panel ------------------------------------------ */

/** Agenda de la semana dentro de una baldosa de 50. */
const IconoAgenda = () => (
    <g>
        {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
                key={i}
                x={11 + (i % 3) * 10}
                y={15 + Math.floor(i / 3) * 10}
                width="7"
                height="7"
                rx="1.5"
                fill={BLANCO}
                fillOpacity={i === 4 ? 0.9 : 0.28}
            />
        ))}
    </g>
);

/** Fichas de clientes dentro de una baldosa de 50. */
const IconoCrm = () => (
    <g>
        {[0, 1, 2].map((i) => (
            <g key={i}>
                <circle cx="15" cy={16 + i * 9} r="2.6" fill={BLANCO} fillOpacity="0.6" />
                <rect x="21" y={14.5 + i * 9} width={i === 1 ? 14 : 18} height="3.5" rx="1.75" fill={BLANCO} fillOpacity="0.35" />
            </g>
        ))}
    </g>
);

/**
 * A medida con panel: se escribe en el panel y la página cambia a la vez. Por
 * debajo, lo que la hace a medida: la agenda, el CRM y el asistente conectados.
 */
export const TipoMedida = ({ frame }) => {
    const fin = cierre(frame, CICLO_MEDIDA);
    const p = entrada(frame, 0, 24);

    // El campo se vacía y se vuelve a escribir, a golpes de tecla.
    const seleccion = frame >= 58 && frame < 68;
    const tecleo = Math.floor(interpolar(frame, [70, 130], [0, 1]) * 14) / 14;
    const escrito = frame < 64 ? 112 : 150 * tecleo;
    const escribiendo = frame >= 64 && frame < 136;
    const cursor = escribiendo || Math.floor(frame / 10) % 2 === 0 ? 1 : 0;
    const cambio = frame > 64 && frame < 150 ? vaivén(frame - 64, 36) : 0;

    const alPreview = trazado(278, 147, 318, 82, { radio: 12 });

    return (
        <Lienzo>
            <g opacity={fin}>
                <Ventana x={28} y={34} ancho={250} alto={214} p={p} titulo="panel">
                    {[0, 1, 2].map((f) => {
                        const y = 14 + f * 50;
                        const activo = f === 1 && frame >= 50 && frame < 150;
                        return (
                            <g key={f} opacity={entrada(frame, 10 + f * 8, 22)}>
                                <Renglon x={16} y={y} ancho={60} alto={5} opacidad={0.3} />
                                <rect
                                    x="16"
                                    y={y + 10}
                                    width="218"
                                    height="26"
                                    rx="6"
                                    fill={BLANCO}
                                    fillOpacity="0.04"
                                    stroke={BLANCO}
                                    strokeOpacity={activo ? 0.5 : 0.16}
                                />
                            </g>
                        );
                    })}
                    <Renglon x={26} y={34} ancho={120} alto={6} opacidad={0.5} />
                    <Renglon x={26} y={134} ancho={92} alto={6} opacidad={0.5} />

                    {seleccion && <rect x="24" y="81" width="116" height="12" rx="2" fill={BLANCO} fillOpacity="0.25" />}
                    <Renglon x={26} y={84} ancho={Math.max(escrito, 0.1)} alto={6} opacidad={0.8} />
                    {frame >= 50 && frame < 150 && (
                        <rect x={28 + escrito} y="79" width="1.5" height="16" fill={BLANCO} fillOpacity={0.9 * cursor} />
                    )}

                    <rect x="16" y="162" width="70" height="18" rx="9" fill={BLANCO} fillOpacity={0.85 * entrada(frame, 30, 20)} />
                </Ventana>

                <Conector d={alPreview} p={entrada(frame, 60, 16)} />
                {escribiendo && <Pulso d={alPreview} frame={frame} periodo={36} retraso={66} largo={24} />}

                <Ventana x={318} y={34} ancho={294} alto={214} p={entrada(frame, 6, 24)} titulo="tunegocio.mx">
                    <rect
                        x={14 - 4}
                        y={14 - 4}
                        width={Math.max(escrito, 24) + 20}
                        height="24"
                        rx="6"
                        fill="none"
                        stroke={BLANCO}
                        strokeOpacity={0.5 * cambio}
                    />
                    <Renglon x={14} y={16} ancho={Math.max(escrito, 0.1)} alto={12} opacidad={0.8} />
                    <Renglon x={14} y={42} ancho={236} alto={5} opacidad={0.16} />
                    <Renglon x={14} y={53} ancho={198} alto={5} opacidad={0.16} />
                    <rect x="14" y="72" width="80" height="20" rx="10" fill={BLANCO} fillOpacity="0.85" />
                    {[0, 1, 2].map((i) => (
                        <rect
                            key={i}
                            x={14 + i * 90}
                            y="110"
                            width="80"
                            height="66"
                            rx="8"
                            fill={BLANCO}
                            fillOpacity="0.05"
                            stroke={BLANCO}
                            strokeOpacity="0.12"
                        />
                    ))}
                </Ventana>

                <Conector d="M 153 248 V 297" p={entrada(frame, 150, 18)} />
                <Conector d="M 465 248 V 297" p={entrada(frame, 150, 18)} />
                <Conector d="M 178 322 H 279" p={entrada(frame, 166, 18)} />
                <Conector d="M 339 322 H 440" p={entrada(frame, 166, 18)} />

                <Baldosa x={153} y={322} tam={50} p={entrada(frame, 158, 22)}>
                    <IconoAgenda />
                </Baldosa>
                <Baldosa x={309} y={322} tam={60} destacada p={entrada(frame, 172, 24)}>
                    <g transform="translate(30 30)">
                        <Marca x={0} y={0} tam={30} p={1} />
                    </g>
                </Baldosa>
                <Baldosa x={465} y={322} tam={50} p={entrada(frame, 164, 22)}>
                    <IconoCrm />
                </Baldosa>

                <Etiqueta x={320} y={386} texto="EDITA Y SE VE AL INSTANTE" p={entrada(frame, 120, 22)} />
            </g>
        </Lienzo>
    );
};
