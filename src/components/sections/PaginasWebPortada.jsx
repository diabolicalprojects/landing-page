import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { useBloque } from '../../contenido';
import { rutaServicio } from '../../data/servicios';
import EncabezadoSeccion from '../common/EncabezadoSeccion';
import Enlace from '../common/Enlace';
import PantallaEscena from '../common/PantallaEscena';

/*
 * Páginas web en la portada.
 *
 * La casa se presenta como agencia de páginas web e inteligencia artificial, y
 * la mitad de las páginas web no puede vivir solo en su landing: quien entra
 * por la portada tiene que ver en el primer scroll que esto es también lo que
 * hacemos, y qué cuatro cosas concretas se pueden encargar.
 *
 * Los tipos salen del mismo bloque que la landing (paginasWeb.tipos), así que
 * el nombre, para quién es y el plazo no pueden decir aquí una cosa y allí
 * otra. Cada tarjeta lleva la escena animada de su tipo y enlaza a la landing,
 * donde está el detalle: qué incluye y qué no.
 *
 * Zona clara: después de dos secciones negras cambia la conversación —de qué
 * hacemos en general a qué sitio se le puede encargar—, y el fondo cambia con
 * ella.
 */
const PaginasWebPortada = () => {
    const { visible, insignia, titulo, apagado, entradilla, cta } = useBloque('webPortada');
    const { tipos = {} } = useBloque('paginasWeb');
    const destino = rutaServicio('sitio-web');
    const items = (tipos.items ?? []).filter((t) => t?.nombre);

    if (visible === false || items.length === 0) return null;

    return (
        <section id="paginas-web" className="zona-clara seccion">
            <div className="contenedor">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
                    <EncabezadoSeccion
                        id="paginas-web"
                        insignia={insignia}
                        titulo={titulo}
                        apagado={apagado}
                        entradilla={entradilla}
                    />
                    {cta?.texto && (
                        <Enlace destino={cta.destino} className="boton boton-acento flex-none self-start lg:self-auto">
                            {cta.texto}
                            <ArrowRight size={16} aria-hidden="true" />
                        </Enlace>
                    )}
                </div>

                <ul className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
                    {items.map((tipo) => (
                        <li key={tipo.id ?? tipo.nombre}>
                            <Enlace
                                destino={destino}
                                className="tarjeta tarjeta-enlace flex h-full flex-col overflow-hidden"
                            >
                                <PantallaEscena escena={tipo.id} decorativa />
                                <div className="flex flex-1 flex-col p-6 md:p-7">
                                    <h3 className="titular-m">{tipo.nombre}</h3>
                                    <p className="cuerpo mt-3 flex-1">{tipo.paraQuien}</p>
                                    <p className="mt-6 flex items-center justify-between gap-4">
                                        <span className="etiqueta-mono" style={{ color: 'var(--texto-3)' }}>
                                            Plazo típico · {tipo.plazo}
                                        </span>
                                        <ArrowUpRight
                                            size={16}
                                            className="flex-none"
                                            style={{ color: 'var(--texto-3)' }}
                                            aria-hidden="true"
                                        />
                                    </p>
                                </div>
                            </Enlace>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default PaginasWebPortada;
