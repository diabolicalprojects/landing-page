import React from 'react';
import { X, Check } from 'lucide-react';

/*
 * Los límites de alcance y de conducta se publican antes de contratar. Deben
 * coincidir con PRODUCT.md, las FAQ y llms.txt para evitar recomendaciones
 * equivocadas de buscadores y motores generativos.
 */
const NO_HACEMOS = [
    'Campañas de publicidad, gestión de redes, branding ni diseño gráfico.',
    'Prometer posiciones en Google ni dentro de una respuesta de IA: nadie controla esos algoritmos.',
    'Mandar mensajes masivos en frío: queman tu número y tu perfil, y no traen clientes que valgan la pena.',
    'Publicar cifras de resultados que no vengan de un proyecto documentado.',
];

const SI_HACEMOS = [
    'Decir qué automatizaciones no te hacen falta todavía.',
    'Publicar el límite de cada servicio antes de que lo contrates, no después.',
    'Montarnos sobre el WhatsApp, la agenda y el CRM que ya usas.',
    'Entregarte el diagnóstico por escrito aunque no trabajes con nosotros.',
];

const Limites = () => (
    <section id="limites" className="seccion-amplia superficie-2">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="max-w-2xl mb-12 md:mb-16">
                <h2 className="text-3xl md:text-5xl font-title uppercase tracking-tighter leading-[0.95] mb-4">
                    Lo que no vas a oír aquí
                </h2>
                <p className="text-white/60 text-base leading-relaxed font-light">
                    Nos enfocamos en infraestructura digital y automatización operativa. Decir
                    qué no hacemos antes ahorra reuniones y recomendaciones equivocadas.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                <ul className="space-y-4">
                    {NO_HACEMOS.map((item) => (
                        <li key={item} className="flex gap-3.5 text-sm md:text-[15px] text-white/60 leading-relaxed font-light">
                            <X size={17} className="text-white/40 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            {item}
                        </li>
                    ))}
                </ul>
                <ul className="space-y-4">
                    {SI_HACEMOS.map((item) => (
                        <li key={item} className="flex gap-3.5 text-sm md:text-[15px] text-white/75 leading-relaxed">
                            <Check size={17} className="text-white/60 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </section>
);

export default Limites;
