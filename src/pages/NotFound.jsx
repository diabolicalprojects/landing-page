import React from 'react';
import { Link } from 'react-router-dom';

import logoHorizontalBlanco from '../assets/logo/LOGO-DIABOLICAL-HORIZONTAL-BLANCO.svg';

const NotFound = () => (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 px-6 text-center font-jakarta">
        <img src={logoHorizontalBlanco} alt="Diabolical Services" width="200" height="40" className="w-48 opacity-70" />

        <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-black">Error 404</p>
            <h1 className="text-3xl md:text-5xl font-title uppercase tracking-tighter leading-[0.9]">
                Esta ruta no existe
            </h1>
            <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
                La página que buscas se movió o nunca estuvo aquí. Vuelve al inicio para
                solicitar tu auditoría de fricción.
            </p>
        </div>

        <Link
            to="/"
            className="px-10 py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all"
        >
            Volver al inicio
        </Link>
    </main>
);

export default NotFound;
