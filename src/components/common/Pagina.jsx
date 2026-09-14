import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import Navbar from './Navbar';
import Footer from './Footer';
import { useHydrated } from '../../utils/useHydrated';

const DiabolicalChatbot = lazy(() => import('./DiabolicalChatbot'));

/*
 * Envoltorio de todas las páginas.
 *
 * Al pasar de una landing a un sitio de varias páginas, cada ruta repetía
 * navegación, pie y chatbot. Con siete páginas eso son siete sitios donde
 * olvidarse de algo; aquí es uno.
 */
const Pagina = ({ children }) => {
    const mostrarChatbot = useHydrated();

    return (
        <div className="font-jakarta relative min-h-screen overflow-x-hidden bg-black text-white">
            <Navbar />
            <main id="contenido">{children}</main>
            <Footer />

            {mostrarChatbot && (
                <Suspense fallback={null}>
                    <DiabolicalChatbot />
                </Suspense>
            )}
        </div>
    );
};

/**
 * Migas de pan.
 *
 * En un sitio de varias páginas no son decoración: le dicen a quien llega desde
 * un buscador dónde ha caído, y son lo que Google usa para dibujar la ruta
 * debajo del resultado. El JSON-LD equivalente lo emite server/schema.js, y las
 * dos listas tienen que contar lo mismo.
 */
export const Migas = ({ ruta = [] }) => (
    <nav aria-label="Migas de pan" className="contenedor pt-28 md:pt-32">
        <ol className="flex flex-wrap items-center gap-1.5 text-[0.9375rem]">
            <li>
                <Link to="/" className="inline-flex min-h-[1.75rem] items-center py-1 text-white/50 transition-colors hover:text-white">
                    Inicio
                </Link>
            </li>
            {ruta.map((paso, i) => {
                const ultimo = i === ruta.length - 1;
                return (
                    <li key={paso.destino ?? paso.texto} className="flex items-center gap-1.5">
                        <ChevronRight size={13} className="text-white/25" aria-hidden="true" />
                        {ultimo || !paso.destino ? (
                            <span className="text-white/80" aria-current="page">
                                {paso.texto}
                            </span>
                        ) : (
                            <Link
                                to={paso.destino}
                                className="inline-flex min-h-[1.75rem] items-center py-1 text-white/50 transition-colors hover:text-white"
                            >
                                {paso.texto}
                            </Link>
                        )}
                    </li>
                );
            })}
        </ol>
    </nav>
);

export default Pagina;
