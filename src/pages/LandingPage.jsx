import React, { Suspense, lazy } from 'react';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useHydrated } from '../utils/useHydrated';

// La portada se prerenderiza entera: todo directo, nada de lazy() en las
// secciones — un boundary sin resolver haría que React descartara el HTML
// del servidor (error #419).
import Hero from '../components/sections/Hero';
import Hechos from '../components/sections/Hechos';
import Modulos from '../components/sections/Modulos';
import Mecanismo from '../components/sections/Mecanismo';
import Sectores from '../components/sections/Sectores';
import Limites from '../components/sections/Limites';
import Comparativa from '../components/sections/Comparativa';
import FAQSection from '../components/sections/FAQSection';
import Contact from '../components/sections/Contact';

const DiabolicalChatbot = lazy(() => import('../components/common/DiabolicalChatbot'));

/*
 * Portada. El orden es la narrativa:
 *
 *   Hero        la oferta y el mecanismo demostrándose (ChatDemo)
 *   Hechos      lo verificable, donde la convención pone logos que no tenemos
 *   Modulos     qué se instala, con el límite de cada pieza
 *   Mecanismo   cómo y en cuánto tiempo, con lo que cuesta al cliente
 *   Sectores    entradas a las páginas por giro (el activo SEO)
 *   Limites     lo que NO hacemos — el diferencial de la casa
 *   Comparativa la semana del dueño, antes y después
 *   FAQ         responde lo que queda (alimenta el schema FAQPage)
 *   Contact     el embudo: formulario → n8n → WhatsApp (intocable)
 */
const LandingPage = () => {
    const mostrarChatbot = useHydrated();

    return (
        <main className="relative bg-black min-h-screen text-white font-jakarta overflow-x-hidden">
            <Navbar />
            <Hero />
            <Hechos />
            <Modulos />
            <Mecanismo />
            <Sectores />
            <Limites />
            <Comparativa />
            <FAQSection />
            <Contact />
            <Footer />

            {mostrarChatbot && (
                <Suspense fallback={null}>
                    <DiabolicalChatbot />
                </Suspense>
            )}
        </main>
    );
};

export default LandingPage;
