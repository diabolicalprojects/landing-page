import React from 'react';
import { Composition } from 'remotion';

import { GuardiaNocturna } from './GuardiaNocturna.jsx';
import { PiezaTipoWeb, TIPOS_WEB, idComposicion } from './TiposWeb.jsx';
import { ESCENAS } from '../../src/motion/escenas/index.js';

/*
 * Dos formatos de la misma pieza:
 *
 *   Cuadrada    1080x1080  Instagram y Facebook, que es donde vive el negocio
 *   Horizontal  1920x1080  anuncios y YouTube, y de donde sale la og-image
 *
 * Diez segundos: lo que aguanta alguien pasando el dedo por el feed.
 */
export const RemotionRoot = () => (
    <>
        <Composition
            id="GuardiaCuadrada"
            component={GuardiaNocturna}
            durationInFrames={300}
            fps={30}
            width={1080}
            height={1080}
            defaultProps={{ horizontal: false }}
        />
        <Composition
            id="GuardiaHorizontal"
            component={GuardiaNocturna}
            durationInFrames={300}
            fps={30}
            width={1920}
            height={1080}
            defaultProps={{ horizontal: true }}
        />

        {/* Una pieza cuadrada por tipo de página web, con la escena del sitio.
            Dura un ciclo exacto de la escena para que el bucle sea limpio. */}
        {TIPOS_WEB.map((tipo) => (
            <Composition
                key={tipo.id}
                id={idComposicion(tipo.id)}
                component={PiezaTipoWeb}
                durationInFrames={ESCENAS[tipo.id].duracion}
                fps={30}
                width={1080}
                height={1080}
                defaultProps={{ id: tipo.id }}
            />
        ))}
    </>
);
