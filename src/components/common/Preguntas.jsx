import React, { useId, useState } from 'react';
import { Plus } from 'lucide-react';

/**
 * Acordeón de preguntas que funciona en cualquier zona: los colores salen de
 * los tokens de inversión de la zona, no de papel y tinta fijos. Las respuestas
 * cerradas siguen en el HTML (atributo hidden), que es lo que leen los
 * rastreadores y lo que exige el FAQPage.
 *
 * Lo usan las landings de servicio y los artículos del blog. Recibe
 * `{ pregunta, respuesta }`; los artículos guardan `{ q, a }` y los adaptan al
 * llamarlo.
 */
const Preguntas = ({ items = [], nivel = 'h3' }) => {
    const [abierta, setAbierta] = useState(null);
    const idBase = useId();
    const Titulo = nivel;

    return (
        <ul className="space-y-2.5">
            {items.map((item, i) => {
                const estaAbierta = abierta === i;
                const idPanel = `${idBase}-p-${i}`;
                const idBoton = `${idBase}-b-${i}`;
                return (
                    <li key={item.pregunta} className="tarjeta overflow-hidden">
                        <Titulo>
                            <button
                                type="button"
                                id={idBoton}
                                aria-expanded={estaAbierta}
                                aria-controls={idPanel}
                                onClick={() => setAbierta(estaAbierta ? null : i)}
                                className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left md:px-7"
                            >
                                <span className="text-[1rem] font-bold leading-snug tracking-tight">
                                    {item.pregunta}
                                </span>
                                <span
                                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                                    style={{
                                        background: estaAbierta ? 'var(--inverso-fondo)' : 'var(--tarjeta-alta)',
                                        color: estaAbierta ? 'var(--inverso-texto)' : 'var(--texto-1)',
                                        transform: estaAbierta ? 'rotate(45deg)' : 'none',
                                    }}
                                    aria-hidden="true"
                                >
                                    <Plus size={16} />
                                </span>
                            </button>
                        </Titulo>
                        <div id={idPanel} role="region" aria-labelledby={idBoton} hidden={!estaAbierta}>
                            <p
                                className="cuerpo max-w-none px-5 pb-6 md:px-7"
                                style={{ borderTop: '1px solid var(--linea)', paddingTop: '1.25rem' }}
                            >
                                {item.respuesta}
                            </p>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default Preguntas;
