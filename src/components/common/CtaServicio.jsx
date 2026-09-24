import React from 'react';
import { ArrowRight } from 'lucide-react';

import { cn } from '../../utils/cn';
import { destinoCta, etiquetaCta, whatsappCta } from '../../utils/cta';
import { medir } from '../../utils/medicion';
import Enlace from './Enlace';

/**
 * El cierre de cada sección: un botón que lleva a cotizar el servicio concreto
 * y, al lado, la misma pregunta por WhatsApp con el mensaje ya redactado.
 *
 * `secundario` cambia la alternativa (por ejemplo, «Ver chatbots con IA» en un
 * artículo del blog) y `false` la quita. `destino` cambia el del botón: en
 * contacto lleva al formulario de la misma página. `ubicacion` identifica el botón en la
 * analítica: así se sabe qué sección trae las solicitudes.
 */
const CtaServicio = ({
    servicio,
    giro,
    detalle,
    texto,
    destino,
    secundario,
    ubicacion,
    centrado = false,
    className = '',
}) => {
    const datos = { servicio, giro, detalle };

    return (
        <div
            className={cn(
                'flex flex-col gap-x-7 gap-y-4 sm:flex-row sm:flex-wrap sm:items-center',
                centrado && 'items-center sm:justify-center',
                className
            )}
        >
            <Enlace
                destino={destino ?? destinoCta(datos)}
                className="boton boton-acento boton-grande"
                onClick={() => medir('cta_click', { ubicacion, servicio, giro })}
            >
                {texto ?? etiquetaCta(datos)}
                <ArrowRight size={17} aria-hidden="true" />
            </Enlace>
            {secundario !== false && (
                <Enlace
                    destino={secundario?.destino ?? whatsappCta(datos)}
                    className="enlace inline-flex min-h-[2.75rem] items-center text-[0.9375rem] font-bold"
                    onClick={() => medir('cta_click', { ubicacion, servicio, giro, canal: secundario ? 'enlace' : 'whatsapp' })}
                >
                    {secundario?.texto ?? 'O pregúntenos por WhatsApp'}
                </Enlace>
            )}
        </div>
    );
};

export default CtaServicio;
