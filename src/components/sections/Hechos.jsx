import React from 'react';

/*
 * Donde la convención pone la barra de logos de clientes, aquí van hechos
 * verificables. No hay clientes publicables (ver PRODUCT.md: sin prueba
 * social real, no se inventa), pero estos cuatro hechos son comprobables y
 * responden a las cuatro dudas que frenan la compra: ¿es formal?, ¿cuánto
 * tarda?, ¿me obligan a cambiar de herramientas?, ¿qué arriesgo?
 */
const HECHOS = [
    { dato: '17 servicios', detalle: 'En las cinco etapas del ciclo, y cada uno publica dónde se detiene.' },
    { dato: 'Todo medido', detalle: 'Un tablero con datos reales, no capturas de pantalla en un PDF.' },
    { dato: 'Sobre tus herramientas', detalle: 'Tu web, tu agenda, tu CRM y tu WhatsApp. No te hacemos cambiar de sistema.' },
    { dato: 'Diagnóstico por escrito', detalle: 'La auditoría es gratuita y el documento es tuyo, trabajes o no con nosotros.' },
];

const Hechos = () => (
    <section aria-label="Hechos verificables" className="seccion-compacta bg-black border-y border-white/10">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                {HECHOS.map((h) => (
                    <div key={h.dato}>
                        <dt className="text-base md:text-lg font-title uppercase tracking-tight text-white leading-tight mb-1.5">
                            {h.dato}
                        </dt>
                        <dd className="text-sm text-white/55 leading-relaxed font-light">{h.detalle}</dd>
                    </div>
                ))}
            </dl>
        </div>
    </section>
);

export default Hechos;
