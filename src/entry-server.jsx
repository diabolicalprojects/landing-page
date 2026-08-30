import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

import App from './App';

/**
 * Punto de entrada para el prerender. Devuelve el HTML de una ruta como texto
 * para incrustarlo en dist/index.html — ver scripts/prerender.mjs.
 */
export function render(url) {
    return renderToString(
        <StaticRouter location={url}>
            <App />
        </StaticRouter>
    );
}
