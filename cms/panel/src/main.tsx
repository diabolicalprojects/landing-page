import '@fontsource-variable/manrope';
import './estilos/base.css';
import './estilos/app.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { ErrorApi } from './api';
import { App } from './App';
import { ProveedorToasts } from './componentes/Toasts';
import { ProveedorSesion } from './sesion';

const cliente = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Un 4xx no se arregla reintentando.
            retry: (intentos, error) => !(error instanceof ErrorApi && error.estado >= 400 && error.estado < 500) && intentos < 2,
        },
    },
});

createRoot(document.getElementById('raiz')!).render(
    <StrictMode>
        <QueryClientProvider client={cliente}>
            <BrowserRouter basename="/admin">
                <ProveedorToasts>
                    <ProveedorSesion>
                        <App />
                    </ProveedorSesion>
                </ProveedorToasts>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
);
