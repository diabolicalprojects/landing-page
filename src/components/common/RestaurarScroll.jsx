import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Cada enlace lleva al principio de la página a la que va.
 *
 * React Router cambia la página sin recargar, y sin esto la página nueva se
 * pinta con el scroll donde estaba la anterior: se entra a «Chatbots» a mitad
 * de la página, a veces directamente en el pie. Al ir hacia adelante se sube
 * arriba; si la dirección trae un ancla (#tipos), se baja hasta ella.
 *
 * Al volver atrás (POP) no se toca nada: el navegador sabe dónde estaba la
 * persona y es ahí donde espera volver.
 */
const RestaurarScroll = () => {
    const { pathname, search, hash } = useLocation();
    const tipo = useNavigationType();

    useEffect(() => {
        if (tipo === 'POP') return;

        if (hash) {
            const destino = document.getElementById(decodeURIComponent(hash.slice(1)));
            if (destino) {
                destino.scrollIntoView({ block: 'start' });
                return;
            }
        }

        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname, search, hash, tipo]);

    return null;
};

export default RestaurarScroll;
