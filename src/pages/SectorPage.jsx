import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X } from 'lucide-react';

import CustomCursor from '../components/common/CustomCursor';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { getSector, SECTORES } from '../data/sectores';
import { useHydrated } from '../utils/useHydrated';

const DiabolicalChatbot = lazy(() => import('../components/common/DiabolicalChatbot'));

const abrirChat = () => window.dispatchEvent(new Event('open-diabolical-chat'));

/**
 * Página por sector. El <head> (título, descripción, JSON-LD con Service,
 * FAQPage y BreadcrumbList) lo resuelve el servidor — ver server/render.js.
 */
const SectorPage = ({ slug }) => {
    const sector = getSector(slug);
    const mostrarChatbot = useHydrated();

    // App.jsx solo monta este componente con slugs que existen, así que llegar
    // aquí sin sector significaría que sectores.json y las rutas se
    // desincronizaron.
    if (!sector) return null;

    return (
        <main className="relative bg-black min-h-screen selection:bg-white selection:text-black font-jakarta overflow-x-hidden">
            <CustomCursor />
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/[0.03] blur-[180px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[150px] rounded-full" />
            </div>

            <Navbar />

            {/* Encabezado */}
            <section className="relative z-10 pt-32 md:pt-44 pb-14 md:pb-20 px-5 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <nav aria-label="Ruta de navegación" className="mb-8">
                        <ol className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">
                            <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
                            <li aria-hidden="true">/</li>
                            <li className="text-white/60">{sector.nombreCorto}</li>
                        </ol>
                    </nav>

                    <div className="inline-block px-3 py-1 bg-white/5 rounded-full mb-5">
                        <span className="text-[8px] uppercase tracking-[0.4em] text-white/60 font-black">
                            {sector.nombre} · Aguascalientes
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-title uppercase tracking-tighter leading-[0.92] mb-6">
                        {sector.titular}
                    </h1>

                    <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl font-light">
                        {sector.entradilla}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 mt-10">
                        <button
                            onClick={abrirChat}
                            className="px-8 py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all min-h-[56px]"
                        >
                            Solicitar auditoría gratuita
                        </button>
                        <Link
                            to="/#contact"
                            className="px-8 py-4 glass rounded-full font-black text-[10px] uppercase tracking-[0.3em] text-white/70 hover:text-white hover:bg-white/5 transition-all min-h-[56px] flex items-center justify-center gap-2"
                        >
                            Ver el cuestionario <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Dolores del sector */}
            <section className="relative z-10 py-14 md:py-20 px-5 md:px-6 border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-title uppercase tracking-tighter mb-3">
                        Lo que está pasando hoy
                    </h2>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold mb-10">
                        Fricción típica del sector
                    </p>

                    <ul className="space-y-4">
                        {sector.dolores.map((dolor, i) => (
                            <li key={i} className="flex gap-4 items-start">
                                <X size={16} className="text-white/25 mt-1 flex-shrink-0" aria-hidden="true" />
                                <span className="text-white/60 text-sm md:text-base leading-relaxed font-light">{dolor}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Soluciones */}
            <section className="relative z-10 py-14 md:py-24 px-5 md:px-6 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-title uppercase tracking-tighter mb-3">
                        Lo que instalamos
                    </h2>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold mb-12">
                        Sistemas autónomos conectados a lo que ya usas
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {sector.soluciones.map((s, i) => (
                            <div key={i} className="glass-card p-7 md:p-8 rounded-3xl border-white/5 hover:border-white/15 transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <Check size={15} className="text-white flex-shrink-0" aria-hidden="true" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white leading-snug">
                                        {s.titulo}
                                    </h3>
                                </div>
                                <p className="text-white/50 text-sm leading-relaxed font-light">{s.detalle}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Preguntas frecuentes del sector */}
            <section className="relative z-10 py-14 md:py-24 px-5 md:px-6 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-title uppercase tracking-tighter mb-3">
                        Preguntas frecuentes
                    </h2>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold mb-10">
                        {sector.nombreCorto}
                    </p>

                    <div className="space-y-3">
                        {sector.faq.map((item, i) => (
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
                        ¿Tu {sector.nombreCorto.toLowerCase()} es candidato?
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

            {/* Enlaces cruzados entre sectores: reparten autoridad entre las
                páginas y evitan que cada una quede aislada del resto. */}
            <section className="relative z-10 py-12 md:py-16 px-5 md:px-6 border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-black mb-6">
                        Otros sectores
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {SECTORES.filter((s) => s.slug !== sector.slug).map((otro) => (
                            <Link
                                key={otro.slug}
                                to={`/automatizacion-para-${otro.slug}`}
                                className="px-5 py-3 glass rounded-full text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
                            >
                                {otro.nombre}
                            </Link>
                        ))}
                    </div>
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

export default SectorPage;
