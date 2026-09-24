import React from 'react';

import { useBloque } from '../../contenido';
import EncabezadoSeccion from '../common/EncabezadoSeccion';
import MotionGrafico from '../../motion/MotionGrafico';
import CtaServicio from '../common/CtaServicio';

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
 *
 * El diagrama es una escena animada (escena «proceso») dibujada con los mismos
 * pasos del contenido: la luz avanza de uno a otro y cada paso queda marcado al
 * pasar al siguiente. Va en una losa negra porque las escenas se dibujan en
 * blanco. Debajo, las tarjetas con el texto de cada paso.
 */
const Proceso = ({ conCta = true }) => {
    const { visible, titulo, entradilla, pasos = [], nota } = useBloque('proceso');

    if (visible === false || pasos.length === 0) return null;

    return (
        <section id="proceso" className="zona-clara seccion-amplia">
            <div className="contenedor">
                <EncabezadoSeccion titulo={titulo} entradilla={entradilla} />

                <div
                    className="zona-oscura mt-14 overflow-hidden px-3 py-4 md:mt-20 md:px-8 md:py-8"
                    style={{ borderRadius: 'var(--radio-losa)' }}
                >
                    <MotionGrafico
                        escena="proceso"
                        datos={{ pasos }}
                        etiqueta={`Diagrama animado del proceso: ${pasos.map((p) => p.titulo).join(', ')}.`}
                    />
                </div>

                <ol className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {pasos.map((paso) => (
                        <li key={paso.id} className="flex flex-col">
                            <div className="tarjeta flex flex-1 flex-col p-6">
                                <p
                                    className="etiqueta-mono"
                                    style={{ color: 'var(--texto-3)' }}
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
                {/* En /contacto el formulario ya está arriba: un botón que lleva a
                    la misma página no lleva a ningún sitio. */}
                {conCta && <CtaServicio ubicacion="proceso" className="mt-12" />}
            </div>
        </section>
    );
};

export default Proceso;
