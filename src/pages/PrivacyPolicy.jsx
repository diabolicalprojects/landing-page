import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logoHorizontalBlanco from '../assets/logo/LOGO-DIABOLICAL-HORIZONTAL-BLANCO.svg';

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Política de Privacidad | Diabolical";
    }, []);

    return (
        <main className="relative bg-black min-h-screen selection:bg-white selection:text-black font-jakarta overflow-x-hidden text-white flex flex-col justify-between">
            
            {/* Ambient Background glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-white/[0.02] blur-[200px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-white/[0.01] blur-[150px] rounded-full" />
            </div>

            {/* Header / Logo Navigation */}
            <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8 flex items-center justify-between border-b border-white/5">
                <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-mono font-black">Regresar</span>
                </Link>
                <img src={logoHorizontalBlanco} alt="Diabolical" width="120" height="24" className="h-5 opacity-70" />
            </header>

            {/* Main Content Area */}
            <section className="relative z-10 w-full max-w-3xl mx-auto px-6 py-12 md:py-20 flex-1">
                <div className="glass-card p-8 md:p-14 rounded-3xl border-white/10 shadow-2xl space-y-8">
                    <div>
                        <span className="text-[8px] font-black tracking-[0.4em] text-white/30 uppercase">Legal / Privacidad</span>
                        <h1 className="text-3xl md:text-5xl font-title uppercase tracking-tighter mt-2 leading-[0.9]">
                            Política de <br /><span className="text-white/20 italic">Privacidad</span>
                        </h1>
                        <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase mt-4">Última actualización: 14 de Junio, 2026</p>
                    </div>

                    <div className="space-y-6 text-sm text-white/60 leading-relaxed font-light">
                        <p>
                            En <strong>Diabolical Services</strong>, accesible desde <em>https://diabolicalservices.tech</em>, una de nuestras principales prioridades es la privacidad de nuestros visitantes. Este documento de Política de Privacidad contiene tipos de información que recopilamos y registramos, y cómo la utilizamos.
                        </p>

                        <div className="space-y-3">
                            <h2 className="text-base font-title text-white uppercase tracking-wider">1. Información que Recopilamos</h2>
                            <p>
                                Recopilamos información personal únicamente cuando es relevante y necesaria para brindarte nuestros servicios de diagnóstico y automatización. Esto incluye:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-xs">
                                <li>Datos de contacto básicos (nombre, correo electrónico, número de WhatsApp/teléfono).</li>
                                <li>Información de la empresa (nombre del negocio, volumen estimado de leads, cuellos de botella actuales).</li>
                                <li>Cualquier otro dato que proporciones directamente a través de nuestro chatbot o formulario de diagnóstico rápido.</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-base font-title text-white uppercase tracking-wider">2. Cómo Utilizamos la Información</h2>
                            <p>
                                La información recopilada se utiliza para:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-xs">
                                <li>Realizar el diagnóstico de fricción gratuito y preparar tu plan de automatización con IA personalizado.</li>
                                <li>Poder contactarte directamente vía WhatsApp o correo electrónico para agendar tu llamada estratégica.</li>
                                <li>Operar, mantener y optimizar las funciones interactivas del sitio web.</li>
                                <li>Prevenir actividades fraudulentas y asegurar el correcto funcionamiento técnico de las integraciones (como webhooks de n8n).</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-base font-title text-white uppercase tracking-wider">3. Transferencia y Terceros</h2>
                            <p>
                                No vendemos, intercambiamos ni alquilamos tu información personal a terceros. Tus datos se procesan de forma segura a través de nuestros sistemas internos y plataformas de procesamiento seguras (como flujos cifrados en n8n) únicamente para los fines antes mencionados.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-base font-title text-white uppercase tracking-wider">4. Tus Derechos de Privacidad</h2>
                            <p>
                                Tienes derecho a solicitar el acceso, rectificación o eliminación de tus datos personales en cualquier momento. Para ejercer estos derechos o resolver dudas, puedes contactarnos enviando un correo electrónico a: <a href="mailto:contacto@diabolicalservices.tech" className="text-white underline">contacto@diabolicalservices.tech</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Copy */}
            <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">
                <div>© 2026 Diabolical Services. Todos los derechos reservados.</div>
                <div className="flex gap-4">
                    <Link to="/" className="hover:text-white transition-colors">Volver al Inicio</Link>
                </div>
            </footer>
        </main>
    );
};

export default PrivacyPolicy;
