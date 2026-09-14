import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

import App from './App';
import { ProveedorContenido } from './contenido';

/**
 * Punto de entrada del render de servidor. Devuelve el HTML de una ruta como
 * texto para incrustarlo en dist/index.html.
 *
 * Lo usan dos llamadores con la misma firma:
 *   scripts/prerender.mjs  en el build, con el contenido de fábrica
 *   server/ssr.js          en cada petición, con el contenido ya editado
 *
 * `contenido` viaja por props y no por window: en el servidor no hay window, y
 * pasarlo explícito es lo que garantiza que el HTML servido y el que React
 * reconstruye al hidratar salgan del mismo dato.
 */
export function render(url, contenido) {
    return renderToString(
        <ProveedorContenido valor={contenido}>
            <StaticRouter location={url}>
                <App />
            </StaticRouter>
        </ProveedorContenido>
    );
}
