import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import Pagina, { Migas } from '../components/common/Pagina';
import Enlace from '../components/common/Enlace';
import { ARTICULOS_POR_FECHA } from '../data/articulos';
import { fechaLegible } from '../utils/fechas';

/*
 * Índice del blog.
 *
 * Las guías contestan las preguntas que la gente le hace a Google y a los
 * motores de IA antes de contratar —qué empresa de IA elegir, dónde hacer una
 * página web, qué resuelve un chatbot—, y cada una termina en la landing del
 * servicio que corresponde. El <head> (Blog y BreadcrumbList) lo resuelve el
 * servidor.
 */
const BlogPage = () => (
    <Pagina>
        <Migas ruta={[{ texto: 'Blog' }]} />

        <section className="zona-oscura seccion">
            <div className="contenedor">
                <header className="max-w-3xl">
                    <h1 className="titular-xl">
                        Inteligencia artificial y páginas web,{' '}
                        <span className="titular-apagado">sin humo.</span>
                    </h1>
                    <p className="cuerpo-l mt-7">
                        Respuestas directas a lo que preguntan los negocios de Aguascalientes antes de
                        contratar: qué empresa elegir, qué resuelve un chatbot, cuánto tarda una página
                        web y cómo se automatiza una agenda.
                    </p>
                </header>

                <ul className="mt-14 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-2">
                    {ARTICULOS_POR_FECHA.map((articulo) => (
                        <li key={articulo.slug}>
                            <Enlace
                                destino={`/blog/${articulo.slug}`}
                                className="tarjeta tarjeta-enlace flex h-full flex-col p-6 md:p-8"
                            >
                                <p className="etiqueta-mono" style={{ color: 'var(--texto-3)' }}>
                                    <time dateTime={articulo.fecha}>{fechaLegible(articulo.fecha)}</time>
                                    {articulo.lectura && ` · ${articulo.lectura}`}
                                </p>
                                <h2 className="titular-m mt-4">{articulo.titular}</h2>
                                <p className="cuerpo mt-3 flex-1">{articulo.entradilla}</p>
                                <span
                                    className="etiqueta mt-6 inline-flex items-center gap-1.5"
                                    style={{ color: 'var(--texto-3)' }}
                                >
                                    Leer la guía
                                    <ArrowUpRight size={13} aria-hidden="true" />
                                </span>
                            </Enlace>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    </Pagina>
);

export default BlogPage;
