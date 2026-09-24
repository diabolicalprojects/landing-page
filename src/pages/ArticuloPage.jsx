import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import Pagina from '../components/common/Pagina';
import HeroPagina from '../components/common/HeroPagina';
import Enlace from '../components/common/Enlace';
import Preguntas from '../components/common/Preguntas';
import TextoConEnlaces from '../components/common/TextoConEnlaces';
import CtaServicio from '../components/common/CtaServicio';
import { getArticulo, ARTICULOS_POR_FECHA } from '../data/articulos';
import { getServicio, rutaServicio } from '../data/servicios';
import { fechaLegible } from '../utils/fechas';
import logoCuadrado from '../assets/logo/LOGO-DIABOLICAL-CUADRADO-BLANCO.svg';

/*
 * Página de artículo.
 *
 * Los artículos existen para dos cosas: que Google y los motores de IA los
 * citen cuando alguien pregunta «¿qué empresa de IA hay en Aguascalientes?» o
 * «¿dónde hago mi página web?», y que quien los lee acabe en la landing del
 * servicio que busca. Por eso la estructura es la que esos motores extraen
 * mejor y el cierre lleva a un solo sitio:
 *
 *   Encabezado        la pregunta como h1, fecha y actualización visibles
 *   En pocas palabras la respuesta directa, que se entiende sin lo demás
 *   Cuerpo            secciones con h2 que repiten cómo pregunta la gente,
 *                     listas y tablas donde el contenido lo pide
 *   Preguntas         el FAQPage del artículo, visible
 *   Cierre            un botón a la landing del servicio del artículo
 *
 * El <head> (título, descripción, BlogPosting, FAQPage y BreadcrumbList) lo
 * resuelve el servidor — ver server/schema.js.
 */

const Lista = ({ lista }) => {
    const Etiqueta = lista.ordenada ? 'ol' : 'ul';
    return (
        <Etiqueta className="mt-5 space-y-3">
            {lista.items.map((item, i) => (
                <li key={item} className="flex items-start gap-4">
                    {lista.ordenada ? (
                        <span
                            className="cifras etiqueta-mono mt-1.5 w-6 flex-none"
                            style={{ color: 'var(--texto-3)' }}
                            aria-hidden="true"
                        >
                            {i + 1}
                        </span>
                    ) : (
                        <span
                            className="mt-[0.8rem] h-px w-3 flex-none"
                            style={{ background: 'var(--texto-3)' }}
                            aria-hidden="true"
                        />
                    )}
                    <span className="cuerpo-destacado" style={{ color: 'var(--texto-2)' }}>
                        <TextoConEnlaces texto={item} />
                    </span>
                </li>
            ))}
        </Etiqueta>
    );
};

