import React from 'react';
import { ArrowRight } from 'lucide-react';

import { useBloque } from '../../contenido';
import Enlace from '../common/Enlace';
import { FondoHero } from '../common/HeroPagina';
import LogoAnimado from '../common/LogoAnimado';
import PuntosReactivos from '../common/PuntosReactivos';

/*
 * Primer viewport de la portada: solo el texto, al centro.
 *
 *   ┌──────────────────────────────┐
 *   │ · · · · · · · · · · · · · · ·│   escritorio: malla de puntos que se
 *   │ · · · · ·  (logo)  · · · · · │   deforma con el cursor
 *   │ · · · ·   ETIQUETA   · · · · │   teléfono: la retícula animada, tenue
 *   │ · ·   Título grande   · · · ·│
 *   │ · · ·  frase corta  · · · · ·│   el logo se dibuja y después respira
 *   │ · · ·  [ Cotizar ]  · · · · ·│
 *   └──────────────────────────────┘
 *
 * Las demás páginas usan HeroPagina (texto y escena); la portada no lleva
 * escena arriba. La de la marca en el centro del sistema baja a la sección
 * siguiente, «Tres servicios, un solo sistema», que es justo lo que dibuja.
 *
 * El h1 lleva las dos especialidades de la casa en una sola frase: «Páginas web
 * e inteligencia artificial para negocios en Aguascalientes». Dentro va entera
 * la frase clave de siempre —«inteligencia artificial para negocios en
 * Aguascalientes»—, así que sumar las páginas web no le quita nada. Es lo que
 * un motor generativo necesita leer para saber a quién recomendar, y ningún
 * otro encabezado pesa lo que pesa el h1.
 *
 * La etiqueta de encima dice qué es la empresa con la palabra que se busca.
 * Debajo va la frase corta (`bajada`); el párrafo largo (`apoyo`) solo si no
 * hay frase corta.
 */
const Hero = () => {
    const hero = useBloque('hero');

    if (hero.visible === false) return null;

    return (
        <section className="hero-portada zona-oscura relative isolate overflow-hidden">
            <FondoHero tenue />
            <PuntosReactivos className="hidden lg:block" />
            <div className="hero-portada__foco hidden lg:block" aria-hidden="true" />

            <div className="contenedor relative">
                <header className="hero-portada__texto">
                    <LogoAnimado />

                    {hero.insignia && <p className="insignia entrada">{hero.insignia}</p>}

                    {/* Los dos tonos van en línea y no en bloque: como bloques,
                        `text-wrap: balance` equilibra cada mitad por separado y
                        deja huérfanas como «en» sola en una línea. */}
                    <h1 className="titular-xl titular-largo entrada">
                        {hero.fraseA} <span className="titular-apagado">{hero.fraseB}</span>
                    </h1>

                    {(hero.bajada || hero.apoyo) && (
                        <p className="hero-portada__bajada entrada entrada-2">{hero.bajada || hero.apoyo}</p>
                    )}

                    {/* Un botón principal y una alternativa en texto: dos botones
                        del mismo peso reparten la atención. */}
                    <div className="hero-portada__cta entrada entrada-3">
                        <Enlace destino={hero.ctaPrimario?.destino} className="boton boton-acento boton-grande">
                            {hero.ctaPrimario?.texto}
                            <ArrowRight size={17} aria-hidden="true" />
                        </Enlace>
                        <Enlace
                            destino={hero.ctaSecundario?.destino}
                            className="enlace inline-flex min-h-[2.75rem] items-center text-[0.9375rem] font-bold"
                        >
                            {hero.ctaSecundario?.texto}
                        </Enlace>
                    </div>
                </header>
            </div>
        </section>
    );
};

export default Hero;
