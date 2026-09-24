import React from 'react';
import { Link } from 'react-router-dom';

import { WHATSAPP_PHONE } from '../../config';

/**
 * Enlace que resuelve el destino según su forma.
 *
 * El contenido es editable desde el panel, así que el destino llega como texto
 * y puede ser cualquiera de cuatro cosas. Decidirlo aquí evita que cada
 * componente lo adivine por su cuenta — y sobre todo evita meter un ancla
 * dentro de <Link>, que haría a React Router navegar a "#contacto" como si
 * fuera una ruta y dejaría la página en un 404.
 *
 *   /ruta              → navegación interna, sin recargar
 *   #ancla             → desplazamiento dentro de la página
 *   whatsapp           → atajo al número de la casa
 *   whatsapp:mensaje   → el mismo número con el mensaje ya escrito
 *   https://...        → externo, en pestaña nueva y sin filtrar el referente
 */
const Enlace = ({ destino, children, ...resto }) => {
    if (!destino) return null;

    if (destino === 'whatsapp' || destino.startsWith('whatsapp:')) {
        const mensaje = destino.slice('whatsapp:'.length);
        return (
            <a
                href={`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}${
                    mensaje ? `&text=${encodeURIComponent(mensaje)}` : ''
                }`}
                target="_blank"
                rel="noopener noreferrer"
                {...resto}
            >
                {children}
            </a>
        );
    }

    if (destino.startsWith('/')) {
        return (
            <Link to={destino} {...resto}>
                {children}
            </Link>
        );
    }

    const externo = /^https?:\/\//i.test(destino);

    return (
        <a
            href={destino}
            {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            {...resto}
        >
            {children}
        </a>
    );
};

export default Enlace;
