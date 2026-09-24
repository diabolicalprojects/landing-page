import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { useBloque } from '../../contenido';
import EncabezadoSeccion from '../common/EncabezadoSeccion';
import Enlace from '../common/Enlace';
import { ESCENAS } from './Mockups';

/*
 * Los tres frentes.
 *
 * La composición no es de tres tarjetas iguales: la primera ocupa el ancho
 * entero con la escena a un lado, y las otras dos van debajo a mitad de ancho.
 * Tres cajas idénticas en fila dicen «estos tres pesan lo mismo», y no es
 * verdad — el sitio web es la puerta de entrada de todo lo demás.
 */
const Pilares = () => {
    const { visible, insignia, titulo, entradilla, items = [] } = useBloque('pilares');

    if (visible === false || items.length === 0) return null;

    const [principal, ...resto] = items;
    const EscenaPrincipal = ESCENAS[principal.icono];

    return (
        <section id="pilares" className="zona-oscura seccion">
            <div className="contenedor">
                <EncabezadoSeccion
                    id="pilares"
                    insignia={insignia}
                    titulo={titulo}
                    entradilla={entradilla}
                />

                <div className="mt-12 grid grid-cols-1 gap-4 md:mt-16">
                    <article className="tarjeta tarjeta-enlace grid grid-cols-1 gap-8 overflow-hidden p-6 md:grid-cols-2 md:items-center md:p-9">
                        <div>
                            <h3 className="titular-m">{principal.titulo}</h3>
                            <p className="cuerpo mt-4">{principal.texto}</p>
                            <p className="mt-4 text-sm leading-relaxed text-white/50">
                                {principal.detalle}
                            </p>
                            <Enlace
                                destino={principal.destino}
                                className="enlace mt-6 inline-flex min-h-[1.75rem] items-center gap-1.5 py-1 text-sm font-bold"
                            >
                                Ver qué incluye
                                <ArrowUpRight size={15} aria-hidden="true" />
                            </Enlace>
                        </div>
                        {EscenaPrincipal && (
                            <div className="md:pl-4">
                                <EscenaPrincipal />
                            </div>
                        )}
                    </article>

                    <div className="grid gap-4 md:grid-cols-2">
                        {resto.map((item) => {
                            const Escena = ESCENAS[item.icono];
                            return (
                                <article
                                    key={item.id}
                                    className="tarjeta tarjeta-enlace flex flex-col p-6 md:p-8"
                                >
                                    {Escena && (
                                        <div className="mb-7">
                                            <Escena />
                                        </div>
                                    )}
                                    <h3 className="titular-m">{item.titulo}</h3>
                                    <p className="cuerpo mt-4">{item.texto}</p>
                                    <p className="mt-4 text-sm leading-relaxed text-white/50">
                                        {item.detalle}
                                    </p>
                                    <Enlace
                                        destino={item.destino}
                                        className="enlace mt-6 inline-flex min-h-[1.75rem] items-center gap-1.5 self-start py-1 text-sm font-bold"
                                    >
                                        Ver qué incluye
                                        <ArrowUpRight size={15} aria-hidden="true" />
                                    </Enlace>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pilares;
