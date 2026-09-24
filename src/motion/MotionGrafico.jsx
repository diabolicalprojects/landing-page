import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';

import { ESCENAS } from './escenas';
import { LIENZO } from './primitivas';
import { FPS } from './tiempo';

/*
 * El puente entre una escena y quien la anima.
 *
 * Tres estados, en este orden:
 *
 *   1. Servidor y primer pintado: la escena dibujada en su fotograma de póster.
 *      HTML puro, sin JavaScript. Es lo que ve un rastreador, quien llega con la
 *      red mala y quien pide menos movimiento.
 *   2. Cuando está en pantalla Y la página ya se asentó: se carga Remotion en un
 *      trozo aparte y la misma escena empieza a animarse. Ni un kilobyte de
 *      Remotion viaja en el bundle principal ni se descarga por una animación
 *      que nadie va a ver.
 *   3. Al salir de pantalla: se pausa. Un bucle que sigue corriendo fuera de
 *      vista gasta batería a cambio de nada.
 *
 * La escena no sabe nada de esto: recibe un número de fotograma y dibuja.
 *
 * `datos` llega tal cual a la escena. Lo usan las que se dibujan a partir del
 * contenido editable —el proceso pinta los pasos que haya en el panel—, y por
 * eso su duración y su póster pueden ser funciones de esos datos.
 */

const Reproductor = lazy(() => import('./Reproductor'));

/**
 * Espera a que la página termine de cargar y el navegador tenga un hueco libre.
 *
 * Existe por la escena del primer viewport. Está en pantalla desde el segundo
 * cero, así que su observador disparaba de inmediato y el trozo de Remotion
 * salía encadenado detrás del bundle principal: la medición de PageSpeed lo
 * situaba cerrando la ruta crítica en 1.893 ms con 41,56 KiB. Compite por red y
 * por hilo principal justo en la ventana que decide el LCP, y todo para animar
 * un gráfico que ya se está viendo —dibujado y correcto— en su fotograma de
 * póster.
 *
 * Con esto la animación sigue llegando, pero después del pintado en vez de
 * delante de él. No se toca el HTML que se sirve ni lo que ve un rastreador.
 */
function usePaginaAsentada() {
    const [asentada, setAsentada] = useState(false);

    useEffect(() => {
        let cancelado = false;

        const marcar = () => {
            if (cancelado) return;
            // requestIdleCallback no existe en Safari antiguo; el respaldo es un
            // temporizador corto, que para esto vale igual.
            const enHueco =
                window.requestIdleCallback || ((fn) => window.setTimeout(fn, 200));
            enHueco(() => {
                if (!cancelado) setAsentada(true);
            });
        };

        if (document.readyState === 'complete') {
            marcar();
            return () => {
                cancelado = true;
            };
        }

        window.addEventListener('load', marcar, { once: true });
        return () => {
            cancelado = true;
            window.removeEventListener('load', marcar);
        };
    }, []);

    return asentada;
}

const MotionGrafico = ({ escena, etiqueta, className = '', prioridad = false, datos }) => {
    const definicion = ESCENAS[escena];
    const contenedor = useRef(null);
    const [haEntrado, setHaEntrado] = useState(false);
    const [visible, setVisible] = useState(false);
    const asentada = usePaginaAsentada();

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
                if (entrada.isIntersecting) setHaEntrado(true);
            },
            // Un margen generoso: la carga del trozo tarda, y así llega animada
            // en lugar de saltar de estática a animada delante del visitante.
            { rootMargin: prioridad ? '600px' : '200px', threshold: 0.01 }
        );

        observador.observe(nodo);
        return () => observador.disconnect();
    }, [prioridad]);

    // Las dos condiciones, no una: haber entrado en pantalla decide SI se anima;
    // que la página se haya asentado decide CUÁNDO. Para las escenas de más
    // abajo la segunda ya se cumple cuando se llega a ellas, así que no cambia
    // nada; la que gana es la del primer viewport.
    const animar = haEntrado && asentada;

    if (!definicion) {
        console.warn(`[motion] No existe la escena "${escena}".`);
        return null;
    }

    const { Escena, lienzo = LIENZO } = definicion;
    const duracion =
        typeof definicion.duracion === 'function' ? definicion.duracion(datos) : definicion.duracion;
    const poster = typeof definicion.poster === 'function' ? definicion.poster(datos) : definicion.poster;

    return (
        <div
            ref={contenedor}
            className={className}
            role="img"
            aria-label={etiqueta}
            style={{ position: 'relative', width: '100%', aspectRatio: `${lienzo.ancho} / ${lienzo.alto}` }}
        >
            {animar ? (
                // El estático queda de respaldo mientras carga el trozo: sin él
                // habría un hueco en blanco del tamaño de la escena.
                <Suspense fallback={<Escena frame={poster} fps={FPS} datos={datos} />}>
                    <Reproductor
                        Escena={Escena}
                        duracion={duracion}
                        enPausa={!visible}
                        datos={datos}
                        lienzo={lienzo}
                    />
                </Suspense>
            ) : (
                <Escena frame={poster} fps={FPS} datos={datos} />
            )}
        </div>
    );
};

export default MotionGrafico;
