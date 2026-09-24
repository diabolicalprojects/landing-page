import React from 'react';

import { useBloque } from '../../contenido';
import EncabezadoSeccion from '../common/EncabezadoSeccion';
import CtaServicio from '../common/CtaServicio';
import ChatDemo from './ChatDemo';

/*
 * La muestra.
 *
 * Es lo único que este producto puede demostrar sin inventar nada: no afirma un
 * resultado, enseña el flujo. Va dentro de un marco de teléfono porque así es
 * como el cliente lo va a vivir de verdad, y porque una conversación flotando
 * en el vacío se lee como una captura pegada.
 *
 * Al lado, lo que hace el sistema en esos cuatro mensajes, desglosado. El
 * teléfono enseña el QUÉ; la columna explica el CÓMO sin obligar a deducirlo.
 */
const PASOS = [
    {
        titulo: 'Contesta en segundos',
        texto: 'A cualquier hora, sin que nadie tenga el teléfono en la mano.',
    },
    {
        titulo: 'Consulta la agenda real',
        texto: 'Ofrece huecos que existen de verdad, no una promesa de «le confirmamos más tarde».',
    },
    {
        titulo: 'Cierra y registra',
        texto: 'Agenda, deja el recordatorio programado y anota el prospecto donde lo vea su equipo.',
    },
    {
        titulo: 'Sabe cuándo parar',
        texto: 'En cuanto la conversación pide criterio humano, la pasa a una persona.',
    },
];

const EjemploAtencion = () => {
    const { visible, titulo, entradilla, nota } = useBloque('demo');

    if (visible === false) return null;

    return (
        <section id="demo" className="zona-oscura seccion">
            <div className="contenedor">
                <EncabezadoSeccion titulo={titulo} entradilla={entradilla} />

                <div className="mt-12 grid items-center gap-12 md:mt-16 lg:grid-cols-12 lg:gap-16">
                    <figure className="m-0 flex flex-col items-center lg:col-span-5 lg:items-start">
                        <div className="marco-telefono w-full max-w-[19rem]">
                            <ChatDemo />
                        </div>
                        {/* La etiqueta de honestidad va a tamaño legible y
                            debajo de la pieza, no en letra de contrato: es una
                            simulación y se dice de frente. */}
                        <figcaption className="mt-4 max-w-[19rem] text-xs leading-relaxed text-white/55">
                            {nota}
                        </figcaption>
                    </figure>

                    <ol className="lg:col-span-7">
                        {PASOS.map((paso, i) => (
                            <li
                                key={paso.titulo}
                                className="flex items-start gap-5 border-t border-white/[0.09] py-6 first:border-t-0 first:pt-0"
                            >
                                <span
                                    className="cifras etiqueta-mono mt-1 flex-none"
                                    style={{ color: 'var(--acento)' }}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <div>
                                    <h3 className="text-lg font-extrabold tracking-tight text-white">
                                        {paso.titulo}
                                    </h3>
                                    <p className="cuerpo mt-1.5">{paso.texto}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
                <CtaServicio servicio="chatbots" ubicacion="demo" className="mt-14" />
            </div>
        </section>
    );
};

export default EjemploAtencion;
