import React from 'react';
import {
    AbsoluteFill,
    Img,
    interpolate,
    spring,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';

import { EVENTOS, MARCA, SALIDA, TIPO } from './marca.js';

/*
 * «Guardia nocturna».
 *
 * La misma escena que preside la portada, contada en el tiempo: el reloj corre
 * de madrugada y los avisos van entrando mientras el negocio está cerrado. Es
 * el argumento entero sin una sola cifra inventada — no dice cuánto mejora
 * nada, enseña el sistema trabajando a las dos de la mañana.
 *
 * Estructura, en segundos sobre 30 fps:
 *
 *   0 - 1.5   entra el marco y el reloj
 *   1.5 - 6   los cuatro avisos, uno cada segundo y pico
 *   6 - 8.5   la frase: «Tu negocio no duerme. Tú sí.»
 *   8.5 - 10  logotipo y dominio
 *
 * Se compone una sola vez y las dos composiciones (cuadrada para redes,
 * horizontal para anuncios) la reutilizan cambiando la retícula. Dos ficheros
 * separados acabarían con dos versiones distintas del mismo anuncio.
 */

const fps = 30;

/** Entrada con muelle suave. Sin rebote: esto vende, no juega. */
const entrada = (frame, desde, config) =>
    spring({ frame: frame - desde, fps: config.fps, config: { damping: 200, mass: 0.6 } });

const Rejilla = () => (
    <AbsoluteFill
        style={{
            backgroundImage: `linear-gradient(to right, ${MARCA.linea} 1px, transparent 1px),
                              linear-gradient(to bottom, ${MARCA.linea} 1px, transparent 1px)`,
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, #000 10%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, #000 10%, transparent 75%)',
        }}
    />
);

const Resplandor = ({ frame }) => {
    // Respira muy despacio: marca que hay algo encendido, sin llamar la
    // atención por encima del texto.
    const pulso = interpolate(Math.sin((frame / fps) * 1.1), [-1, 1], [0.32, 0.5]);
    return (
        <AbsoluteFill
            style={{
                background: `radial-gradient(circle at 50% 32%, ${MARCA.acento} 0%, transparent 55%)`,
                filter: 'blur(120px)',
                opacity: pulso,
            }}
        />
    );
};

const Reloj = ({ frame }) => {
    // Va marcando la hora del último aviso que entró, para que el reloj y la
    // lista cuenten lo mismo.
    const entrados = EVENTOS.filter((_, i) => frame >= 45 + i * 38).length;
    const hora = entrados === 0 ? '01:48' : EVENTOS[entrados - 1].hora;

    return (
        <div>
            <div
                style={{
                    fontFamily: TIPO.titulo,
                    fontSize: 132,
                    lineHeight: 1,
                    color: MARCA.texto1,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                }}
            >
                {hora}
            </div>
            <div
                style={{
                    fontFamily: TIPO.texto,
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: MARCA.texto3,
                    marginTop: 14,
                }}
            >
                Hora local · Aguascalientes
            </div>
        </div>
    );
};

const Aviso = ({ evento, indice, frame, config }) => {
    const aparece = 45 + indice * 38;
    const p = entrada(frame, aparece, config);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 20,
                padding: '22px 4px',
                borderTop: indice === 0 ? 'none' : `1px solid ${MARCA.linea}`,
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [18, 0])}px)`,
            }}
        >
            <div
                style={{
                    width: 6,
                    alignSelf: 'stretch',
                    borderRadius: 99,
                    background: MARCA.acento,
                    // Solo el último entrado lleva la marca: es la señal de
                    // «acaba de pasar», y con todas encendidas no diría nada.
                    opacity: frame < aparece + 38 ? 1 : 0.16,
                }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontFamily: TIPO.texto,
                        fontSize: 30,
                        fontWeight: 600,
                        color: MARCA.texto1,
                        lineHeight: 1.3,
                    }}
                >
                    {evento.texto}
                </div>
                <div
                    style={{
                        fontFamily: TIPO.texto,
                        fontSize: 19,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: MARCA.texto3,
                        marginTop: 8,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {evento.hora} · {evento.canal}
                </div>
            </div>
        </div>
    );
};

const Panel = ({ frame, config }) => {
    const p = entrada(frame, 0, config);

    return (
        <div
            style={{
                borderRadius: 28,
                border: `1px solid rgba(255,255,255,0.14)`,
                background: MARCA.superficie1,
                overflow: 'hidden',
                boxShadow: '0 60px 140px -60px rgba(0,0,0,0.95)',
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [28, 0])}px)`,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 26px',
                    borderBottom: `1px solid rgba(255,255,255,0.08)`,
                    background: 'rgba(255,255,255,0.02)',
                }}
            >
                <span
                    style={{
                        fontFamily: TIPO.texto,
                        fontSize: 18,
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: MARCA.texto3,
                    }}
                >
                    Guardia nocturna
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 99,
                            background: MARCA.acento,
                            // Latido de un segundo: el único bucle de la pieza.
                            opacity: interpolate(Math.sin((frame / fps) * 5), [-1, 1], [0.35, 1]),
                        }}
                    />
                    <span
                        style={{
                            fontFamily: TIPO.texto,
                            fontSize: 18,
                            fontWeight: 700,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: MARCA.texto3,
                        }}
                    >
                        En operación
                    </span>
                </span>
            </div>

            <div style={{ padding: '38px 34px 30px' }}>
                <Reloj frame={frame} />
                <div style={{ marginTop: 34 }}>
                    {EVENTOS.map((evento, i) => (
                        <Aviso
                            key={evento.texto}
                            evento={evento}
                            indice={i}
                            frame={frame}
                            config={config}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const Cierre = ({ frame, config, ancho, desde = 180 }) => {
    const p = entrada(frame, desde, config);
    if (p === 0) return null;

    return (
        <div
            style={{
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [22, 0])}px)`,
                maxWidth: ancho,
            }}
        >
            <div
                style={{
                    fontFamily: TIPO.texto,
                    fontWeight: 800,
                    fontSize: 82,
                    lineHeight: 0.98,
                    letterSpacing: '-0.045em',
                }}
            >
                <div style={{ color: MARCA.texto3 }}>Tu negocio no duerme.</div>
                <div style={{ color: MARCA.texto1 }}>Tú sí.</div>
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 22,
                    marginTop: 46,
                    opacity: entrada(frame, desde + 45, config),
                }}
            >
                {/* El horizontal y no el cuadrado: el cuadrado mete el nombre
                    y el descriptor dentro del propio dibujo, y a este tamaño
                    el descriptor se convierte en una mancha. */}
                <Img
                    src={staticFile('logo-horizontal-blanco.svg')}
                    style={{ height: 46 }}
                />
                <div
                    style={{
                        width: 1,
                        height: 34,
                        background: 'rgba(255,255,255,0.22)',
                    }}
                />
                <div
                    style={{
                        fontFamily: TIPO.texto,
                        fontSize: 28,
                        fontWeight: 700,
                        color: MARCA.texto2,
                        letterSpacing: '-0.01em',
                    }}
                >
                    diabolicalservices.tech
                </div>
            </div>
        </div>
    );
};

/** Fotograma en el que el cuadrado cambia del panel al cierre. */
const RELEVO = 195;

/**
 * `horizontal` no es una variante de estilo, es otro montaje.
 *
 * En apaisado caben las dos cosas a la vez: el panel a la izquierda y la frase
 * a la derecha, y el ojo salta de una a otra.
 *
 * En cuadrado no caben. Apiladas, el panel se sale por arriba y el logotipo por
 * abajo. Así que en cuadrado el cierre SUSTITUYE al panel con un relevo a los
 * seis segundos y medio: cada cosa ocupa el lienzo entero mientras le toca, que
 * además es como se ve un video en un feed.
 */
export const GuardiaNocturna = ({ horizontal = false }) => {
    const frame = useCurrentFrame();
    const config = useVideoConfig();

    // En apaisado no hay relevo: las dos piezas conviven de principio a fin.
    const salidaPanel = horizontal
        ? 1
        : interpolate(frame, [RELEVO, RELEVO + 18], [1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
          });

    return (
        <AbsoluteFill style={{ backgroundColor: MARCA.negro }}>
            <Resplandor frame={frame} />
            <Rejilla />

            <AbsoluteFill
                style={{
                    display: 'flex',
                    flexDirection: horizontal ? 'row' : 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: horizontal ? 90 : 0,
                    padding: horizontal ? '0 110px' : '90px 80px',
                }}
            >
                {salidaPanel > 0 && (
                    <div
                        style={{
                            flex: horizontal ? '0 0 46%' : 'none',
                            width: horizontal ? '46%' : '100%',
                            opacity: salidaPanel,
                            // Se retira hacia atrás, no hacia un lado: la
                            // atención se queda en el centro, donde va a
                            // aparecer la frase.
                            transform: `scale(${interpolate(salidaPanel, [0, 1], [0.94, 1])})`,
                            position: horizontal ? 'static' : 'absolute',
                            padding: horizontal ? 0 : '0 80px',
                        }}
                    >
                        <Panel frame={frame} config={config} />
                    </div>
                )}

                <div
                    style={{
                        flex: horizontal ? 1 : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        width: horizontal ? 'auto' : '100%',
                        position: horizontal ? 'static' : 'absolute',
                        padding: horizontal ? 0 : '0 80px',
                    }}
                >
                    <Cierre
                        frame={frame}
                        config={config}
                        ancho={horizontal ? 620 : '100%'}
                        desde={horizontal ? 180 : RELEVO + 6}
                    />
                </div>
            </AbsoluteFill>

            {/* Aviso de honestidad: la escena es una simulación del mecanismo,
                no la captura de un cliente. Va en la pieza, no en la
                descripción del post, porque el video circula solo. */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 34,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    fontFamily: TIPO.texto,
                    fontSize: 17,
                    color: 'rgba(255,255,255,0.42)',
                }}
            >
                Escena ilustrativa del sistema en marcha. No es un cliente real.
            </div>
        </AbsoluteFill>
    );
};
