import React, { Suspense, lazy } from 'react';

import { useHydrated } from '../utils/useHydrated';

// Common components
import CustomCursor from '../components/common/CustomCursor';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const DiabolicalChatbot = lazy(() => import('../components/common/DiabolicalChatbot'));

// Section components
import Hero from '../components/sections/Hero';
import Problem from '../components/sections/Problem';
import SolutionCards from '../components/sections/SolutionCards';
import Sectores from '../components/sections/Sectores';
import Proceso from '../components/sections/Proceso';
import ComparisonSection from '../components/sections/ComparisonSection';
import BoldHook from '../components/sections/BoldHook';
import SuccessStories from '../components/sections/SuccessStories';
import FAQSection from '../components/sections/FAQSection';
import Contact from '../components/sections/Contact';

// El <head> (título, descripción, JSON-LD) lo resuelve el servidor antes de
// enviar el HTML — ver server/render.js. La página no lo toca: reescribirlo
// desde React solo conseguía pisar los valores buenos con placeholders.
const LandingPage = () => {
    // El chatbot se monta después de hidratar. Renderizarlo dentro de un
    // <Suspense> durante el prerender dejaba el boundary sin resolver y React
    // descartaba todo el HTML del servidor para volver a renderizar en cliente
    // (error #419). Además evita cargar su chunk en la primera pintura.
    const showChatbot = useHydrated();

    return (
        <main className="relative bg-black min-h-screen selection:bg-white selection:text-black font-jakarta overflow-x-hidden">
            <CustomCursor />
            {/* Soft Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/[0.03] blur-[180px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[150px] rounded-full" />
            </div>

            <Navbar />
            <Hero />

            <Problem />
            <SolutionCards />
            <Sectores />
            <SuccessStories />
            <ComparisonSection />
            <BoldHook />
            <Proceso />
            <FAQSection />
            <Contact />
            <Footer />
            {showChatbot && (
                <Suspense fallback={null}>
                    <DiabolicalChatbot />
                </Suspense>
            )}
        </main>
    );
};

export default LandingPage;
