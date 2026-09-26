import React from 'react';
import { ArrowRight } from 'lucide-react';

import { useBloque } from '../../contenido';
import Enlace from '../common/Enlace';
import HeroPagina from '../common/HeroPagina';

/*
 * Primer viewport.
 *
 * El h1 lleva las dos especialidades de la casa en una sola frase: «Páginas web
 * e inteligencia artificial para negocios en Aguascalientes». Dentro va entera
 * la frase clave de siempre —«inteligencia artificial para negocios en
 * Aguascalientes»—, así que sumar las páginas web no le quita nada. Es lo que
 * un motor generativo necesita leer para saber a quién recomendar, y ningún
 * otro encabezado pesa lo que pesa el h1.
 *
 * La insignia de encima dice qué es la empresa con la palabra que se busca:
 * agencia. «Diseño de páginas web» como tal se deja a la landing, para que la
 * portada no compita con ella por la misma búsqueda.
 *
 * Al lado, la marca en el centro de su propio sistema, con los canales del
 * negocio colgando de ella. El logotipo no está de adorno: es literalmente el
 * dibujo de lo que se vende. En el teléfono esa escena es el banner de arriba
 * (ver HeroPagina).
 */
const Hero = () => {
    const hero = useBloque('hero');

    if (hero.visible === false) return null;

    return (
        <HeroPagina
            insignia={hero.insignia}
            largo
            /* Los dos tonos van en línea y no en bloque: como bloques,
               `text-wrap: balance` equilibra cada mitad por separado y deja
               huérfanas como «en» sola en una línea. En línea, la frase se
               equilibra entera. */
            titulo={
                <>
                    {hero.fraseA} <span className="titular-apagado">{hero.fraseB}</span>
                </>
            }
            entradilla={hero.apoyo}
            bajada={hero.bajada}
            cta={
                /* Un botón principal y una alternativa en texto: dos botones
                   del mismo peso reparten la atención. */
                <div className="flex flex-col gap-x-7 gap-y-4 sm:flex-row sm:items-center">
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
            }
            escena={{
                clave: 'nucleo',
                etiqueta:
                    'La marca de Diabolical en el centro de un sistema, con la página web, WhatsApp, la agenda y las redes conectados a ella.',
            }}
            arriba="lg:pt-[clamp(7rem,20svh,10rem)]"
            abajo="lg:pb-[clamp(4rem,12svh,7rem)]"
            hueco="lg:gap-x-10"
            fondo={
                <>
                    <div className="rejilla hidden lg:block" aria-hidden="true" />
                    <div
                        className="resplandor left-1/2 top-[-16rem] hidden h-[32rem] w-[48rem] -translate-x-1/2 lg:block"
                        aria-hidden="true"
                    />
                </>
            }
        />
    );
};

export default Hero;
