import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ARTICULOS_POR_FECHA } from '../data/articulos';
import { useHydrated } from '../utils/useHydrated';

const DiabolicalChatbot = lazy(() => import('../components/common/DiabolicalChatbot'));

const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const fechaLegible = (iso) => {
    const [anio, mes, dia] = iso.split('-');
    return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${anio}`;
};

/**
 * Índice del blog. El <head> (título, descripción, JSON-LD con Blog y
 * BreadcrumbList) lo resuelve el servidor — ver server/render.js.
 */
const BlogPage = () => {
    const mostrarChatbot = useHydrated();

    return (
        <main className="relative bg-black min-h-screen selection:bg-white selection:text-black font-jakarta overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/[0.03] blur-[180px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[150px] rounded-full" />
            </div>

            <Navbar />

            <section className="relative z-10 pt-32 md:pt-44 pb-12 md:pb-16 px-5 md:px-6">
                <div className="max-w-3xl mx-auto">
                    <nav aria-label="Ruta de navegación" className="mb-8">
                        <ol className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">
                            <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
                            <li aria-hidden="true">/</li>
                            <li className="text-white/60">Blog</li>
                        </ol>
                    </nav>

                    <h1 className="text-3xl md:text-5xl font-title uppercase tracking-tighter leading-[0.92] mb-6">
                        Automatización, sin humo
                    </h1>

                    <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl font-light">
                        Cómo funcionan por dentro las cosas que vendemos: qué se puede automatizar,
                        qué no, y qué hace falta para que un motor de IA recomiende tu negocio.
                        Mecanismos y límites, no promesas.
                    </p>
                </div>
            </section>

            <section className="relative z-10 pb-20 md:pb-28 px-5 md:px-6">
                <div className="max-w-3xl mx-auto space-y-4">
                    {ARTICULOS_POR_FECHA.map((articulo) => (
                        <Link
                            key={articulo.slug}
                            to={`/blog/${articulo.slug}`}
                            className="block glass-card rounded-3xl border-white/5 hover:border-white/15 transition-all group p-7 md:p-9"
                        >
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold mb-4">
                                <time dateTime={articulo.fecha}>{fechaLegible(articulo.fecha)}</time>
                                {articulo.lectura ? (
                                    <>
                                        <span aria-hidden="true">·</span>
                                        <span>{articulo.lectura}</span>
                                    </>
                                ) : null}
                            </div>

                            <h2 className="text-xl md:text-2xl font-title uppercase tracking-tighter leading-[1.05] mb-4 group-hover:text-white transition-colors">
                                {articulo.titular}
                            </h2>

                            <p className="text-white/55 text-sm leading-relaxed font-light mb-5">
                                {articulo.entradilla}
                            </p>

                            <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors font-bold inline-flex items-center gap-2">
                                Leer <ArrowRight size={12} />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <Footer />

            {mostrarChatbot && (
                <Suspense fallback={null}>
                    <DiabolicalChatbot />
                </Suspense>
            )}
        </main>
    );
};

export default BlogPage;
