import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import ErrorBoundary from './components/common/ErrorBoundary';

// La portada se carga en el bundle principal a propósito: es el 99% del tráfico
// y además es la ruta que se prerenderiza, así que un lazy() aquí obligaría a
// React a descartar el HTML prerenderizado y mostrar el fallback al hidratar.
import LandingPage from './pages/LandingPage';

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
