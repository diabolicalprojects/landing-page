import React, { useEffect, useRef } from 'react';
import { Player } from '@remotion/player';
import { useCurrentFrame, useVideoConfig } from 'remotion';

import { LIENZO } from './primitivas';
import { FPS } from './tiempo';

/*
 * El trozo que carga Remotion.
 *
 * Está aparte del bundle principal a propósito: este fichero es el ÚNICO que
 * importa `remotion` y `@remotion/player`, así que Vite se los lleva a un
 * chunk que solo se descarga cuando una escena entra en pantalla. El HTML
 * servido —que es la ventaja competitiva de este sitio— no paga nada por esto.
 *
 * El reproductor va sin controles, en bucle y sin sonido: no es un video que
 * alguien vaya a manejar, es una ilustración que se mueve.
 */

/**
 * Traduce el reloj de Remotion al contrato de las escenas.
 *
 * Las escenas reciben `frame` y `fps` por props y no llaman a ningún hook de
 * Remotion. Ese es el motivo de que la misma escena pueda dibujarse en el
 * servidor sin que Remotion exista.
 */
const Puente = ({ Escena }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    return <Escena frame={frame} fps={fps} />;
};

const Reproductor = ({ Escena, duracion, enPausa }) => {
    const reproductor = useRef(null);

    useEffect(() => {
        const p = reproductor.current;
        if (!p) return;
        // Un bucle que sigue corriendo fuera de vista gasta batería a cambio de
        // nada, y en un móvil eso se nota.
        if (enPausa) p.pause();
        else p.play();
    }, [enPausa]);

    return (
        <Player
            ref={reproductor}
            component={Puente}
            inputProps={{ Escena }}
            durationInFrames={duracion}
            fps={FPS}
            compositionWidth={LIENZO.ancho}
            compositionHeight={LIENZO.alto}
            loop
            autoPlay
            controls={false}
            clickToPlay={false}
            doubleClickToFullscreen={false}
            spaceKeyToPlayOrPause={false}
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default Reproductor;
