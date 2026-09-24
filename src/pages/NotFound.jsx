import React from 'react';
import { ArrowRight } from 'lucide-react';

import Pagina from '../components/common/Pagina';
import HeroPagina from '../components/common/HeroPagina';
import Enlace from '../components/common/Enlace';

/*
 * Página no encontrada.
 *
 * Con el menú y el pie de siempre: quien llega a una dirección rota tiene que
 * poder seguir navegando sin volver atrás. El servidor ya responde 404 y marca
 * la página como no indexable; aquí solo se dibuja.
 */
const NotFound = () => (
    <Pagina>
        <HeroPagina
            titulo={
                <>
                    Esta página <span className="titular-apagado">no existe.</span>
                </>
            }
            entradilla="La dirección cambió o nunca estuvo aquí. Desde el inicio puede ver los servicios o pedir su cotización."
            cta={
                <div className="flex flex-col gap-x-7 gap-y-4 sm:flex-row sm:items-center">
                    <Enlace destino="/" className="boton boton-acento boton-grande">
                        Volver al inicio
                        <ArrowRight size={17} aria-hidden="true" />
                    </Enlace>
                    <Enlace
                        destino="/servicios"
                        className="enlace inline-flex min-h-[2.75rem] items-center text-[0.9375rem] font-bold"
                    >
                        Ver los servicios
                    </Enlace>
                </div>
            }
            escena={{ clave: 'sello', etiqueta: 'La marca de Diabolical con los anillos girando alrededor.' }}
        />
    </Pagina>
);

export default NotFound;
