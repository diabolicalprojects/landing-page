import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { SERVICIOS_POR_CATEGORIA, SERVICIOS } from '../data/servicios';
import { useHydrated } from '../utils/useHydrated';

const DiabolicalChatbot = lazy(() => import('../components/common/DiabolicalChatbot'));

/**
 * Catálogo completo con el detalle y el límite de cada servicio. El <head>
 * (título, descripción y el JSON-LD con Service y BreadcrumbList) lo resuelve
 * el servidor — ver server/schema.js.
 *
 * Todo el texto viaja en el HTML servido, que es la diferencia frente a los
 * dos competidores locales: sus catálogos solo existen después de ejecutar
 * JavaScript, así que un rastreador de motor generativo no los ve.
 */
const ServiciosPage = () => {
    const mostrarChatbot = useHydrated();

    return (
        <main className="relative bg-black min-h-screen text-white font-jakarta overflow-x-hidden">
            <Navbar />

            <section className="pt-32 md:pt-44 pb-12 md:pb-16 px-5 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <nav aria-label="Ruta de navegación" className="mb-8">
                        <ol className="flex items-center gap-2 etiqueta text-white/60">
                            <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
                            <li aria-hidden="true">/</li>
                            <li className="text-white/70">Servicios</li>
                        </ol>
                    </nav>

                    <h1 className="text-4xl md:text-6xl font-title uppercase tracking-tighter leading-[0.92] mb-6">
                        Qué hacemos y dónde nos detenemos
                    </h1>
                    <p className="text-base md:text-lg text-white/60 leading-relaxed font-light max-w-2xl">
                        {SERVICIOS.length} servicios para negocios de Aguascalientes, ordenados por el
                        recorrido que hace un cliente. Cada uno dice qué incluye y qué no, porque
                        lo segundo ahorra más reuniones que lo primero.
                    </p>
                </div>
            </section>

            {SERVICIOS_POR_CATEGORIA.map((grupo, i) => (
                <section
                    key={grupo.categoria}
                    className={`seccion px-5 md:px-8 ${i % 2 === 0 ? 'superficie-1' : 'bg-black'}`}
                >
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter leading-tight mb-10 md:mb-12">
                            {grupo.categoria}
                        </h2>

                        <div className="space-y-10 md:space-y-12">
                            {grupo.servicios.map((servicio) => (
                                <article key={servicio.slug} id={servicio.slug} className="scroll-mt-28">
                                    <h3 className="text-xl md:text-2xl font-title uppercase tracking-tight text-white leading-tight mb-3">
                                        {servicio.nombre}
                                    </h3>
                                    <p className="text-base text-white/75 leading-relaxed mb-3 max-w-2xl">
                                        {servicio.resumen}
                                    </p>
                                    <p className="text-sm md:text-[15px] text-white/60 leading-relaxed font-light mb-4 max-w-2xl">
                                        {servicio.detalle}
                                    </p>
                                    <p className="text-sm text-white/55 leading-relaxed max-w-2xl border-l-2 border-white/15 pl-4">
                                        <span className="text-white/75 font-semibold">Dónde se detiene: </span>
                                        {servicio.limite}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            <section className="seccion-amplia px-5 md:px-8 superficie-2">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter leading-[0.95] mb-5">
                        No hace falta contratarlo todo
                    </h2>
                    <p className="text-white/60 text-base leading-relaxed font-light mb-8 max-w-2xl">
                        La auditoría de fricción dice cuáles de estos servicios te hacen falta hoy y
                        cuáles no valen la pena todavía. Es gratuita y el diagnóstico es tuyo,
                        trabajes o no con nosotros.
                    </p>
                    <button
                        onClick={() => window.dispatchEvent(new Event('open-diabolical-chat'))}
                        className="accion px-9 py-4 bg-white text-black rounded-full font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-white/85 min-h-[56px]"
                    >
                        Pedir el diagnóstico gratuito
                    </button>
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

export default ServiciosPage;
