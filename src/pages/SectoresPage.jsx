import React from 'react';
import { ArrowRight } from 'lucide-react';

import Pagina, { Migas } from '../components/common/Pagina';
import Enlace from '../components/common/Enlace';
import MotionGrafico from '../motion/MotionGrafico';
import { hayEscena } from '../motion/escenas';
import { SECTORES } from '../data/sectores';

/*
 * Índice de sectores.
 *
 * Cada tarjeta lleva su propia escena, así que la página enseña seis mecanismos
 * distintos en lugar de seis títulos. Las escenas se cargan solo cuando entran
 * en pantalla, de modo que abrir esta página no descarga seis animaciones de
 * golpe.
 */
const SectoresPage = () => (
    <Pagina>
        <Migas ruta={[{ texto: 'Sectores' }]} />

        <section className="zona-oscura seccion">
            <div className="contenedor">
                <header className="max-w-3xl">
                    <p className="insignia">Sectores</p>
                    <h1 className="titular-xl mt-5">
                        Inteligencia artificial{' '}
                        <span className="titular-apagado">para cada giro.</span>
                    </h1>
                    <p className="cuerpo-l mt-7">
                        Seis sectores de Aguascalientes con su recorrido mapeado. Cada uno tiene su
                        propia página, con lo que el sistema hace en ese giro y las preguntas que
                        surgen antes de decidir.
                    </p>
                </header>

                <div className="mt-14 grid gap-4 md:mt-20 lg:grid-cols-2">
                    {SECTORES.map((sector) => (
                        <article key={sector.slug} className="tarjeta tarjeta-enlace flex flex-col p-5 md:p-6">
                            {hayEscena(sector.slug) && (
                                <div className="mb-6 overflow-hidden rounded-xl border border-white/[0.07]">
                                    <MotionGrafico
                                        escena={sector.slug}
                                        etiqueta={`Ilustración animada del sistema trabajando para ${sector.nombreCorto.toLowerCase()}.`}
                                    />
                                </div>
                            )}

                            <h2 className="titular-m">{sector.titular}</h2>
                            <p className="cuerpo mt-3 flex-1">{sector.entradilla}</p>

                            <Enlace
                                destino={`/sectores/${sector.slug}`}
                                className="enlace mt-6 inline-flex min-h-[1.75rem] items-center gap-1.5 self-start py-1 text-[0.9375rem] font-bold"
                            >
                                Ver {sector.nombreCorto.toLowerCase()}
                                <ArrowRight size={15} aria-hidden="true" />
                            </Enlace>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    </Pagina>
);

export default SectoresPage;
