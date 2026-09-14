import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import ErrorBoundary from './components/common/ErrorBoundary';
import Tema from './contenido/Tema';

/*
 * Todas las rutas de contenido se renderizan en el servidor, así que ninguna
 * puede ir con lazy(): un <Suspense> sin resolver durante el render hace que
 * React descarte el HTML del servidor al hidratar (error #419) y vuelva a
 * montarlo todo en cliente, que es justo lo que este sitio evita.
 *
 * Las rutas se declaran una por una en lugar de con un :parametro. React Router
 * casaría igual, pero así el router no puede desincronizarse de RUTAS_PUBLICAS
 * —que es de donde salen el sitemap y el prerender— y una dirección inventada
 * devuelve 404 de verdad en lugar de 200 con una página vacía.
 */
import InicioPage from './pages/InicioPage';
import NosotrosPage from './pages/NosotrosPage';
import ServiciosPage from './pages/ServiciosPage';
import ServicioPage from './pages/ServicioPage';
import SectoresPage from './pages/SectoresPage';
import SectorPage from './pages/SectorPage';
import ContactoPage from './pages/ContactoPage';
import BlogPage from './pages/BlogPage';
import ArticuloPage from './pages/ArticuloPage';
import PrivacyPolicy from './pages/PrivacyPolicy';

import { SECTORES } from './data/sectores';
import { SERVICIOS } from './data/servicios';
import { ARTICULOS } from './data/articulos';

// Rutas secundarias que no se prerenderizan: estas sí se parten.
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// El Router lo pone quien monta la app: BrowserRouter en main.jsx (navegador) y
// StaticRouter en entry-server.jsx (render de servidor).
function App() {
    return (
        <ErrorBoundary>
            {/* Las variables de tema van aquí y no en una página: todas usan los
                mismos tokens, y sin esto el acento y la escala editados solo se
                aplicarían en la portada. */}
            <Tema />
            <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <Routes>
                    <Route path="/" element={<InicioPage />} />
                    <Route path="/nosotros" element={<NosotrosPage />} />

                    <Route path="/servicios" element={<ServiciosPage />} />
                    {SERVICIOS.map((servicio) => (
                        <Route
                            key={servicio.slug}
                            path={`/servicios/${servicio.slug}`}
                            element={<ServicioPage slug={servicio.slug} />}
                        />
                    ))}

                    <Route path="/sectores" element={<SectoresPage />} />
                    {SECTORES.map((sector) => (
                        <Route
                            key={sector.slug}
                            path={`/sectores/${sector.slug}`}
                            element={<SectorPage slug={sector.slug} />}
                        />
                    ))}

                    <Route path="/contacto" element={<ContactoPage />} />

                    <Route path="/blog" element={<BlogPage />} />
                    {ARTICULOS.map((articulo) => (
                        <Route
                            key={articulo.slug}
                            path={`/blog/${articulo.slug}`}
                            element={<ArticuloPage slug={articulo.slug} />}
                        />
                    ))}

                    <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
                    <Route path="/admin" element={<AdminPage />} />

                    {/* El servidor ya devuelve 404 para estas rutas; esto evita
                        que el visitante se quede con una pantalla en blanco. */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
