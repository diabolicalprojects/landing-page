import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import ErrorBoundary from './components/common/ErrorBoundary';

// La portada se carga en el bundle principal a propósito: es el 99% del tráfico
// y además es la ruta que se prerenderiza, así que un lazy() aquí obligaría a
// React a descartar el HTML prerenderizado y mostrar el fallback al hidratar.
import LandingPage from './pages/LandingPage';

// Las páginas de sector también se prerenderizan y comparten un único
// componente, así que cargarlas de entrada cuesta muy poco.
import SectorPage from './pages/SectorPage';
import { SECTORES } from './data/sectores';

// El blog también se prerenderiza entero y comparte un componente por tipo de
// página, así que entra en el bundle principal por el mismo motivo que los
// sectores: un lazy() obligaría a React a descartar el HTML prerenderizado.
import BlogPage from './pages/BlogPage';
import ArticuloPage from './pages/ArticuloPage';
import { ARTICULOS } from './data/articulos';
import ServiciosPage from './pages/ServiciosPage';

// El resto sí se parte: son rutas secundarias.
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

// El Router lo pone quien monta la app: BrowserRouter en main.jsx (navegador) y
// StaticRouter en entry-server.jsx (prerender).
function App() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    {/* Una ruta por sector en vez de un parámetro: React Router
                        solo acepta :params que ocupen un segmento completo, y
                        "/automatizacion-para-:slug" nunca llegaría a casar. */}
                    {SECTORES.map((sector) => (
                        <Route
                            key={sector.slug}
                            path={`/automatizacion-para-${sector.slug}`}
                            element={<SectorPage slug={sector.slug} />}
                        />
                    ))}
                    <Route path="/servicios" element={<ServiciosPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    {/* Una ruta por artículo, por el mismo motivo que los
                        sectores: "/blog/:slug" sí casaría, pero declararlas
                        explícitamente mantiene el router alineado con
                        RUTAS_PUBLICAS y evita que una ruta inexistente
                        devuelva 200 con una página vacía en lugar de 404. */}
                    {ARTICULOS.map((articulo) => (
                        <Route
                            key={articulo.slug}
                            path={`/blog/${articulo.slug}`}
                            element={<ArticuloPage slug={articulo.slug} />}
                        />
                    ))}
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
                    {/* El servidor ya devuelve 404 para estas rutas; esto evita
                        que el visitante se quede con una pantalla en blanco. */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
