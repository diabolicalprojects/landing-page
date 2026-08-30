import React from 'react';

/**
 * Evita la pantalla en negro: sin esto, un error de render en cualquier sección
 * desmonta el árbol entero y el visitante se queda mirando un <body> vacío.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary] Fallo al renderizar:', error, info?.componentStack);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 px-6 text-center font-jakarta">
                <h1 className="text-2xl md:text-3xl font-title uppercase tracking-tighter">
                    Algo falló al cargar la página
                </h1>
                <p className="text-sm text-white/50 max-w-md leading-relaxed">
                    Puedes recargar o escribirnos directamente por WhatsApp si necesitas
                    tu auditoría de fricción ahora mismo.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-10 py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all"
                >
                    Recargar
                </button>
            </main>
        );
    }
}

export default ErrorBoundary;
