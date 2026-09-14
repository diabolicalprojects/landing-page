import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ProveedorContenido } from './contenido'
import './index.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger);

const container = document.getElementById('root');

// Sin `valor`, el proveedor lee window.__CONTENIDO__, que es lo que el servidor
// inyectó en el HTML. Así el árbol que React reconstruye al hidratar parte del
// mismo contenido con el que se generó el markup y no hay desajuste.
const app = (
    <React.StrictMode>
        <ProveedorContenido>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ProveedorContenido>
    </React.StrictMode>
);

// La portada llega renderizada desde el servidor y se hidrata; el resto de
// rutas reciben un shell vacío y se montan del modo normal.
if (container.hasChildNodes()) {
    hydrateRoot(container, app);
} else {
    createRoot(container).render(app);
}
