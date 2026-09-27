import React from 'react';
import { ArrowRight } from 'lucide-react';

import Pagina from '../components/common/Pagina';
import HeroPagina from '../components/common/HeroPagina';
import Enlace from '../components/common/Enlace';
import CtaServicio from '../components/common/CtaServicio';
import { useBloque } from '../contenido';
import { SECTORES } from '../data/sectores';

/*
 * Quiénes somos.
 *
 * Es la página donde la marca se explica, así que es la que lleva la escena de
 * identidad: el logotipo construyéndose a tamaño grande sobre su retícula, con
 * sus cotas y sus puntos de construcción. No es adorno: dice en imagen lo que
 * el texto dice en palabras, que detrás de lo que se ve hay un sistema.
 *
 * Debajo, la trayectoria del equipo y por qué el nombre, en tres párrafos. La
 * cifra es la que dio el cliente (más de cinco años de experiencia conjunta):
 * aquí no se inventa ninguna.
 */
const NosotrosPage = () => {
    const {
        titulo,
        tituloApagado,
        entradilla,
        bajada,
        trayectoria = {},
        principios = [],
    } = useBloque('nosotros');

    return (
        <Pagina>
            <HeroPagina
                migas={[{ texto: 'Quiénes somos' }]}
                largo
                /* Frase clave larga: «Una agencia de páginas web e
                   inteligencia artificial en Aguascalientes». */
                titulo={
                    <>
                        {titulo} <span className="titular-apagado">{tituloApagado}</span>
                    </>
                }
                entradilla={entradilla}
                bajada={bajada}
                cta={<CtaServicio ubicacion="nosotros-hero" />}
                columnas={6}
                escena={{
                    clave: 'identidad',
                    etiqueta:
                        'El logo de Diabolical construyéndose sobre su retícula: se trazan el disco y la cabeza, se rellenan y se abre el ojo, con los anillos girando alrededor.',
                }}
                fondo={
                    <>
                        <div className="rejilla hidden lg:block" aria-hidden="true" />
                        <div
                            className="resplandor right-[-10rem] top-[-8rem] hidden h-[40rem] w-[52rem] lg:block"
                            aria-hidden="true"
                        />
                    </>
                }
            />

            {trayectoria.titulo && (
                <section className="zona-clara seccion">
                    <div className="contenedor">
                        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                            <div className="lg:col-span-5">
                                <h2 className="titular-l">
                                    {trayectoria.titulo}{' '}
                                    <span className="titular-apagado">{trayectoria.tituloApagado}</span>
                                </h2>
                                {trayectoria.cifra && (
                                    <p className="mt-10 flex items-baseline gap-3 md:mt-14">
                                        <span className="cifras font-title text-7xl leading-none md:text-8xl">
                                            {trayectoria.cifra}
                                        </span>
                                        <span className="etiqueta max-w-[10rem]" style={{ color: 'var(--texto-2)' }}>
                                            {trayectoria.unidad}
                                        </span>
                                    </p>
                                )}
                            </div>
                            <div className="space-y-6 lg:col-span-7 lg:pt-2">
                                {(trayectoria.parrafos ?? []).map((parrafo) => (
                                    <p key={parrafo.slice(0, 40)} className="cuerpo-l max-w-none">
                                        {parrafo}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="zona-oscura seccion">
                <div className="contenedor">
                    <h2 className="titular-l max-w-2xl">
                        Cómo trabajamos.
                    </h2>

                    <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
                        {principios.map((principio) => (
                            <article key={principio.id} className="tarjeta p-6 md:p-8">
                                <h3 className="titular-m">{principio.titulo}</h3>
                                <p className="cuerpo mt-3">{principio.texto}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="zona-oscura zona-oscura-1 seccion">
                <div className="contenedor">
                    <h2 className="titular-l max-w-2xl">
                        Los giros <span className="titular-apagado">que conocemos a fondo.</span>
                    </h2>

                    <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {SECTORES.map((sector) => (
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
                    <CtaServicio ubicacion="nosotros" className="mt-12" />
                </div>
            </section>
        </Pagina>
    );
};

export default NosotrosPage;
