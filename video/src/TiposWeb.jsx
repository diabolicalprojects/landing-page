import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

import { ESCENAS } from '../../src/motion/escenas/index.js';
import CONTENIDO from '../../src/data/contenido.json';
import { TIPO } from './marca.js';

/*
 * Una pieza cuadrada por tipo de página web, para redes.
 *
 * La escena NO se redibuja aquí: se importa la misma del sitio
 * (src/motion/escenas/tipos.jsx), y el nombre y el «para quién» salen del mismo
 * contenido que pinta la landing. Quien ve el anuncio y entra al sitio tiene
 * que reconocer exactamente lo mismo, y dos dibujos del mismo tipo acabarían
 * contando dos cosas.
 *
 * Monocromo, como el sitio. Los tokens de marca.js todavía llevan el naranja de
 * la pieza «Guardia nocturna»; esta no los usa para el color.
 *
 * Dura un ciclo exacto de la escena, así que el video hace bucle limpio en el
 * feed: la escena ya se desvanece sola al final.
 */

const MONO = {
    fondo: '#0A0A0A',
    panel: '#000000',
    texto1: '#FFFFFF',
    texto2: 'rgba(255,255,255,0.72)',
    texto3: 'rgba(255,255,255,0.52)',
    linea: 'rgba(255,255,255,0.12)',
};

export const TIPOS_WEB = (CONTENIDO.paginasWeb?.tipos?.items ?? []).filter((t) => ESCENAS[t.id]);

const aparecer = (frame, desde, fps) =>
    spring({ frame: frame - desde, fps, config: { damping: 200, mass: 0.6 } });

export const PiezaTipoWeb = ({ id }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const tipo = TIPOS_WEB.find((t) => t.id === id);
    const { Escena } = ESCENAS[id];

    const texto = aparecer(frame, 4, fps);
    const panel = aparecer(frame, 12, fps);

    return (
        <AbsoluteFill style={{ background: MONO.fondo, fontFamily: TIPO.texto, color: MONO.texto1 }}>
            <AbsoluteFill style={{ padding: '92px 72px 72px', display: 'flex', flexDirection: 'column' }}>
                <div
                    style={{
                        opacity: texto,
                        transform: `translateY(${interpolate(texto, [0, 1], [16, 0])}px)`,
                    }}
                >
                    <div
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: MONO.texto3,
                        }}
                    >
                        Páginas web · Aguascalientes
                    </div>
                    <div
                        style={{
                            fontSize: 84,
                            fontWeight: 800,
                            letterSpacing: '-0.04em',
                            lineHeight: 1.02,
                            marginTop: 22,
                        }}
                    >
                        {tipo.nombre}
                    </div>
                    <div
                        style={{
                            fontSize: 30,
                            lineHeight: 1.4,
                            color: MONO.texto2,
                            marginTop: 20,
                            maxWidth: 880,
                        }}
                    >
                        {tipo.paraQuien}
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 'auto',
                        opacity: panel,
                        transform: `scale(${interpolate(panel, [0, 1], [0.97, 1])})`,
                        border: `1px solid ${MONO.linea}`,
                        borderRadius: 32,
                        background: MONO.panel,
                        overflow: 'hidden',
                        height: 540,
                    }}
                >
                    <Escena frame={frame} fps={fps} />
                </div>

                <div
                    style={{
                        marginTop: 34,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: texto,
                    }}
                >
                    <Img src={staticFile('logo-horizontal-blanco.svg')} style={{ height: 34 }} />
                    <div style={{ fontSize: 22, letterSpacing: '0.04em', color: MONO.texto3 }}>
                        diabolicalservices.tech/paginas-web-aguascalientes
                    </div>
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

/** Nombre de la composición: «PaginaWeb-landing», «PaginaWeb-tienda»… */
export const idComposicion = (id) => `PaginaWeb-${id.replace(/^tipo-/, '')}`;
