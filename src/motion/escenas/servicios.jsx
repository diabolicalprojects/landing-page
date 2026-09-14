import React from 'react';

import {
    Anillo,
    Baldosa,
    Barrido,
    Burbuja,
    Conector,
    LIENZO,
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
 * Una escena por servicio.
 *
 * Trece dibujos es justo donde una web se llena de ilustraciones que se parecen
 * sin decir nada. La regla que las mantiene distintas: cada escena enseña el
 * MECANISMO del servicio, no su tema. La de posicionamiento no dibuja una lupa,
 * dibuja un resultado subiendo al primer puesto; la de auditoría no dibuja un
 * portapapeles, dibuja el punto por donde se escapa un prospecto.
 *
 * Todas comparten las mismas piezas (baldosa, conector, pulso, ventana,
 * teléfono), así que son variaciones de un sistema y no trece estilos.
 */

const cx = LIENZO.ancho / 2;
const cy = LIENZO.alto / 2;
const BLANCO = '#ffffff';

const Etiqueta = ({ x, y, texto, p = 1, ancla = 'middle' }) => (
    <text
        x={x}
        y={y}
        textAnchor={ancla}
        fontSize="10"
        fill={BLANCO}
        fillOpacity={0.5 * p}
        fontFamily="inherit"
        letterSpacing="0.1em"
    >
        {texto}
    </text>
);

/* --- Captación ---------------------------------------------------------- */

/** Posicionamiento orgánico: el resultado que sube hasta el primer puesto. */
export const PosicionamientoOrganico = ({ frame }) => {
    const p = entrada(frame, 0, 26);
    const subida = entrada(frame, 34, 56);
    // Empieza cuarto y acaba primero: tres huecos de 62 px.
    const y = interpolar(subida, [0, 1], [72 + 3 * 62, 72]);
    const otros = [0, 1, 2, 3].filter((i) => i !== 0);

    return (
        <Lienzo>
            <Ventana x={110} y={44} ancho={420} alto={312} p={p} titulo="Buscar en Google">
                {otros.map((i, idx) => {
                    // Los demás bajan un puesto conforme el nuestro sube.
                    const base = 28 + idx * 62;
                    const desplazado = base + interpolar(subida, [0, 1], [0, 62]);
                    return (
                        <g key={i} opacity={0.55}>
                            <Renglon x={26} y={desplazado} ancho={210} alto={8} opacidad={0.18} />
                            <Renglon x={26} y={desplazado + 16} ancho={330} alto={5} opacidad={0.09} />
                            <Renglon x={26} y={desplazado + 27} ancho={266} alto={5} opacidad={0.09} />
                        </g>
                    );
                })}

                <g transform={`translate(0 ${y - 44})`}>
                    <rect x="14" y="14" width="392" height="52" rx="10" fill={BLANCO} fillOpacity="0.08" />
                    <Marca x={38} y={40} tam={22} p={p} />
                    <Renglon x={60} y={26} ancho={186} alto={8} opacidad={0.85} />
                    <Renglon x={60} y={42} ancho={318} alto={5} opacidad={0.24} />
                    <Renglon x={60} y={53} ancho={240} alto={5} opacidad={0.24} />
                </g>
            </Ventana>
            <Etiqueta x={cx} y={382} texto="PRIMER RESULTADO" p={subida} />
        </Lienzo>
    );
};

/** Ficha de Google: el pin en el mapa y la ficha que se despliega. */
export const FichaDeGoogle = ({ frame }) => {
    const pMapa = entrada(frame, 0, 28);
    const pPin = entrada(frame, 22, 26);
    const pFicha = entrada(frame, 40, 30);
    const salto = interpolar(vaivén(frame, 110), [0, 1], [0, -8]);

    return (
        <Lienzo>
            <g opacity={pMapa * 0.5}>
                {[80, 150, 220, 290].map((y) => (
                    <path
                        key={y}
                        d={`M 40 ${y} Q ${cx} ${y - 34} ${LIENZO.ancho - 40} ${y}`}
                        stroke={BLANCO}
                        strokeOpacity="0.12"
                        fill="none"
                    />
                ))}
            </g>

            <g transform={`translate(200 ${164 + salto})`} opacity={pPin}>
                <path
                    d="M 0 26 C -18 4 -22 -4 -22 -12 A 22 22 0 1 1 22 -12 C 22 -4 18 4 0 26 Z"
                    fill={BLANCO}
                    fillOpacity="0.92"
                />
                <circle cx="0" cy="-12" r="9" fill="#000000" />
                <Marca x={0} y={-12} tam={14} p={pPin} />
            </g>
            <ellipse cx="200" cy="196" rx={18 * pPin} ry={4 * pPin} fill={BLANCO} fillOpacity="0.12" />

            <Ventana x={280} y={110} ancho={260} alto={180} p={pFicha} titulo="Ficha del negocio">
                <g>
                    <Renglon x={20} y={22} ancho={140} alto={9} opacidad={0.8} />
                    <Renglon x={20} y={40} ancho={200} alto={5} opacidad={0.16} />
                    {[0, 1, 2, 3, 4].map((i) => (
                        <path
                            key={i}
                            d="M 5 0 L 6.5 3.4 L 10 3.8 L 7.4 6.2 L 8.1 9.8 L 5 8 L 1.9 9.8 L 2.6 6.2 L 0 3.8 L 3.5 3.4 Z"
                            transform={`translate(${20 + i * 15} 56)`}
                            fill={BLANCO}
                            fillOpacity={0.75}
                        />
                    ))}
                    <Renglon x={20} y={84} ancho={170} alto={5} opacidad={0.14} />
                    <Renglon x={20} y={97} ancho={120} alto={5} opacidad={0.14} />
                    <rect x="20" y="116" width="96" height="24" rx="12" fill={BLANCO} fillOpacity="0.9" />
                </g>
            </Ventana>
        </Lienzo>
    );
};

/** Google Ads: varias pujas y la que se queda con el espacio de arriba. */
export const GoogleAds = ({ frame }) => {
    const pGana = entrada(frame, 46, 30);
    const pujas = [
        { x: 130, retraso: 6 },
        { x: 320, retraso: 14 },
        { x: 510, retraso: 22 },
    ];

    return (
        <Lienzo>
            <g opacity={pGana}>
                <rect x="120" y="52" width="400" height="58" rx="12" fill={BLANCO} fillOpacity="0.09" />
                <rect x="136" y="68" width="32" height="14" rx="7" fill={BLANCO} fillOpacity="0.85" />
                <text x="152" y="79" textAnchor="middle" fontSize="8" fill="#000" fontFamily="inherit" fontWeight="700">
                    AD
                </text>
                <Renglon x={180} y={68} ancho={190} alto={7} opacidad={0.8} />
                <Renglon x={180} y={83} ancho={300} alto={5} opacidad={0.2} />
            </g>
            <Etiqueta x={cx} y={36} texto="ESPACIO PATROCINADO" p={pGana} />

            {pujas.map((puja, i) => {
                const pi = entrada(frame, puja.retraso, 26);
                const gana = i === 1;
                const sube = gana ? interpolar(pGana, [0, 1], [0, -120]) : 0;
                const d = trazado(puja.x, 250 + sube, puja.x, 132, { modo: 'ele' });
                return (
                    <g key={puja.x} opacity={gana ? 1 : interpolar(pGana, [0, 1], [1, 0.32])}>
                        <Conector d={trazado(puja.x, 250 + sube, puja.x, 132, { modo: 'ele' })} p={pi} />
                        {gana && pi > 0.9 && <Pulso d={d} frame={frame} periodo={80} largo={40} />}
                        <Baldosa x={puja.x} y={286 + sube} tam={64} destacada={gana} p={pi}>
                            {gana ? (
                                <g transform="translate(32 32)">
                                    <Marca x={0} y={0} tam={30} p={pi} />
                                </g>
                            ) : (
                                <g transform="translate(32 32)">
                                    <circle r="10" fill="none" stroke={BLANCO} strokeOpacity="0.35" />
                                </g>
                            )}
                        </Baldosa>
                    </g>
                );
            })}
        </Lienzo>
    );
};

/** Posicionamiento en motores de IA: la pregunta, la marca y la respuesta citada. */
export const PosicionamientoEnIa = ({ frame }) => {
    const pPregunta = entrada(frame, 0, 24);
    const pMarca = entrada(frame, 24, 26);
    const pRespuesta = entrada(frame, 48, 34);
    const d = trazado(222, 118, 320, 176, { modo: 'ele' });

    return (
        <Lienzo>
            <g opacity={pPregunta}>
                <rect x="70" y="94" width="150" height="48" rx="12" fill={BLANCO} fillOpacity="0.08" />
                <Renglon x={86} y={110} ancho={110} alto={6} opacidad={0.4} />
                <Renglon x={86} y={124} ancho={78} alto={6} opacidad={0.22} />
            </g>
            <Etiqueta x={145} y={82} texto="PREGUNTA A LA IA" p={pPregunta} />

            <Conector d={trazado(222, 118, 320, 176, { modo: 'ele' })} p={pMarca} />
            {pMarca > 0.9 && <Pulso d={d} frame={frame} periodo={78} largo={34} />}

            <Baldosa x={320} y={206} tam={92} destacada p={pMarca}>
                <g transform="translate(46 46)">
                    <Marca x={0} y={0} tam={50} p={pMarca} />
                </g>
            </Baldosa>
            <Anillo x={320} y={206} radio={66} frame={frame} velocidad={0.3} opacidad={0.24} hueco={0.6} />

            <g opacity={pRespuesta}>
                <rect x="404" y="150" width="182" height="112" rx="12" fill={BLANCO} fillOpacity="0.06" />
                {[0, 1, 2, 3].map((i) => (
                    <Renglon
                        key={i}
                        x={420}
                        y={170 + i * 16}
                        ancho={interpolar(entrada(frame, 52 + i * 6, 22), [0, 1], [0, [150, 132, 146, 96][i]])}
                        alto={6}
                        opacidad={0.22}
                    />
                ))}
                <g opacity={entrada(frame, 78, 24)}>
                    <rect x="420" y="236" width="104" height="16" rx="8" fill={BLANCO} fillOpacity="0.9" />
                    <text x="472" y="248" textAnchor="middle" fontSize="8" fill="#000" fontFamily="inherit" fontWeight="700">
                        DIABOLICAL
                    </text>
                </g>
            </g>
            <Etiqueta x={495} y={288} texto="TE CITA COMO FUENTE" p={entrada(frame, 84, 24)} />
        </Lienzo>
    );
};

/* --- Conversión --------------------------------------------------------- */

/** Sitio web: la página montándose bloque a bloque. */
export const SitioWeb = ({ frame }) => {
    const p = entrada(frame, 0, 24);
    const bloques = [
        { x: 24, y: 22, w: 160, h: 12, r: 8 },
        { x: 24, y: 44, w: 300, h: 7, r: 12 },
        { x: 24, y: 58, w: 240, h: 7, r: 16 },
        { x: 24, y: 84, w: 104, h: 26, r: 22 },
    ];
    const tarjetas = [0, 1, 2];

    return (
        <Lienzo>
            <Ventana x={92} y={48} ancho={456} alto={300} p={p} titulo="tunegocio.mx">
                {bloques.map((b) => (
                    <Renglon
                        key={b.y}
                        x={b.x}
                        y={b.y}
                        ancho={b.w * entrada(frame, b.r, 24)}
                        alto={b.h}
                        opacidad={b.h > 10 ? 0.75 : 0.16}
                    />
                ))}
                <rect
                    x="24"
                    y="84"
                    width={104 * entrada(frame, 34, 24)}
                    height="26"
                    rx="13"
                    fill={BLANCO}
                    fillOpacity="0.9"
                />
                {tarjetas.map((i) => (
                    <rect
                        key={i}
                        x={24 + i * 142}
                        y="132"
                        width="130"
                        height={78 * entrada(frame, 46 + i * 8, 26)}
                        rx="10"
                        fill={BLANCO}
                        fillOpacity="0.05"
                        stroke={BLANCO}
                        strokeOpacity="0.12"
                    />
                ))}
                <g opacity={entrada(frame, 76, 26)}>
                    <Baldosa x={392} y={224} tam={44}>
                        <g transform="translate(22 22)">
                            <Marca x={0} y={0} tam={24} p={1} />
                        </g>
                    </Baldosa>
                    <Burbuja x={218} y={214} ancho={150} alto={22} p={entrada(frame, 86, 22)} />
                </g>
            </Ventana>
        </Lienzo>
    );
};

/** Embudo: lo que entra arriba y lo que sale abajo, etapa a etapa. */
export const EmbudosDeVenta = ({ frame }) => {
    const etapas = [
        { y: 78, w: 340, texto: 'VISITAN' },
        { y: 156, w: 250, texto: 'PREGUNTAN' },
        { y: 234, w: 164, texto: 'AGENDAN' },
        { y: 312, w: 92, texto: 'COMPRAN' },
    ];

    return (
        <Lienzo>
            {etapas.map((e, i) => {
                const p = entrada(frame, i * 12, 30);
                return (
                    <g key={e.texto} opacity={p}>
                        <rect
                            x={cx - (e.w / 2) * p}
                            y={e.y}
                            width={e.w * p}
                            height="44"
                            rx="10"
                            fill={BLANCO}
                            fillOpacity={0.05 + i * 0.045}
                            stroke={BLANCO}
                            strokeOpacity={0.14 + i * 0.05}
                        />
                        <Etiqueta x={cx} y={e.y + 27} texto={e.texto} p={p} />
                    </g>
                );
            })}

            {/* Los puntos que bajan por el embudo: lo que se mueve de verdad. */}
            {[0, 1, 2, 3, 4].map((i) => {
                const ciclo = ((frame + i * 26) % 130) / 130;
                const y = interpolar(ciclo, [0, 1], [66, 348]);
                // Se estrecha conforme baja, igual que el embudo.
                const dispersión = interpolar(ciclo, [0, 1], [150, 34]);
                const x = cx + Math.sin(i * 2.1) * dispersión;
                const visible = Math.sin(ciclo * Math.PI);
                return <circle key={i} cx={x} cy={y} r="3.5" fill={BLANCO} opacity={visible * 0.85} />;
            })}

            <g opacity={entrada(frame, 46, 30)}>
                <Marca x={cx} y={362} tam={26} p={1} />
            </g>
        </Lienzo>
    );
};

/* --- Atención y venta --------------------------------------------------- */

/** IA para WhatsApp: la conversación que se resuelve sola. */
export const IaWhatsapp = ({ frame }) => {
    const p = entrada(frame, 0, 26);
    const mensajes = [
        { y: 18, w: 96, propia: false, r: 18 },
        { y: 52, w: 112, propia: true, r: 34 },
        { y: 86, w: 74, propia: false, r: 52 },
        { y: 120, w: 118, propia: true, r: 70 },
    ];

    return (
        <Lienzo>
            <Telefono x={254} y={52} ancho={132} alto={296} p={p}>
                <g>
                    <rect x="0" y="0" width="132" height="30" fill={BLANCO} fillOpacity="0.06" />
                    <Marca x={20} y={15} tam={16} p={p} />
                    <Renglon x={34} y={11} ancho={52} alto={5} opacidad={0.4} />

                    {mensajes.map((m) => {
                        const pm = entrada(frame, m.r, 24);
                        return (
                            <Burbuja
                                key={m.y}
                                x={m.propia ? 120 : 12}
                                y={m.y + 42}
                                ancho={m.w}
                                alto={24}
                                propia={m.propia}
                                p={pm}
                            />
                        );
                    })}

                    <g opacity={entrada(frame, 94, 26)}>
                        <rect x="12" y="206" width="108" height="30" rx="8" fill={BLANCO} fillOpacity="0.12" />
                        <Renglon x={22} y={214} ancho={62} alto={5} opacidad={0.4} />
                        <Renglon x={22} y={225} ancho={44} alto={5} opacidad={0.2} />
                    </g>
                </g>
            </Telefono>
            <Etiqueta x={cx} y={378} texto="RESPONDE Y AGENDA SOLO" p={entrada(frame, 100, 26)} />
        </Lienzo>
    );
};

/** Agentes y chatbots: una entrada, tres salidas, la marca decidiendo. */
export const AgentesYChatbots = ({ frame }) => {
    const p = entrada(frame, 0, 26);
    const salidas = [
        { y: 96, texto: 'INFORMA' },
        { y: 200, texto: 'AGENDA' },
        { y: 304, texto: 'PASA A PERSONA' },
    ];

    return (
        <Lienzo>
            <Baldosa x={94} y={200} tam={62} p={p}>
                <g transform="translate(31 31)">
                    <circle r="11" fill="none" stroke={BLANCO} strokeOpacity="0.45" strokeWidth="1.6" />
                    <circle r="3.5" fill={BLANCO} fillOpacity="0.5" />
                </g>
            </Baldosa>
            <Etiqueta x={94} y={252} texto="MENSAJE" p={p} />

            <Conector d={trazado(128, 200, 240, 200, { modo: 'ele' })} p={entrada(frame, 12, 24)} />

            <Baldosa x={286} y={200} tam={96} destacada p={entrada(frame, 20, 28)}>
                <g transform="translate(48 48)">
                    <Marca x={0} y={0} tam={52} p={1} />
                </g>
            </Baldosa>
            <Anillo x={286} y={200} radio={68} frame={frame} velocidad={0.28} opacidad={0.22} hueco={0.62} />

            {salidas.map((s, i) => {
                const ps = entrada(frame, 38 + i * 10, 30);
                const d = trazado(334, 200, 484, s.y);
                return (
                    <g key={s.texto}>
                        <Conector d={trazado(334, 200, 484, s.y)} p={ps} />
                        {ps > 0.95 && <Pulso d={d} frame={frame} periodo={92} retraso={i * 30} largo={30} />}
                        <Baldosa x={518} y={s.y} tam={58} p={ps}>
                            <g transform="translate(29 29)">
                                <rect x="-9" y="-9" width="18" height="18" rx="4" fill="none" stroke={BLANCO} strokeOpacity="0.4" />
                            </g>
                        </Baldosa>
                        <Etiqueta x={518} y={s.y + 48} texto={s.texto} p={ps} />
                    </g>
                );
            })}
        </Lienzo>
    );
};

/** IA de ventas: el seguimiento que vuelve a tocar la puerta. */
export const IaDeVentas = ({ frame }) => {
    const p = entrada(frame, 0, 26);
    const hitos = [
        { x: 110, texto: 'COTIZA' },
        { x: 250, texto: 'DÍA 2' },
        { x: 390, texto: 'DÍA 5' },
        { x: 530, texto: 'CIERRA' },
    ];

    return (
        <Lienzo>
            <line x1="110" y1="200" x2={110 + 420 * p} y2="200" stroke={BLANCO} strokeOpacity="0.2" strokeWidth="1.5" />
            {p > 0.98 && <Pulso d="M 110 200 H 530" frame={frame} periodo={110} largo={60} />}

            {hitos.map((h, i) => {
                const ph = entrada(frame, 10 + i * 12, 26);
                const ultimo = i === hitos.length - 1;
                const pulso = interpolar(vaivén(frame - i * 20, 100), [0, 1], [1, 1.18]);
                return (
                    <g key={h.texto}>
                        <circle
                            cx={h.x}
                            cy={200}
                            r={(ultimo ? 13 : 9) * ph * (ultimo ? pulso : 1)}
                            fill={ultimo ? BLANCO : '#000'}
                            fillOpacity={ultimo ? 0.95 : 1}
                            stroke={BLANCO}
                            strokeOpacity={ultimo ? 0 : 0.45}
                            strokeWidth="1.6"
                        />
                        <Etiqueta x={h.x} y={236} texto={h.texto} p={ph} />
                        {!ultimo && (
                            <g opacity={ph * 0.9}>
                                <rect
                                    x={h.x - 46}
                                    y={126}
                                    width="92"
                                    height={34 * entrada(frame, 20 + i * 12, 24)}
                                    rx="8"
                                    fill={BLANCO}
                                    fillOpacity="0.07"
                                    stroke={BLANCO}
                                    strokeOpacity="0.14"
                                />
                            </g>
                        )}
                    </g>
                );
            })}

            <g opacity={entrada(frame, 62, 28)}>
                <Marca x={cx} y={318} tam={30} p={1} />
                <Etiqueta x={cx} y={352} texto="SIN QUE NADIE SE ACUERDE" p={1} />
            </g>
        </Lienzo>
    );
};

/** IA para tienda: el carrito que vuelve. */
export const IaParaTienda = ({ frame }) => {
    const p = entrada(frame, 0, 24);
    const productos = [0, 1, 2, 3, 4, 5];

    return (
        <Lienzo>
            <Ventana x={70} y={62} ancho={290} alto={272} p={p} titulo="Tienda">
                <g>
                    {productos.map((i) => (
                        <rect
                            key={i}
                            x={20 + (i % 3) * 88}
                            y={20 + Math.floor(i / 3) * 96}
                            width="76"
                            height={80 * entrada(frame, 12 + i * 5, 24)}
                            rx="8"
                            fill={BLANCO}
                            fillOpacity="0.06"
                            stroke={BLANCO}
                            strokeOpacity="0.12"
                        />
                    ))}
                </g>
            </Ventana>

            <Conector d={trazado(366, 200, 440, 200, { modo: 'ele' })} p={entrada(frame, 44, 26)} />

            <Baldosa x={492} y={200} tam={92} destacada p={entrada(frame, 52, 28)}>
                <g transform="translate(46 46)">
                    <Marca x={0} y={0} tam={48} p={1} />
                </g>
            </Baldosa>

            <g opacity={entrada(frame, 72, 30)}>
                <rect x="414" y="270" width="156" height="52" rx="10" fill={BLANCO} fillOpacity="0.08" />
                <Renglon x={430} y={286} ancho={104} alto={6} opacidad={0.55} />
                <Renglon x={430} y={300} ancho={76} alto={5} opacidad={0.22} />
            </g>
            <Etiqueta x={492} y={340} texto="CARRITO RECUPERADO" p={entrada(frame, 80, 26)} />
        </Lienzo>
    );
};

/* --- Marca -------------------------------------------------------------- */

/** Identidad: el logotipo saliendo de su propia retícula de construcción. */
export const IdentidadDeMarca = ({ frame }) => {
    const pGuias = entrada(frame, 0, 30);
    const pMarca = entrada(frame, 28, 34);
    const pPaleta = entrada(frame, 56, 30);

    return (
        <Lienzo rejilla={false}>
            <g opacity={pGuias * 0.6}>
                {[-96, -48, 0, 48, 96].map((d) => (
                    <line key={`v${d}`} x1={cx + d} y1={cy - 120} x2={cx + d} y2={cy + 120} stroke={BLANCO} strokeOpacity="0.14" />
                ))}
                {[-96, -48, 0, 48, 96].map((d) => (
                    <line key={`h${d}`} x1={cx - 150} y1={cy + d} x2={cx + 150} y2={cy + d} stroke={BLANCO} strokeOpacity="0.14" />
                ))}
                <circle cx={cx} cy={cy} r="96" fill="none" stroke={BLANCO} strokeOpacity="0.12" />
            </g>

            <Marca x={cx} y={cy - 16} tam={interpolar(pMarca, [0, 1], [52, 104])} p={pMarca} />

            {/* La paleta: negro, papel y los grises de en medio. Es literalmente
                el sistema de color de la casa, no una muestra decorativa. */}
            <g opacity={pPaleta}>
                {['#000000', '#3d3d3d', '#8a8a8a', '#f2f1ee'].map((c, i) => (
                    <rect
                        key={c}
                        x={cx - 96 + i * 50}
                        y={cy + 108}
                        width="42"
                        height="42"
                        rx="8"
                        fill={c}
                        stroke={BLANCO}
                        strokeOpacity="0.22"
                    />
                ))}
            </g>
        </Lienzo>
    );
};

/** Activaciones en expos: la pantalla del stand y el contacto que se guarda. */
export const PresenciaEnEventos = ({ frame }) => {
    const pPantalla = entrada(frame, 0, 28);
    const pTelefono = entrada(frame, 30, 28);
    const pContacto = entrada(frame, 58, 30);

    return (
        <Lienzo>
            <g opacity={pPantalla}>
                <rect x="74" y="66" width="244" height="180" rx="12" fill="url(#baldosaBase)" stroke={BLANCO} strokeOpacity="0.2" />
                <Marca x={196} y={140} tam={64} p={pPantalla} />
                <Renglon x={136} y={188} ancho={120} alto={7} opacidad={0.4} />
                {/* La pata del tótem: lo que lo convierte en un stand y no en
                    una pantalla flotando. */}
                <rect x="188" y="246" width="16" height="52" fill={BLANCO} fillOpacity="0.1" />
                <rect x="150" y="298" width="92" height="8" rx="4" fill={BLANCO} fillOpacity="0.14" />
            </g>

            <Conector d={trazado(324, 156, 404, 156, { modo: 'ele' })} p={pTelefono} />

            <Telefono x={412} y={72} ancho={116} alto={230} p={pTelefono}>
                <g>
                    <Renglon x={14} y={16} ancho={80} alto={7} opacidad={0.6} />
                    <Renglon x={14} y={32} ancho={64} alto={5} opacidad={0.2} />
                    {[0, 1, 2].map((i) => (
                        <rect
                            key={i}
                            x="14"
                            y={54 + i * 30}
                            width={88 * entrada(frame, 46 + i * 8, 22)}
                            height="20"
                            rx="6"
                            fill={BLANCO}
                            fillOpacity="0.08"
                        />
                    ))}
                    <rect
                        x="14"
                        y="150"
                        width={88 * pContacto}
                        height="24"
                        rx="12"
                        fill={BLANCO}
                        fillOpacity="0.9"
                    />
                </g>
            </Telefono>
            <Etiqueta x={470} y={330} texto="CONTACTO GUARDADO" p={pContacto} />
        </Lienzo>
    );
};

/* --- Estrategia --------------------------------------------------------- */

/** Auditoría de fricción: el punto por donde se escapa, encontrado y cerrado. */
export const AuditoriaDeFriccion = ({ frame }) => {
    const p = entrada(frame, 0, 26);
    const pFuga = entrada(frame, 36, 24);
    const pCierre = entrada(frame, 74, 30);
    const nodos = [
        { x: 108, texto: 'LLEGA' },
        { x: 250, texto: 'PREGUNTA' },
        { x: 392, texto: 'ESPERA' },
        { x: 534, texto: 'COMPRA' },
    ];

    return (
        <Lienzo>
            <line x1="108" y1="176" x2={108 + 426 * p} y2="176" stroke={BLANCO} strokeOpacity="0.2" strokeWidth="1.5" />

            {nodos.map((n, i) => {
                const pn = entrada(frame, 8 + i * 10, 24);
                return (
                    <g key={n.texto}>
                        <Baldosa x={n.x} y={176} tam={56} p={pn}>
                            <g transform="translate(28 28)">
                                <circle r="4" fill={BLANCO} fillOpacity="0.45" />
                            </g>
                        </Baldosa>
                        <Etiqueta x={n.x} y={228} texto={n.texto} p={pn} />
                    </g>
                );
            })}

            {/* La fuga: sale del tercer nodo y cae. Es lo que la auditoría
                encuentra, y por eso se dibuja antes de cerrarse. */}
            <g opacity={interpolar(pCierre, [0, 1], [pFuga, 0])}>
                {[0, 1, 2].map((i) => {
                    const ciclo = ((frame + i * 22) % 66) / 66;
                    return (
                        <circle
                            key={i}
                            cx={392 + interpolar(ciclo, [0, 1], [0, 26])}
                            cy={204 + interpolar(ciclo, [0, 1], [0, 110])}
                            r="3.5"
                            fill={BLANCO}
                            opacity={(1 - ciclo) * 0.8}
                        />
                    );
                })}
                <circle cx="392" cy="176" r={34 + vaivén(frame, 60) * 8} fill="none" stroke={BLANCO} strokeOpacity="0.3" />
            </g>

            <g opacity={pCierre}>
                <Marca x={392} y={176} tam={34} p={pCierre} />
            </g>
            {pCierre > 0.5 && <Pulso d="M 108 176 H 534" frame={frame} periodo={100} largo={70} />}

            <Etiqueta x={cx} y={336} texto={pCierre > 0.5 ? 'FUGA CERRADA' : 'AQUÍ SE PIERDEN'} p={Math.max(pFuga, pCierre)} />
            <Barrido y={176} frame={frame} periodo={180} />
        </Lienzo>
    );
};
