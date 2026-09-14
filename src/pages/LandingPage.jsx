import React, { Suspense, lazy } from 'react';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useHydrated } from '../utils/useHydrated';

// Nada de lazy() en las secciones: la portada se renderiza entera en el
// servidor, y un boundary sin resolver haría que React descartara ese HTML al
// hidratar (error #419) y volviera a montarlo todo en cliente.
import Hero from '../components/sections/Hero';
import Stack from '../components/sections/Stack';
import Pilares from '../components/sections/Pilares';
import Verticales from '../components/sections/Verticales';
import Proceso from '../components/sections/Proceso';
import EjemploAtencion from '../components/sections/EjemploAtencion';
import Servicios from '../components/sections/Servicios';
import Comparativa from '../components/sections/Comparativa';
import Limites from '../components/sections/Limites';
import FAQSection from '../components/sections/FAQSection';
import CierreCta from '../components/sections/CierreCta';
import Contact from '../components/sections/Contact';

const DiabolicalChatbot = lazy(() => import('../components/common/DiabolicalChatbot'));

/*
 * Portada.
 *
 * El orden es la narrativa, y el fondo es el ritmo. Diez secciones del mismo
 * negro se leen como una sola masa plana, así que la página invierte a claro
 * tres veces, y siempre donde cambia el tema de conversación:
 *
 *   Hero          negro      la frase y la prueba: el sistema a las 2:14
 *   Stack         negro·1    sobre qué se monta, sin cambiarte de herramientas
 *   Pilares       negro      los tres frentes, cada uno con su escena
 *   Verticales    negro·1    tu giro, por la escena en la que pierdes al cliente
 *   Proceso       CLARO      cómo se hace y en cuánto  ← cambia el tema
 *   Ejemplo       negro      el mecanismo funcionando en un teléfono
 *   Servicios     negro·1    el catálogo, cada uno con su alcance
 *   Comparativa   CLARO      tu semana, antes y después  ← cambia el tema
 *   Limites       negro      lo que no hacemos, por escrito
 *   FAQ           CLARO      lo que queda por preguntar  ← cambia el tema
 *   Cierre        CLARO      la tarjeta negra incrustada: el contraste máximo
 *   Contacto      negro      el embudo a n8n y WhatsApp (intocable)
 */
const LandingPage = () => {
    const mostrarChatbot = useHydrated();

    return (
        <main className="font-jakarta relative min-h-screen overflow-x-hidden bg-black text-white">
            <Navbar />
            <Hero />
            <Stack />
            <Pilares />
            <Verticales />
            <Proceso />
            <EjemploAtencion />
            <Servicios />
            <Comparativa />
            <Limites />
            <FAQSection />
            <CierreCta />
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
