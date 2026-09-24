import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { SERVICIOS_PRINCIPALES, rutaServicio } from '../../data/servicios';
import Enlace from './Enlace';
import PantallaEscena from './PantallaEscena';

/*
 * Las tres tarjetas de los servicios principales: sitios web, chatbots y
 * agendamiento automatizado, cada una con su escena y enlazada a su landing.
 *
 * Es la pieza que más se repite del sitio —portada, /servicios, cada giro y
 * cada servicio complementario—, y por eso vive aquí: los tres servicios son
 * el centro de la casa y tienen que verse igual en todas partes.
 *
 * Con `giro`, el título se vuelve «Chatbot para spas», «Página web para
 * gimnasios»… Es el texto de enlace que le dice a un buscador qué hay al otro
 * lado, y el que busca alguien de ese giro.
 */
const PARA_GIRO = {
    'sitio-web': 'Página web para',
    chatbots: 'Chatbot para',
    'agendamiento-automatizado': 'Agendamiento para',
};

const ServiciosPrincipales = ({ giro, nivel = 'h3' }) => {
    const Titulo = nivel;

    return (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {SERVICIOS_PRINCIPALES.map((servicio) => (
                <li key={servicio.slug}>
                    <Enlace
                        destino={rutaServicio(servicio.slug)}
                        className="tarjeta tarjeta-enlace flex h-full flex-col overflow-hidden"
                    >
                        <PantallaEscena escena={servicio.slug} decorativa />
                        <div className="flex flex-1 flex-col p-6">
                            <Titulo className="titular-m">
                                {giro ? `${PARA_GIRO[servicio.slug] ?? servicio.nombre} ${giro}` : servicio.nombre}
                            </Titulo>
                            <p className="cuerpo mt-3 flex-1">{servicio.resumen}</p>
                            <span
                                className="etiqueta mt-5 inline-flex items-center gap-1.5"
                                style={{ color: 'var(--texto-3)' }}
                            >
                                Ver el servicio
                                <ArrowUpRight size={13} aria-hidden="true" />
                            </span>
                        </div>
                    </Enlace>
                </li>
            ))}
        </ul>
    );
};

export default ServiciosPrincipales;
