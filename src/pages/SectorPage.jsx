import React, { useId, useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';

import Pagina, { Migas } from '../components/common/Pagina';
import Enlace from '../components/common/Enlace';
import MotionGrafico from '../motion/MotionGrafico';
import { hayEscena } from '../motion/escenas';
import { SECTORES, getSector } from '../data/sectores';
import { rutaServicio } from '../data/servicios';

/*
 * Página de un sector.
 *
 * El h1 es la frase clave del negocio aplicada al giro: «Inteligencia
 * artificial para inmobiliarias». Es la búsqueda que hace alguien que ya sabe
 * lo que quiere, y la que ningún competidor local está respondiendo.
 *
 * Las seis páginas salen de src/data/sectores.json, la misma fuente de la que
 * server/schema.js construye el FAQPage. Google exige que lo marcado sea
 * exactamente lo que ve el visitante, así que dos listas separadas acabarían
 * convirtiendo el marcado en infractor.
 */
const SectorPage = ({ slug }) => {
    const sector = getSector(slug);
    const [abierta, setAbierta] = useState(null);
    const idBase = useId();

    if (!sector) return null;

    const otros = SECTORES.filter((s) => s.slug !== sector.slug);

    return (
        <Pagina>
            <Migas ruta={[{ texto: 'Sectores', destino: '/sectores' }, { texto: sector.nombreCorto }]} />

            <section className="zona-oscura seccion">
                <div className="contenedor">
                    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
                        <header className="lg:col-span-6">
                            <p className="insignia">{sector.nombreCorto}</p>
                            <h1 className="titular-xl mt-5">{sector.titular}</h1>
                            <p className="cuerpo-l mt-7">{sector.entradilla}</p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Enlace destino="/contacto" className="boton boton-acento">
                                    Solicitar auditoría gratuita
                                    <ArrowRight size={16} aria-hidden="true" />
                                </Enlace>
                                <Enlace destino="/servicios" className="boton boton-fantasma">
                                    Ver los servicios
                                </Enlace>
                            </div>
                        </header>

                        <div className="lg:col-span-6">
                            {hayEscena(sector.slug) && (
                                <MotionGrafico
                                    escena={sector.slug}
                                    prioridad
                                    etiqueta={`Ilustración animada del sistema trabajando para ${sector.nombreCorto.toLowerCase()}.`}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="zona-clara seccion">
                <div className="contenedor">
                    <h2 className="titular-l max-w-3xl">
                        Un día cualquiera, <span className="titular-apagado">con el sistema puesto.</span>
                    </h2>

                    <ol className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
                        {(sector.momentos ?? []).map((momento, i) => (
                            <li key={momento} className="tarjeta flex items-start gap-5 p-6">
                                <span
                                    className="cifras etiqueta-mono mt-1 flex-none"
                                    style={{ color: 'var(--texto-3)' }}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <p className="cuerpo max-w-none">{momento}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="zona-oscura seccion">
                <div className="contenedor">
                    <h2 className="titular-l max-w-3xl">
                        Qué se instala <span className="titular-apagado">exactamente.</span>
                    </h2>

                    <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
                        {(sector.soluciones ?? []).map((solucion) => (
                            <article key={solucion.titulo} className="tarjeta p-6 md:p-8">
                                <h3 className="titular-m">{solucion.titulo}</h3>
                                <p className="cuerpo mt-3">{solucion.detalle}</p>
                            </article>
                        ))}
                    </div>

                    {/* La página web del giro. Todo lo de arriba necesita un sitio
                        donde vivir, y es la mitad del oficio de la casa. */}
                    <Enlace
                        destino={rutaServicio('sitio-web')}
                        className="tarjeta tarjeta-enlace mt-4 flex items-center justify-between gap-6 p-6 md:p-8"
                    >
                        <span>
                            <span className="titular-m block">
                                Página web para {sector.nombreCorto.toLowerCase()}
                            </span>
                            <span className="cuerpo mt-3 block">
                                Diseño y desarrollo de páginas web en Aguascalientes, con este sistema
                                integrado en el propio sitio desde el primer día.
                            </span>
                        </span>
                        <ArrowRight size={18} className="flex-none text-white/55" aria-hidden="true" />
                    </Enlace>
                </div>
            </section>

            <section className="zona-clara seccion">
                <div className="contenedor">
                    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                        <h2 className="titular-l lg:col-span-4">
                            Preguntas <span className="titular-apagado">de este giro.</span>
                        </h2>

                        <ul className="space-y-2.5 lg:col-span-8">
                            {(sector.faq ?? []).map((item, i) => {
                                const estaAbierta = abierta === i;
                                const idPanel = `${idBase}-p-${i}`;
                                const idBoton = `${idBase}-b-${i}`;
                                return (
                                    <li key={item.q} className="tarjeta overflow-hidden">
                                        <h3>
                                            <button
                                                type="button"
                                                id={idBoton}
                                                aria-expanded={estaAbierta}
                                                aria-controls={idPanel}
                                                onClick={() => setAbierta(estaAbierta ? null : i)}
                                                className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left md:px-7"
                                            >
                                                <span className="text-[1rem] font-bold leading-snug tracking-tight">
                                                    {item.q}
                                                </span>
                                                <span
                                                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                                                    style={{
                                                        background: estaAbierta
                                                            ? 'var(--tinta)'
                                                            : 'var(--papel-2)',
                                                        color: estaAbierta ? 'var(--papel)' : 'var(--texto-1)',
                                                        transform: estaAbierta ? 'rotate(45deg)' : 'none',
                                                    }}
                                                    aria-hidden="true"
                                                >
                                                    <Plus size={16} />
                                                </span>
                                            </button>
                                        </h3>
                                        <div id={idPanel} role="region" aria-labelledby={idBoton} hidden={!estaAbierta}>
                                            <p
                                                className="cuerpo max-w-none px-5 pb-6 md:px-7"
                                                style={{ borderTop: '1px solid var(--linea)', paddingTop: '1.25rem' }}
                                            >
                                                {item.a}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="zona-oscura seccion">
                <div className="contenedor">
                    <h2 className="titular-m">Inteligencia artificial para otros giros</h2>
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {otros.map((otro) => (
                            <li key={otro.slug}>
                                <Enlace
                                    destino={`/sectores/${otro.slug}`}
                                    className="tarjeta tarjeta-enlace flex min-h-[4.5rem] items-center justify-between gap-4 px-5 py-4"
                                >
                                    <span className="text-[0.9375rem] font-bold tracking-tight">
                                        {otro.nombreCorto}
                                    </span>
                                    <ArrowRight size={16} className="flex-none text-white/45" aria-hidden="true" />
                                </Enlace>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </Pagina>
    );
};

export default SectorPage;
