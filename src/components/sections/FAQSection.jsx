import React, { useId, useState } from 'react';
import { Plus } from 'lucide-react';

import faqs from '../../data/faq.json';
import { useBloque } from '../../contenido';
import EncabezadoSeccion from '../common/EncabezadoSeccion';

/*
 * Preguntas frecuentes. Segunda inversión a claro.
 *
 * Las preguntas salen de src/data/faq.json, el mismo fichero del que
 * server/schema.js construye el FAQPage. Google exige que lo marcado en el
 * schema sea exactamente lo que ve el visitante: dos listas separadas
 * acabarían divergiendo y el marcado pasaría a ser infractor.
 *
 * Las respuestas están SIEMPRE en el DOM, solo ocultas con hidden. Montarlas al
 * abrir dejaría la mitad del texto citable de la página fuera del HTML servido,
 * que es justo la ventaja que este sitio tiene sobre la competencia local.
 */
const FAQSection = () => {
    const [abierta, setAbierta] = useState(null);
    const idBase = useId();

    const { visible, insignia, titulo } = useBloque('faq');

    if (visible === false) return null;

    return (
        <section id="faq" className="zona-clara seccion-amplia">
            <div className="contenedor">
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-4">
                        <EncabezadoSeccion id="faq" insignia={insignia} titulo={titulo} />
                    </div>

                    <div className="lg:col-span-8">
                        <ul className="space-y-2.5">
                            {faqs.map((faq, i) => {
                                const estaAbierta = abierta === i;
                                const idPanel = `${idBase}-panel-${i}`;
                                const idBoton = `${idBase}-boton-${i}`;

                                return (
                                    <li key={faq.pregunta} className="tarjeta overflow-hidden">
                                        <h3>
                                            <button
                                                type="button"
                                                id={idBoton}
                                                aria-expanded={estaAbierta}
                                                aria-controls={idPanel}
                                                onClick={() => setAbierta(estaAbierta ? null : i)}
                                                className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left md:px-7 md:py-6"
                                            >
                                                <span className="text-[1rem] font-bold leading-snug tracking-tight md:text-[1.0625rem]">
                                                    {faq.pregunta}
                                                </span>
                                                <span
                                                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                                                    style={{
                                                        background: estaAbierta
                                                            ? 'var(--acento-claro)'
                                                            : 'var(--papel-2)',
                                                        color: estaAbierta
                                                            ? '#ffffff'
                                                            : 'var(--texto-1)',
                                                        transform: estaAbierta
                                                            ? 'rotate(45deg)'
                                                            : 'none',
                                                    }}
                                                    aria-hidden="true"
                                                >
                                                    <Plus size={16} />
                                                </span>
                                            </button>
                                        </h3>

                                        <div
                                            id={idPanel}
                                            role="region"
                                            aria-labelledby={idBoton}
                                            hidden={!estaAbierta}
                                        >
                                            <p
                                                className="cuerpo max-w-none px-5 pb-6 md:px-7 md:pb-7"
                                                style={{ borderTop: '1px solid var(--linea)', paddingTop: '1.25rem' }}
                                            >
                                                {faq.respuesta}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
