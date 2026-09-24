import React from 'react';

import { Migas } from './Pagina';
import Fotografia from './Fotografia';
import MotionGrafico from '../../motion/MotionGrafico';
import { ENCUADRES, ESCENAS } from '../../motion/escenas';
import { LIENZO } from '../../motion/primitivas';
import { cn } from '../../utils/cn';

/*
 * El hero de cada página: dos composiciones sobre el mismo HTML.
 *
 * ESCRITORIO (desde 1024 px) es el de siempre: migas arriba, el texto a la
 * izquierda y la escena a la derecha.
 *
 * TELÉFONO Y TABLETA son otra cosa, pensada para esa pantalla:
 *
 *   ┌──────────────────────┐
 *   │  menú (flota encima) │
 *   │                      │
 *   │   escena, a todo el  │  la animación sube arriba, sin márgenes, y se
 *   │   ancho y encuadrada │  recorta el aire que traía del escritorio
 *   │                      │
 *   │  Inicio › Servicios  │  las migas en una sola línea
 *   │  Título grande       │
 *   │  Una frase corta     │  `bajada`, en vez de la entradilla larga
 *   │  [ Cotizar … ]       │  el botón, dentro del primer pantallazo
 *   └──────────────────────┘
 *
 * Es el mismo HTML reordenado con CSS (index.css, «HERO DE PÁGINA»): lo que lee
 * un rastreador no cambia con el ancho, y no hay dos escenas animándose a la
 * vez. En el DOM el texto va antes que la escena, que es el orden en que se
 * lee; en el teléfono la escena se pinta primero.
 *
 * La entradilla completa sigue en el HTML. En el teléfono se cambia por la
 * bajada solo cuando la página trae una; si no, se ve la entradilla.
 *
 * `foto` es para los artículos: en el teléfono la fotografía es el banner de
 * arriba y en escritorio va debajo del texto, como hasta ahora.
 */

/** Variables del encuadre móvil: qué parte del lienzo se ve y a qué escala. */
function variablesEncuadre(clave) {
    const lienzo = ESCENAS[clave]?.lienzo ?? LIENZO;
    const [x, y, ancho, alto] = ENCUADRES[clave] ?? [0, 0, lienzo.ancho, lienzo.alto];

    return {
        '--encuadre-proporcion': (ancho / alto).toFixed(4),
        '--encuadre-ancho': (lienzo.ancho / ancho).toFixed(4),
        '--encuadre-x': (x / ancho).toFixed(4),
        '--encuadre-y': (y / alto).toFixed(4),
    };
}

const HeroPagina = ({
    como: Etiqueta = 'section',
    migas,
    insignia,
    titulo,
    largo = false,
    entradilla,
    bajada,
    meta,
    cta,
    ctaSoloMovil = false,
    escena,
    foto,
    columnas = 7,
    arriba = 'lg:pt-32',
    separacion = 'lg:mb-[clamp(4.5rem,8vw,7.5rem)]',
    abajo = 'lg:pb-[clamp(4.5rem,8vw,7.5rem)]',
    hueco = 'lg:gap-x-12',
    fondo,
    pie,
    children,
    className,
}) => {
    const hayEscena = Boolean(escena && ESCENAS[escena.clave]);
    const hayBanner = hayEscena || Boolean(foto);
    // Un <header> no puede llevar otro dentro: en los artículos el hero entero
    // ya es el encabezado.
    const Texto = Etiqueta === 'header' ? 'div' : 'header';

    return (
        <Etiqueta
            className={cn(
                'hero-pagina zona-oscura relative overflow-hidden pb-16',
                !hayBanner && 'pt-28 md:pt-32',
                arriba,
                abajo,
                className
            )}
        >
            {fondo}

            <div className="contenedor relative">
                <div className={cn('grid grid-cols-1 lg:grid-cols-12 lg:items-center', hueco)}>
                    {migas && (
                        <Migas
                            ruta={migas}
                            className={cn('hero-pagina__migas mb-3 lg:col-span-12', separacion)}
                        />
                    )}

                    <Texto
                        className={cn(
                            'hero-pagina__texto',
                            hayEscena
                                ? columnas === 6
                                    ? 'lg:col-span-6'
                                    : 'lg:col-span-7'
                                : 'lg:col-span-12 lg:max-w-3xl'
                        )}
                    >
                        {insignia && <p className="insignia entrada mb-4 lg:mb-5">{insignia}</p>}

                        <h1 className={cn('titular-xl entrada', largo && 'titular-largo')}>{titulo}</h1>

                        {entradilla && (
                            <p className={cn('cuerpo-l entrada entrada-2 mt-7', bajada && 'hidden lg:block')}>
                                {entradilla}
                            </p>
                        )}
                        {bajada && <p className="hero-pagina__bajada entrada entrada-2 lg:hidden">{bajada}</p>}

                        {meta}

                        {cta && (
                            <div className={cn('hero-pagina__cta entrada entrada-3 mt-7 lg:mt-9', ctaSoloMovil && 'lg:hidden')}>
                                {cta}
                            </div>
                        )}
                    </Texto>

                    {hayEscena && (
                        <div
                            className={cn(
                                'hero-pagina__escenario order-first mb-5 lg:order-none lg:mb-0',
                                columnas === 6 ? 'lg:col-span-6' : 'lg:col-span-5'
                            )}
                        >
                            <div className="hero-pagina__encuadre" style={variablesEncuadre(escena.clave)}>
                                <div className="hero-pagina__lienzo">
                                    <MotionGrafico
                                        escena={escena.clave}
                                        prioridad
                                        datos={escena.datos}
                                        etiqueta={escena.etiqueta ?? ESCENAS[escena.clave]?.descripcion}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {foto && (
                        <Fotografia
                            clave={foto}
                            prioridad
                            className="hero-pagina__foto order-first mb-6 lg:order-none lg:col-span-12 lg:mb-0 lg:mt-12"
                        />
                    )}
                </div>

                {pie}
            </div>

            {children}
        </Etiqueta>
    );
};

export default HeroPagina;
