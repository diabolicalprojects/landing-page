import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

import CustomCursor from '../components/common/CustomCursor';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { getArticulo, ARTICULOS_POR_FECHA } from '../data/articulos';
import { useHydrated } from '../utils/useHydrated';

const DiabolicalChatbot = lazy(() => import('../components/common/DiabolicalChatbot'));

const abrirChat = () => window.dispatchEvent(new Event('open-diabolical-chat'));

/** Fecha legible sin depender de la zona horaria del navegador: partir la
 *  cadena ISO evita que un artículo publicado hoy se muestre como de ayer al
 *  otro lado del meridiano. */
const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const fechaLegible = (iso) => {
    const [anio, mes, dia] = iso.split('-');
    return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${anio}`;
};

/**
 * Página de artículo. El <head> (título, descripción, JSON-LD con BlogPosting,
 * FAQPage y BreadcrumbList) lo resuelve el servidor — ver server/render.js.
 *
 * El cuerpo se pinta desde articulos.json y no desde HTML suelto para que el
 * texto que lee el visitante sea exactamente el mismo que se publica en el
 * sitemap y en los llms.txt.
 */
const ArticuloPage = ({ slug }) => {
    const articulo = getArticulo(slug);
    const mostrarChatbot = useHydrated();

    // App.jsx solo monta este componente con slugs que existen, así que llegar
    // aquí sin artículo significaría que articulos.json y las rutas se
    // desincronizaron.
    if (!articulo) return null;

    const otros = ARTICULOS_POR_FECHA.filter((a) => a.slug !== articulo.slug);

    return (
        <main className="relative bg-black min-h-screen selection:bg-white selection:text-black font-jakarta overflow-x-hidden">
            <CustomCursor />
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/[0.03] blur-[180px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[150px] rounded-full" />
            </div>

            <Navbar />

            {/* Encabezado */}
            <article className="relative z-10">
                <header className="pt-32 md:pt-44 pb-10 md:pb-14 px-5 md:px-6">
                    <div className="max-w-3xl mx-auto">
                        <nav aria-label="Ruta de navegación" className="mb-8">
                            <ol className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">
                                <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
                                <li aria-hidden="true">/</li>
                                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            </ol>
                        </nav>

                        <h1 className="text-3xl md:text-5xl font-title uppercase tracking-tighter leading-[0.92] mb-6">
                            {articulo.titular}
                        </h1>

                        <p className="text-white/60 text-base md:text-lg leading-relaxed font-light mb-8">
                            {articulo.entradilla}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold border-t border-white/5 pt-6">
                            <time dateTime={articulo.fecha}>{fechaLegible(articulo.fecha)}</time>
                            {articulo.lectura ? (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <span>{articulo.lectura} de lectura</span>
                                </>
                            ) : null}
                            {articulo.actualizado && articulo.actualizado !== articulo.fecha ? (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <span>Actualizado el {fechaLegible(articulo.actualizado)}</span>
                                </>
                            ) : null}
                        </div>
                    </div>
                </header>

                {/* Cuerpo */}
                <div className="px-5 md:px-6 pb-16 md:pb-24">
                    <div className="max-w-3xl mx-auto space-y-12 md:space-y-14">
                        {articulo.secciones.map((seccion, i) => (
                            <section key={i}>
                                <h2 className="text-xl md:text-2xl font-title uppercase tracking-tighter leading-tight mb-5">
                                    {seccion.titulo}
                                </h2>
                                <div className="space-y-4">
                                    {seccion.parrafos.map((parrafo, j) => (
                                        <p key={j} className="text-white/60 text-sm md:text-base leading-relaxed font-light">
                                            {parrafo}
                                        </p>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </article>

            {/* Preguntas frecuentes del artículo. Las preguntas van en el HTML,
                no detrás de un estado de React: el FAQPage del JSON-LD solo es
                válido si Google encuentra el mismo texto en la página. */}
            <section className="relative z-10 py-16 md:py-24 px-5 md:px-6 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-title uppercase tracking-tighter mb-10">
                        Preguntas frecuentes
                    </h2>

                    <div className="space-y-3">
                        {articulo.faq.map((item, i) => (
                            <details key={i} className="glass-card rounded-2xl border-white/5 group">
                                <summary className="cursor-pointer list-none p-6 flex justify-between items-center gap-4">
                                    <h3 className="text-sm font-bold text-white leading-snug">{item.q}</h3>
                                    <span className="text-white/30 text-xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                                </summary>
                                <p className="px-6 pb-6 text-white/55 text-sm leading-relaxed font-light">{item.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cierre */}
            <section className="relative z-10 py-16 md:py-24 px-5 md:px-6 border-t border-white/5">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter mb-5 leading-[0.95]">
                        ¿Quieres saber qué automatizar en tu negocio?
                    </h2>
                    <p className="text-white/55 text-sm md:text-base leading-relaxed mb-9 max-w-xl mx-auto font-light">
                        La auditoría de fricción es gratuita: revisamos dónde se te están escapando
                        clientes y te decimos qué se puede automatizar y qué no vale la pena tocar.
                    </p>
                    <button
                        onClick={abrirChat}
                        className="px-10 py-5 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.35em] hover:scale-[1.02] active:scale-95 transition-all min-h-[60px]"
                    >
                        Empezar el diagnóstico
                    </button>
                </div>
            </section>

            {/* Enlaces cruzados: reparten autoridad entre los artículos y evitan
                que cada uno quede aislado del resto. */}
            <section className="relative z-10 py-12 md:py-16 px-5 md:px-6 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <h2 className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-black">
                            {otros.length > 0 ? 'Seguir leyendo' : 'Blog'}
                        </h2>
                        <Link
                            to="/blog"
                            className="text-[9px] uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors font-bold flex items-center gap-2"
                        >
                            <ArrowLeft size={12} /> Todos los artículos
                        </Link>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {otros.map((otro) => (
                            <Link
                                key={otro.slug}
                                to={`/blog/${otro.slug}`}
                                className="px-5 py-3 glass rounded-full text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all inline-flex items-center gap-2"
                            >
                                {otro.titular} <ArrowRight size={12} />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />

            {mostrarChatbot ? (
                <Suspense fallback={null}>
                    <DiabolicalChatbot />
                </Suspense>
            ) : null}
        </main>
    );
};

export default ArticuloPage;
