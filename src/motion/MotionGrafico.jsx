import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';

import { ESCENAS } from './escenas';
import { FPS } from './tiempo';

/*
 * El puente entre una escena y quien la anima.
 *
 * Tres estados, en este orden:
 *
 *   1. Servidor y primer pintado: la escena dibujada en su fotograma de póster.
 *      HTML puro, sin JavaScript. Es lo que ve un rastreador, quien llega con la
 *      red mala y quien pide menos movimiento.
 *   2. Al entrar en pantalla: se carga Remotion en un trozo aparte y la misma
 *      escena empieza a animarse. Ni un kilobyte de Remotion viaja en el bundle
 *      principal ni se descarga por una animación que nadie va a ver.
 *   3. Al salir de pantalla: se pausa. Un bucle que sigue corriendo fuera de
 *      vista gasta batería a cambio de nada.
 *
 * La escena no sabe nada de esto: recibe un número de fotograma y dibuja.
 */

const Reproductor = lazy(() => import('./Reproductor'));

const MotionGrafico = ({ escena, etiqueta, className = '', prioridad = false }) => {
    const definicion = ESCENAS[escena];
    const contenedor = useRef(null);
    const [animar, setAnimar] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const nodo = contenedor.current;
        if (!nodo) return undefined;

        const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (menosMovimiento.matches) return undefined;

        // Sin IntersectionObserver (navegador viejo) se queda en estático, que
        // es un resultado correcto y no una versión rota.
        if (typeof IntersectionObserver === 'undefined') return undefined;

        const observador = new IntersectionObserver(
            ([entrada]) => {
                setVisible(entrada.isIntersecting);
                if (entrada.isIntersecting) setAnimar(true);
            },
            // Un margen generoso: la carga del trozo tarda, y así llega animada
            // en lugar de saltar de estática a animada delante del visitante.
            { rootMargin: prioridad ? '600px' : '200px', threshold: 0.01 }
        );

        observador.observe(nodo);
        return () => observador.disconnect();
    }, [prioridad]);

    if (!definicion) {
        console.warn(`[motion] No existe la escena "${escena}".`);
        return null;
    }

    const { Escena, duracion, poster } = definicion;

    return (
        <div
            ref={contenedor}
            className={className}
            role="img"
            aria-label={etiqueta}
            style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10' }}
        >
            {animar ? (
                // El estático queda de respaldo mientras carga el trozo: sin él
                // habría un hueco en blanco del tamaño de la escena.
                <Suspense fallback={<Escena frame={poster} fps={FPS} />}>
                    <Reproductor
                        Escena={Escena}
                        duracion={duracion}
                        enPausa={!visible}
                    />
                </Suspense>
            ) : (
                <Escena frame={poster} fps={FPS} />
            )}
        </div>
    );
};

export default MotionGrafico;
