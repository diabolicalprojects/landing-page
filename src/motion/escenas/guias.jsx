import React from 'react';

import { Lienzo, Marca, Renglon, entrada, interpolar } from '../primitivas';

/*
 * GUÍAS · blog
 *
 * El mecanismo del blog: alguien escribe la pregunta que le haría a Google o a
 * un asistente, y la respuesta llega directa, con el botón a la guía que la
 * desarrolla. Las tres preguntas son las de las guías publicadas.
 *
 * La respuesta se dibuja en renglones y no con texto inventado: la escena
 * cuenta cómo funciona, no pone palabras en boca de nadie.
 */

export const PREGUNTAS = [
    '¿Qué empresa de IA hay en Aguascalientes?',
    '¿Dónde hago mi página web?',
    '¿Qué resuelve un chatbot?',
];

export const CICLO_PREGUNTA = 150;
export const CICLO_GUIAS = CICLO_PREGUNTA * PREGUNTAS.length;

const BLANCO = '#ffffff';

export const Guias = ({ frame }) => {
    const t = frame % CICLO_PREGUNTA;
    const pregunta = PREGUNTAS[Math.floor(frame / CICLO_PREGUNTA) % PREGUNTAS.length];

    const pBarra = entrada(frame, 0, 24);
    const letras = Math.round(interpolar(t, [8, 58], [0, pregunta.length]));
    const escribiendo = t < 66;
    const cursor = escribiendo && Math.floor(t / 8) % 2 === 0;

    const pTarjeta = entrada(t, 64, 24);
    const pBoton = entrada(t, 96, 20);
    const salida = 1 - entrada(t, 134, 14);

    return (
        <Lienzo>
            {/* La pregunta */}
            <g opacity={pBarra}>
                <rect x="96" y="58" width="448" height="52" rx="26" fill="url(#baldosaBase)" stroke={BLANCO} strokeOpacity="0.2" />
                <g fill="none" stroke={BLANCO} strokeOpacity="0.55" strokeWidth="1.6">
                    <circle cx="126" cy="82" r="7" />
                    <line x1="131" y1="87" x2="136" y2="92" />
                </g>
                <text
                    x="150"
                    y="89"
                    fontSize="17"
                    fill={BLANCO}
                    fillOpacity={0.9 * salida}
                    fontFamily="inherit"
                    fontWeight="600"
                >
                    {pregunta.slice(0, letras)}
                    {cursor ? '|' : ''}
                </text>
            </g>

            {/* La respuesta */}
            <g opacity={pTarjeta * salida} transform={`translate(0 ${interpolar(pTarjeta, [0, 1], [14, 0])})`}>
                <rect x="96" y="130" width="448" height="200" rx="18" fill="url(#baldosaBase)" stroke={BLANCO} strokeOpacity="0.16" />
                <Marca x={128} y={164} tam={26} p={pTarjeta} />
                <Renglon x={152} y={157} ancho={150 * entrada(t, 70, 20)} alto={8} opacidad={0.7} />
                <Renglon x={152} y={171} ancho={90 * entrada(t, 74, 20)} alto={5} opacidad={0.25} />

                {[0, 1, 2, 3].map((i) => (
                    <Renglon
                        key={i}
                        x={120}
                        y={200 + i * 18}
                        ancho={[392, 376, 398, 240][i] * entrada(t, 78 + i * 6, 22)}
                        alto={6}
                        opacidad={0.2}
                    />
                ))}

                {/* El enlace a la guía, dibujado como enlace y no como botón
                    sólido: en una ilustración, un botón blanco pide que lo
                    pulsen y no lleva a ninguna parte. */}
                <g opacity={pBoton}>
                    <text
                        x="120"
                        y="306"
                        fontSize="13"
                        fontWeight="700"
                        fill={BLANCO}
                        fillOpacity={0.85}
                        fontFamily="inherit"
                    >
                        Ver la guía →
                    </text>
                    <rect x="120" y="312" width={96 * pBoton} height="1.5" fill={BLANCO} fillOpacity="0.6" />
                </g>
            </g>
        </Lienzo>
    );
};
