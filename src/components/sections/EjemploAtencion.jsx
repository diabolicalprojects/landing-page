import React from 'react';
import ChatDemo from './ChatDemo';

/*
 * Un ejemplo concreto de una de las cinco etapas: la atención.
 *
 * Estaba en el hero, donde definía a la agencia entera como "los del chatbot".
 * Aquí ilustra una capacidad dentro de su contexto, que es lo que sabe hacer:
 * es la única demostración real que existe hoy, y enseñar vale más que
 * describir. La conversación va en HTML plano, así que también la leen los
 * rastreadores que no ejecutan JavaScript.
 */
const EjemploAtencion = () => (
    <section id="ejemplo" className="seccion superficie-1">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
                <div className="max-w-xl">
                    <p className="etiqueta text-white/60 mb-4">Etapa 3 · Atención y venta</p>
                    <h2 className="text-3xl md:text-5xl font-title uppercase tracking-tighter leading-[0.95] mb-5">
                        Así se ve una etapa funcionando
                    </h2>
                    <p className="text-white/60 text-base leading-relaxed font-light mb-4">
                        De poco sirve posicionar y anunciar si el mensaje de las nueve de la noche
                        se queda sin contestar hasta mañana. Esta es la etapa con la que empezó la
                        casa, y la que más rápido se nota.
                    </p>
                    <p className="text-white/60 text-base leading-relaxed font-light">
                        Las otras cuatro se ven igual de concretas en el diagnóstico: qué está
                        pasando hoy en tu negocio, con evidencia.
                    </p>
                </div>

                <div className="flex lg:justify-end">
                    <ChatDemo />
                </div>
            </div>
        </div>
    </section>
);

export default EjemploAtencion;
