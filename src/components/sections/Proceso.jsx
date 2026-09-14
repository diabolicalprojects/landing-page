import React from 'react';

import { useBloque } from '../../contenido';
import EncabezadoSeccion from '../common/EncabezadoSeccion';

/*
 * Cómo trabajamos. Primera inversión a claro.
 *
 * El corte no es decorativo: la página lleva cuatro secciones de negro y aquí
 * cambia de tema —de qué vendemos a cómo se hace—, así que el fondo cambia con
 * el tema. Es el respiro que hace que lo siguiente vuelva a leerse.
 *
 * Los pasos van numerados porque aquí el orden SÍ es información: cada uno
 * depende del anterior y lleva su plazo. Numerar tarjetas que no son una
 * secuencia es lo que hay que evitar; esto es una secuencia.
 */
const Proceso = () => {
    const { visible, insignia, titulo, entradilla, pasos = [], nota } = useBloque('proceso');

    if (visible === false || pasos.length === 0) return null;

    return (
        <section id="proceso" className="zona-clara seccion-amplia">
            <div className="contenedor">
                <EncabezadoSeccion
                    id="proceso"
                    insignia={insignia}
                    titulo={titulo}
                    entradilla={entradilla}
                />

                <ol className="relative mt-14 grid gap-4 md:mt-20 md:grid-cols-2 lg:grid-cols-4">
                    {/* La línea que une los pasos. Solo en escritorio, donde la
                        secuencia se lee en horizontal; apilados en móvil, el
                        propio orden vertical ya la cuenta. */}
                    <span
                        className="absolute left-0 right-0 top-7 hidden h-px lg:block"
                        style={{ background: 'var(--linea)' }}
                        aria-hidden="true"
                    />

                    {pasos.map((paso, indice) => (
                        <li key={paso.id} className="relative flex flex-col">
                            <span
                                className="cifras relative z-10 flex h-14 w-14 flex-none items-center justify-center rounded-full text-lg font-extrabold"
                                style={{
                                    background: indice === 0 ? 'var(--acento)' : 'var(--tarjeta)',
                                    color: indice === 0 ? 'var(--acento-tinta)' : 'var(--texto-1)',
                                    border: `1px solid ${indice === 0 ? 'transparent' : 'var(--linea)'}`,
                                    boxShadow: 'var(--sombra-tarjeta)',
                                }}
                            >
                                {indice + 1}
                            </span>

                            <div className="tarjeta mt-5 flex flex-1 flex-col p-6">
                                <p
                                    className="etiqueta-mono"
                                    style={{ color: 'var(--acento-claro)' }}
                                >
                                    {paso.duracion}
                                </p>
                                <h3 className="mt-3 text-lg font-extrabold tracking-tight">
                                    {paso.titulo}
                                </h3>
                                <p className="cuerpo mt-3">{paso.texto}</p>
                            </div>
                        </li>
                    ))}
                </ol>

                {nota && (
                    <div className="tarjeta mt-10 flex flex-col gap-3 p-6 md:flex-row md:items-baseline md:gap-8 md:p-8">
                        <p
                            className="etiqueta flex-none"
                            style={{ color: 'var(--acento-claro)' }}
                        >
                            Precio
                        </p>
                        <p className="cuerpo max-w-3xl">{nota}</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Proceso;
