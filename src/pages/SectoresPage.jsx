import React from 'react';
import { ArrowRight } from 'lucide-react';

import Pagina, { Migas } from '../components/common/Pagina';
import Enlace from '../components/common/Enlace';
import MotionGrafico from '../motion/MotionGrafico';
import { hayEscena } from '../motion/escenas';
import { SECTORES_PRINCIPALES, SECTORES_SECUNDARIOS } from '../data/sectores';

/*
 * Índice de sectores.
 *
 * Los cuatro giros del enfoque llevan tarjeta con su propia escena. Los que se
 * siguen atendiendo sin encabezar nada van debajo, en una lista corta. Las
 * escenas se cargan solo cuando entran en pantalla.
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
                        Cuatro giros que conocemos a fondo: inmobiliarias, gimnasios, spas y salones
                        de uñas. Cada uno con su página, lo que el sistema hace en ese giro y las
                        preguntas que surgen antes de decidir.
                    </p>
                </header>

                <div className="mt-14 grid gap-4 md:mt-20 lg:grid-cols-2">
                    {SECTORES_PRINCIPALES.map((sector) => (
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

                {SECTORES_SECUNDARIOS.length > 0 && (
                    <div className="mt-16 md:mt-20">
                        <h2 className="titular-m">Otros giros que también atendemos</h2>
                        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {SECTORES_SECUNDARIOS.map((sector) => (
                                <li key={sector.slug}>
                                    <Enlace
                                        destino={`/sectores/${sector.slug}`}
                                        className="tarjeta tarjeta-enlace flex min-h-[4.5rem] items-center justify-between gap-4 px-5 py-4"
                                    >
                                        <span className="text-[0.9375rem] font-bold tracking-tight">
                                            {sector.titular}
                                        </span>
                                        <ArrowRight size={16} className="flex-none text-white/45" aria-hidden="true" />
                                    </Enlace>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    </Pagina>
);

export default SectoresPage;
