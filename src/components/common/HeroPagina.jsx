import React from 'react';

import { Migas } from './Pagina';
import Fotografia from './Fotografia';
import MotionGrafico from '../../motion/MotionGrafico';
import { ENCUADRES, ESCENAS } from '../../motion/escenas';
import { LIENZO } from '../../motion/primitivas';
import { cn } from '../../utils/cn';
import logoMarca from '../../assets/logo/icono-diabolical-chatbot.svg';

/*
 * El hero de cada página: dos composiciones sobre el mismo HTML.
 *
 * ESCRITORIO (desde 1024 px): migas arriba, el texto a la izquierda y la escena
 * a la derecha. Los márgenes miran también el alto de la pantalla, para que en
 * una laptop el título, el párrafo y el botón quepan sin scroll.
 *
 * TELÉFONO Y TABLETA: una pantalla completa, centrada.
 *
 *   ┌──────────────────────┐
 *   │  menú (flota encima) │
 *   │                      │   fondo animado: retícula con pulsos de luz
 *   │        [ D ]         │   el sello de la marca, con su anillo
 *   │  Inicio › Servicios  │
 *   │    Título grande     │
 *   │   Una frase corta    │   `bajada`, en vez de la entradilla larga
 *   │   [ Cotizar … ]      │
 *   └──────────────────────┘
 *     escena de la página     la animación de la página, justo después
 *
 * Es el mismo HTML reordenado con CSS (index.css, «HERO DE PÁGINA»): lo que lee
 * un rastreador no cambia con el ancho, y no hay dos escenas animándose a la
 * vez. En escritorio el bloque de cabecera se disuelve (`display: contents`) y
 * sus piezas vuelven a la retícula de doce columnas.
 *
 * La entradilla completa sigue en el HTML. Donde hay bajada, el teléfono y las
 * laptops bajas enseñan la bajada; si no, la entradilla.
 *
 * `foto` es para los artículos: va debajo del texto en las dos composiciones.
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

/*
 * Los pulsos del fondo: cada uno corre por una línea de la retícula (celdas de
 * 3rem), con su propio ritmo para que nunca vayan sincronizados.
 */
const PULSOS = [
    { eje: 'h', linea: 3, duracion: 6.5, retraso: 0 },
    { eje: 'h', linea: 9, duracion: 8, retraso: 2.4 },
    { eje: 'h', linea: 14, duracion: 7, retraso: 4.1 },
    { eje: 'v', linea: 1, duracion: 7.5, retraso: 1.2 },
    { eje: 'v', linea: 5, duracion: 9, retraso: 3.3 },
    { eje: 'v', linea: 7, duracion: 6, retraso: 5.2 },
];

/** Fondo animado del hero en el teléfono. Decorativo: no se anuncia. */
const FondoHero = () => (
    <div className="fondo-hero lg:hidden" aria-hidden="true">
        <div className="fondo-hero__rejilla" />
        <div className="fondo-hero__foco" />
        <div className="fondo-hero__barrido" />
        {PULSOS.map((p) => (
            <span
                key={`${p.eje}${p.linea}`}
                className={`fondo-hero__pulso fondo-hero__pulso--${p.eje}`}
                style={{
                    '--linea': p.linea,
                    '--duracion': `${p.duracion}s`,
                    '--retraso': `${p.retraso}s`,
                }}
            />
        ))}
    </div>
);

/** El sello de la marca sobre el título, con el anillo girando alrededor. */
const Sello = () => (
    <div className="hero-pagina__sello entrada lg:hidden" aria-hidden="true">
        <svg className="hero-pagina__anillo" viewBox="0 0 120 120" focusable="false">
            <circle cx="60" cy="60" r="57" fill="none" stroke="#fff" strokeOpacity="0.1" />
            <circle
                cx="60"
                cy="60"
                r="57"
                fill="none"
                stroke="#fff"
                strokeOpacity="0.55"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="70 288"
            />
        </svg>
        <span className="hero-pagina__marca">
            <img src={logoMarca} alt="" width="40" height="40" />
        </span>
    </div>
);

const HeroPagina = ({
    como: Etiqueta = 'section',
    migas,
    insignia,
    titulo,
    largo = false,
    entradilla,
    entradillaEnMovil = true,
    bajada,
    meta,
    cta,
    ctaSoloMovil = false,
    escena,
    foto,
    columnas = 7,
    arriba = 'lg:pt-[clamp(6.5rem,16svh,8rem)]',
    separacion = 'lg:mb-[clamp(2.5rem,min(8vw,9svh),7.5rem)]',
    abajo = 'lg:pb-[clamp(4rem,min(8vw,13svh),7.5rem)]',
    hueco = 'lg:gap-x-12',
    fondo,
    pie,
    children,
    className,
}) => {
    const hayEscena = Boolean(escena && ESCENAS[escena.clave]);
    // Un <header> no puede llevar otro dentro: en los artículos el hero entero
    // ya es el encabezado.
    const Texto = Etiqueta === 'header' ? 'div' : 'header';

    return (
        <Etiqueta className={cn('hero-pagina zona-oscura relative overflow-hidden pb-16', arriba, abajo, className)}>
            <FondoHero />
            {fondo}

            <div className="contenedor relative">
                <div className={cn('grid grid-cols-1 lg:grid-cols-12 lg:items-center', hueco)}>
                    <div className="hero-pagina__cabeza lg:contents">
                        <Sello />

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
                                <p
                                    className={cn(
                                        'cuerpo-l entrada entrada-2 mt-7',
                                        bajada && 'hero-pagina__entradilla--larga hidden lg:block',
                                        !bajada && !entradillaEnMovil && 'hidden lg:block'
                                    )}
                                >
                                    {entradilla}
                                </p>
                            )}
                            {bajada && <p className="hero-pagina__bajada entrada entrada-2 lg:hidden">{bajada}</p>}

                            {meta}

                            {cta && (
                                <div
                                    className={cn(
                                        'hero-pagina__cta entrada entrada-3 mt-8 lg:mt-9',
                                        ctaSoloMovil && 'lg:hidden'
                                    )}
                                >
                                    {cta}
                                </div>
                            )}
                        </Texto>
                    </div>

                    {hayEscena && (
                        <div
                            className={cn(
                                'hero-pagina__escenario',
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
                            className="hero-pagina__foto lg:col-span-12 lg:mt-12"
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