const Tabla = ({ tabla }) => (
    <div className="mt-6 overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--linea)' }}>
        <table className="w-full min-w-[34rem] border-collapse text-left text-[0.9375rem]">
            {tabla.titulo && <caption className="sr-only">{tabla.titulo}</caption>}
            <thead>
                <tr>
                    {tabla.columnas.map((columna) => (
                        <th
                            key={columna}
                            scope="col"
                            className="etiqueta px-4 py-3.5"
                            style={{ color: 'var(--texto-3)', borderBottom: '1px solid var(--linea)' }}
                        >
                            {columna}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {tabla.filas.map((fila, i) => (
                    <tr key={fila[0]} style={i > 0 ? { borderTop: '1px solid var(--linea)' } : undefined}>
                        {fila.map((celda, j) =>
                            j === 0 ? (
                                <th key={j} scope="row" className="px-4 py-3.5 font-bold" style={{ color: 'var(--texto-1)' }}>
                                    {celda}
                                </th>
                            ) : (
                                <td key={j} className="px-4 py-3.5 leading-relaxed" style={{ color: 'var(--texto-2)' }}>
                                    {celda}
                                </td>
                            )
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ArticuloPage = ({ slug }) => {
    const articulo = getArticulo(slug);

    // App.jsx solo monta este componente con slugs que existen, así que llegar
    // aquí sin artículo significaría que articulos.json y las rutas se
    // desincronizaron.
    if (!articulo) return null;

    const servicio = getServicio(articulo.servicio);
    const otros = ARTICULOS_POR_FECHA.filter((a) => a.slug !== articulo.slug).slice(0, 4);
    const actualizado = articulo.actualizado && articulo.actualizado !== articulo.fecha;

    return (
        <Pagina>
            <article>
                <HeroPagina
                    como="header"
                    migas={[{ texto: 'Blog', destino: '/blog' }, { texto: articulo.titular }]}
                    largo
                    titulo={articulo.titular}
                    entradilla={articulo.entradilla}
                    meta={
                        <p className="etiqueta-mono mt-8 flex flex-wrap gap-x-3 gap-y-1" style={{ color: 'var(--texto-3)' }}>
                            <time dateTime={articulo.fecha}>{fechaLegible(articulo.fecha)}</time>
                            {articulo.lectura && <span>· {articulo.lectura} de lectura</span>}
                            {actualizado && (
                                <span>
                                    · Actualizado el{' '}
                                    <time dateTime={articulo.actualizado}>{fechaLegible(articulo.actualizado)}</time>
                                </span>
                            )}
                        </p>
                    }
                    foto={articulo.foto}
                    separacion="lg:mb-[clamp(2.5rem,4vw,3.5rem)]"
                    abajo="lg:pb-16"
                />

                {/* La respuesta directa. Es el párrafo que un motor generativo
                    puede citar tal cual, así que se entiende sin nada alrededor. */}
                {articulo.respuesta && (
                    <section className="zona-oscura zona-oscura-2 seccion-compacta" aria-labelledby="respuesta-corta">
                        <div className="contenedor">
                            <div className="grid gap-5 lg:grid-cols-12 lg:gap-16">
                                <h2 id="respuesta-corta" className="sr-only">
                                    Respuesta corta
                                </h2>
                                <p className="cuerpo-l m-0 max-w-[68ch] lg:col-span-12" style={{ color: 'var(--texto-1)' }}>
                                    <TextoConEnlaces texto={articulo.respuesta} />
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                <div className="zona-oscura seccion">
                    <div className="contenedor">
                        <div className="max-w-3xl space-y-14 md:space-y-16">
                            {articulo.secciones.map((seccion, indice) => (
                                <React.Fragment key={seccion.titulo}>
                                <section>
                                    <h2 className="titular-m">{seccion.titulo}</h2>
                                    <div className="mt-5 space-y-4">
                                        {(seccion.parrafos ?? []).map((parrafo) => (
                                            <p key={parrafo.slice(0, 40)} className="cuerpo-destacado" style={{ color: 'var(--texto-2)' }}>
                                                <TextoConEnlaces texto={parrafo} />
                                            </p>
                                        ))}
                                    </div>
                                    {seccion.lista && <Lista lista={seccion.lista} />}
                                    {seccion.tabla && <Tabla tabla={seccion.tabla} />}
                                    {seccion.nota && (
                                        <p className="cuerpo-destacado mt-5" style={{ color: 'var(--texto-2)' }}>
                                            <TextoConEnlaces texto={seccion.nota} />
                                        </p>
                                    )}
                                </section>
                                {indice === 1 && servicio && (
                                    <CtaServicio servicio={servicio.slug} ubicacion="guia-medio" />
                                )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </article>

            {/* Las preguntas van en el HTML aunque estén plegadas: el FAQPage
                del JSON-LD solo es válido si Google encuentra el mismo texto. */}
            {(articulo.faq ?? []).length > 0 && (
                <section className="zona-clara seccion" aria-labelledby="preguntas-articulo">
                    <div className="contenedor">
                        <div className="max-w-3xl">
                            <h2 id="preguntas-articulo" className="titular-l">
                                Preguntas frecuentes
                            </h2>
                            <div className="mt-10">
                                <Preguntas items={articulo.faq.map(({ q, a }) => ({ pregunta: q, respuesta: a }))} />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Cierre: un solo destino, la landing del servicio que busca quien
                llegó a este artículo. */}
            <section className={`${(articulo.faq ?? []).length > 0 ? 'zona-clara pt-4' : 'zona-clara pt-20'} pb-20 md:pb-28`}>
                <div className="contenedor">
                    <div
                        className="zona-oscura relative overflow-hidden px-6 py-16 text-center md:px-16 md:py-20"
                        style={{ borderRadius: 'var(--radio-losa)' }}
                    >
                        <div className="rejilla" aria-hidden="true" />
                        <div className="relative mx-auto max-w-2xl">
                            <img src={logoCuadrado} alt="" width="48" height="48" className="mx-auto mb-8 w-12 opacity-90" />
                            <h2 className="titular-l">{articulo.cta?.titulo ?? '¿Lo vemos para su negocio?'}</h2>
                            <p className="cuerpo-l mx-auto mt-6 text-center">
                                {articulo.cta?.texto ??
                                    'La auditoría no tiene costo ni compromiso: salimos de ella sabiendo qué conviene hacer en su negocio y qué no.'}
                            </p>
                            <CtaServicio
                                servicio={servicio?.slug}
                                secundario={
                                    servicio
                                        ? { texto: articulo.cta?.boton ?? `Ver ${servicio.nombre.toLowerCase()}`, destino: rutaServicio(servicio.slug) }
                                        : undefined
                                }
                                ubicacion="guia-cierre"
                                centrado
                                className="mt-10"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {otros.length > 0 && (
                <section className="zona-oscura seccion-compacta">
                    <div className="contenedor">
                        <h2 className="titular-m">Seguir leyendo</h2>
                        <ul className="mt-6 grid gap-3 md:grid-cols-2">
                            {otros.map((otro) => (
                                <li key={otro.slug}>
                                    <Enlace
                                        destino={`/blog/${otro.slug}`}
                                        className="tarjeta tarjeta-enlace flex h-full items-center justify-between gap-4 px-5 py-4"
                                    >
                                        <span className="text-[0.9375rem] font-bold tracking-tight">{otro.titular}</span>
                                        <ArrowUpRight size={16} className="flex-none text-white/45" aria-hidden="true" />
                                    </Enlace>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}
        </Pagina>
    );
};

export default ArticuloPage;
