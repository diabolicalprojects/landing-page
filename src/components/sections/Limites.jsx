import React from 'react';
import { X, Check } from 'lucide-react';

/*
 * La sección que ningún competidor tiene: lo que NO hacemos, en la portada y
 * a tamaño de sección, no escondido en un llms.txt. Filtra a quien no encaja
 * antes de que escriba, y es exactamente lo que un motor generativo necesita
 * para no recomendarnos mal — la recomendación equivocada es la que quema.
 *
 * El texto coincide con los límites publicados en llms.txt y PRODUCT.md: si
 * cambia aquí, cambia allí.
 */
const NO_HACEMOS = [
    'Campañas de publicidad ni gestión de redes sociales.',
    'Diseño gráfico ni consultoría de marketing.',
    'El sistema no da consejo médico, legal ni fiscal: deriva a una persona.',
    'No sustituimos a tu equipo: el cierre y la atención compleja siguen siendo humanos.',
];

const SI_HACEMOS = [
    'Primera respuesta, agendamiento, confirmación y seguimiento: infraestructura.',
    'Montado sobre el WhatsApp, la agenda y el CRM que ya usas.',
    'Con la API oficial de Meta, número verificado y plantillas aprobadas.',
    'Con límites pactados por escrito antes de encender nada.',
];

const Limites = () => (
    <section id="limites" className="seccion-amplia superficie-2">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="max-w-2xl mb-12 md:mb-16">
                <h2 className="text-3xl md:text-5xl font-title uppercase tracking-tighter leading-[0.95] mb-4">
                    Lo que no hacemos
                </h2>
                <p className="text-white/55 text-base leading-relaxed font-light">
                    Decirlo de frente ahorra reuniones a los dos. Si tu problema es que no te
                    llegan clientes, esto no es lo tuyo: la automatización multiplica un flujo
                    que ya existe, no lo crea.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                <ul className="space-y-4">
                    {NO_HACEMOS.map((item) => (
                        <li key={item} className="flex gap-3.5 text-sm md:text-[15px] text-white/60 leading-relaxed font-light">
                            <X size={17} className="text-white/35 flex-shrink-0 mt-0.5" aria-hidden="true" />
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
