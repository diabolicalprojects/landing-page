import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { useBloque } from '../../contenido';
import PanelGuardia from './PanelGuardia';

/*
 * Primer viewport.
 *
 * Una sola frase y una sola acción. Lo que antes ocupaba este sitio era un
 * titular de tres líneas que intentaba nombrar el servicio, el sector y el
 * mecanismo a la vez; nadie lee eso en un móvil entre dos tareas.
 *
 * A la izquierda la frase y la acción. A la derecha el sistema trabajando de
 * madrugada, que es la prueba de la frase. El suelo es una rejilla en
 * perspectiva con un foco cálido detrás: profundidad sin una sola imagen.
 */

const Destino = ({ destino, children, ...resto }) => {
    if (!destino) return null;
    // Las rutas internas van por el router; las anclas y lo externo, por <a>:
    // meter un ancla en <Link> haría que React Router intentara navegar a ella.
    const esRuta = destino.startsWith('/');
    const Componente = esRuta ? Link : 'a';
    const props = esRuta ? { to: destino } : { href: destino };
    return (
        <Componente {...props} {...resto}>
            {children}
        </Componente>
    );
};

const Hero = () => {
    const hero = useBloque('hero');

    if (hero.visible === false) return null;

    return (
        <section className="zona-oscura relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
            <div className="rejilla" aria-hidden="true" />
            <div
                className="resplandor left-1/2 top-[-14rem] h-[30rem] w-[46rem] -translate-x-1/2"
                aria-hidden="true"
            />

            <div className="contenedor relative">
                <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-6 xl:col-span-6">
                        <h1 className="titular-xl entrada">
                            <span className="titular-apagado block">{hero.fraseA}</span>
                            <span className="block">{hero.fraseB}</span>
                        </h1>

                        <p className="cuerpo-l entrada entrada-2 mt-7">{hero.apoyo}</p>

                        <div className="entrada entrada-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Destino
                                destino={hero.ctaPrimario?.destino}
                                className="boton boton-acento"
                            >
                                {hero.ctaPrimario?.texto}
                                <ArrowRight size={16} aria-hidden="true" />
                            </Destino>
                            <Destino
                                destino={hero.ctaSecundario?.destino}
                                className="boton boton-fantasma"
                            >
                                {hero.ctaSecundario?.texto}
                            </Destino>
                        </div>

                        <p className="etiqueta-mono entrada entrada-3 mt-7 text-white/55">
                            {hero.pie}
                        </p>
                    </div>

                    <div className="entrada entrada-4 lg:col-span-6 xl:col-span-6">
                        <PanelGuardia />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
