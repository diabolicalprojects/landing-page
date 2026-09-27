import React from 'react';

import { useBloque } from '../../contenido';
import EncabezadoSeccion from '../common/EncabezadoSeccion';
import CtaServicio from '../common/CtaServicio';
import { ESCENAS } from './Mockups';
import MotionGrafico from '../../motion/MotionGrafico';
import { hayEscena, variablesEncuadre } from '../../motion/escenas';

/*
 * Los tres frentes.
 *
 * La composición no es de tres tarjetas iguales: la primera ocupa el ancho
 * entero con la escena a un lado, y las otras dos van debajo a mitad de ancho.
 * Tres cajas idénticas en fila dicen «estos tres pesan lo mismo», y no es
 * verdad — el sitio web es la puerta de entrada de todo lo demás.
 *
 * Una tarjeta con `escena` (una clave de src/motion/escenas) lleva esa escena
 * animada; sin ella, la maqueta estática de `icono`. Las escenas mandan: son
 * las que cuentan el mecanismo.
 *
 * Junto al titular, «un solo sistema» dibujado: la marca en el centro con los
 * canales del negocio colgando de ella. El logotipo no está de adorno: es
 * literalmente el dibujo de lo que se vende. Antes era la escena del hero; la
 * portada abre ahora solo con el texto y la escena baja aquí, donde el titular
 * la explica.
 */
const SISTEMA = 'nucleo';
// El encuadre del hero móvil cortaba los rótulos de abajo (Agenda, Redes); este
// deja entero cada canal con su rótulo.
const ENCUADRE_SISTEMA = [30, 34, 580, 350];
const Pilares = () => {
    const { visible, titulo, entradilla, items = [] } = useBloque('pilares');

    if (visible === false || items.length === 0) return null;

    const [principal, ...resto] = items;
    const EscenaPrincipal = ESCENAS[principal.icono];

    return (
        <section id="pilares" className="zona-oscura seccion">
            <div className="contenedor">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
                    <EncabezadoSeccion
                        id="pilares"
                        titulo={titulo}
                        entradilla={entradilla}
                        className={hayEscena(SISTEMA) ? 'lg:col-span-6' : 'lg:col-span-12'}
                    />

                    {hayEscena(SISTEMA) && (
                        <div className="pilares__sistema lg:col-span-6">
                            <div className="encuadre" style={variablesEncuadre(SISTEMA, ENCUADRE_SISTEMA)}>
                                <div className="encuadre__lienzo">
                                    <MotionGrafico
                                        escena={SISTEMA}
                                        etiqueta="La marca de Diabolical en el centro de un sistema, con la página web, WhatsApp, la agenda y las redes conectados a ella."
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-12 grid grid-cols-1 gap-4 md:mt-16">
                    <article className="tarjeta tarjeta-enlace grid grid-cols-1 gap-8 overflow-hidden p-6 md:grid-cols-2 md:items-center md:p-9">
                        <div>
                            <h3 className="titular-m">{principal.titulo}</h3>
                            <p className="cuerpo mt-4">{principal.texto}</p>
                            <CtaServicio
                                servicio={principal.servicio}
                                secundario={{ texto: 'Ver qué incluye', destino: principal.destino }}
                                ubicacion="pilares"
                                className="mt-7"
                            />
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
                            const conEscena = item.escena && hayEscena(item.escena);
                            return (
                                <article
                                    key={item.id}
                                    className="tarjeta tarjeta-enlace flex flex-col p-6 md:p-8"
                                >
                                    {conEscena ? (
                                        <div className="escena-tope mb-7 overflow-hidden rounded-xl border border-white/[0.07]">
                                            <MotionGrafico
                                                escena={item.escena}
                                                etiqueta={`Ilustración animada: ${item.titulo.toLowerCase()}.`}
                                            />
                                        </div>
                                    ) : (
                                        Escena && (
                                            <div className="mb-7">
                                                <Escena />
                                            </div>
                                        )
                                    )}
                                    <h3 className="titular-m">{item.titulo}</h3>
                                    <p className="cuerpo mt-4 flex-1">{item.texto}</p>
                                    <CtaServicio
                                        servicio={item.servicio}
                                        secundario={{ texto: 'Ver qué incluye', destino: item.destino }}
                                        ubicacion="pilares"
                                        className="mt-7"
                                    />
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
