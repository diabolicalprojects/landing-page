import React from 'react';

import { ESCENAS } from '../motion/escenas';
import { FPS } from '../motion/tiempo';

/*
 * TEMPORAL · hoja de contactos de las escenas.
 *
 * Dibuja las 22 escenas en su fotograma de póster para revisarlas de una vez.
 * Se borra antes de publicar; no está enlazada desde ningún sitio.
 */
const HojaEscenas = () => (
    <main className="zona-oscura min-h-screen p-8">
        <h1 className="titular-l mb-8">Escenas ({Object.keys(ESCENAS).length})</h1>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(ESCENAS).map(([clave, { Escena, poster }]) => (
                <figure key={clave} className="tarjeta m-0 overflow-hidden p-3">
                    <div style={{ aspectRatio: '16 / 10' }}>
                        <Escena frame={poster} fps={FPS} />
                    </div>
                    <figcaption className="etiqueta-mono mt-2 text-white/60">{clave}</figcaption>
                </figure>
            ))}
        </div>
    </main>
);

export default HojaEscenas;
