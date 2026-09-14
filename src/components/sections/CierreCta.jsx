import React from 'react';
import { ArrowRight } from 'lucide-react';

import { useBloque } from '../../contenido';
import Enlace from '../common/Enlace';
import logoCuadrado from '../../assets/logo/LOGO-DIABOLICAL-CUADRADO-BLANCO.svg';

/*
 * El cierre.
 *
 * Una tarjeta negra incrustada en la zona clara: es el contraste más alto de
 * toda la página y cae justo donde hay que decidir. Después de esto solo queda
 * el formulario, así que aquí es donde la página tiene que estar más fuerte.
 *
 * Una sola acción. La alternativa por WhatsApp va como enlace de texto y no
 * como segundo botón: dos botones del mismo peso reparten la atención en el
 * momento en que menos conviene repartirla.
 */
const CierreCta = () => {
    const { visible, titulo, texto, boton, alternativa } = useBloque('cta');

    if (visible === false) return null;

    return (
        <section className="zona-clara pb-20 pt-4 md:pb-28">
            <div className="contenedor">
                <div
                    className="zona-oscura relative overflow-hidden px-6 py-16 text-center md:px-16 md:py-24"
                    style={{ borderRadius: 'calc(var(--radio) * 1.6)' }}
                >
                    <div className="rejilla" aria-hidden="true" />
                    <div
                        className="resplandor left-1/2 top-[-8rem] h-[22rem] w-[34rem] -translate-x-1/2"
                        aria-hidden="true"
                    />

                    <div className="relative mx-auto max-w-2xl">
                        <img
                            src={logoCuadrado}
                            alt=""
                            width="48"
                            height="48"
                            className="mx-auto mb-8 w-12 opacity-90"
                        />

                        <h2 className="titular-l">{titulo}</h2>

                        <p className="cuerpo-l mx-auto mt-6 text-center">{texto}</p>

                        <Enlace
                            destino={boton?.destino}
                            className="boton boton-acento mt-10 inline-flex"
                        >
                            {boton?.texto}
                            <ArrowRight size={16} aria-hidden="true" />
                        </Enlace>

                        {alternativa?.texto && (
                            <p className="mt-6">
                                <Enlace
                                    destino={alternativa.destino}
                                    className="enlace inline-flex min-h-[1.75rem] items-center py-1 text-sm text-white/60"
                                >
                                    {alternativa.texto}
                                </Enlace>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CierreCta;
