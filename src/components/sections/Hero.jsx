import React from 'react';
import { ArrowRight } from 'lucide-react';

import { useBloque } from '../../contenido';
import Enlace from '../common/Enlace';
import MotionGrafico from '../../motion/MotionGrafico';

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
 * dibujo de lo que se vende.
 */
const Hero = () => {
    const hero = useBloque('hero');

    if (hero.visible === false) return null;

    return (
        <section className="zona-oscura relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
            <div className="rejilla" aria-hidden="true" />
            <div
                className="resplandor left-1/2 top-[-16rem] h-[32rem] w-[48rem] -translate-x-1/2"
                aria-hidden="true"
            />

            <div className="contenedor relative">
                <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-7">
                        {hero.insignia && (
                            <p className="insignia entrada mb-6">{hero.insignia}</p>
                        )}
                        {/* Los dos tonos van en línea y no en bloque: como
                            bloques, `text-wrap: balance` equilibra cada mitad
                            por separado y deja huérfanas como «en» sola en una
                            línea. En línea, la frase se equilibra entera. */}
                        <h1 className="titular-xl titular-largo entrada">
                            {hero.fraseA}{' '}
                            <span className="titular-apagado">{hero.fraseB}</span>
                        </h1>

                        <p className="cuerpo-l entrada entrada-2 mt-7">{hero.apoyo}</p>

                        <div className="entrada entrada-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Enlace
                                destino={hero.ctaPrimario?.destino}
                                className="boton boton-acento"
                            >
                                {hero.ctaPrimario?.texto}
                                <ArrowRight size={16} aria-hidden="true" />
                            </Enlace>
                            <Enlace
                                destino={hero.ctaSecundario?.destino}
                                className="boton boton-fantasma"
                            >
                                {hero.ctaSecundario?.texto}
                            </Enlace>
                        </div>

                        <p className="etiqueta-mono entrada entrada-3 mt-7 text-white/55">
                            {hero.pie}
                        </p>
                    </div>

                    <div className="entrada entrada-4 lg:col-span-5">
                        <MotionGrafico
                            escena="nucleo"
                            prioridad
                            etiqueta="La marca de Diabolical en el centro de un sistema, con la página web, WhatsApp, la agenda y las redes conectados a ella."
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
