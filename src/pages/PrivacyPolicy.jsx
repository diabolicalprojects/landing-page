import React, { useEffect } from 'react';

import Pagina from '../components/common/Pagina';
import HeroPagina from '../components/common/HeroPagina';

/*
 * Política de privacidad.
 *
 * Con el menú, el pie y la tipografía del resto del sitio. Antes era una página
 * aparte con su propio encabezado, letra de 12 px y mayúsculas espaciadas: en
 * un teléfono no se podía leer, y es justo la que alguien abre antes de dejar
 * sus datos en el formulario.
 *
 * El texto legal no cambia.
 */

const Apartado = ({ titulo, children }) => (
    <section className="mt-12">
        <h2 className="titular-m">{titulo}</h2>
        <div className="mt-4 space-y-4">{children}</div>
    </section>
);

const Lista = ({ items }) => (
    <ul className="space-y-3">
        {items.map((item) => (
            <li key={item} className="flex items-start gap-4">
                <span className="mt-[0.8rem] h-px w-3 flex-none" style={{ background: 'var(--texto-3)' }} aria-hidden="true" />
                <span className="cuerpo-destacado" style={{ color: 'var(--texto-2)' }}>
                    {item}
                </span>
            </li>
        ))}
    </ul>
);

const Parrafo = ({ children }) => (
    <p className="cuerpo-destacado" style={{ color: 'var(--texto-2)' }}>
        {children}
    </p>
);

const PrivacyPolicy = () => {
    useEffect(() => {
        document.title = 'Política de Privacidad | Diabolical';
    }, []);

    return (
        <Pagina>
            <HeroPagina
                migas={[{ texto: 'Política de privacidad' }]}
                titulo="Política de privacidad"
                meta={
                    <p className="etiqueta-mono mt-6" style={{ color: 'var(--texto-3)' }}>
                        Última actualización: 14 de junio de 2026
                    </p>
                }
                abajo="lg:pb-12"
            />

            <section className="zona-oscura pb-20 md:pb-28">
                <div className="contenedor">
                    <div className="max-w-3xl">
                        <Parrafo>
                            En <strong className="text-white">Diabolical Services</strong>, accesible desde{' '}
                            <em>https://diabolicalservices.tech</em>, una de nuestras principales prioridades es la
                            privacidad de nuestros visitantes. Este documento de Política de Privacidad contiene tipos de
                            información que recopilamos y registramos, y cómo la utilizamos.
                        </Parrafo>

                        <Apartado titulo="1. Información que recopilamos">
                            <Parrafo>
                                Recopilamos información personal únicamente cuando es relevante y necesaria para brindarte
                                nuestros servicios de diagnóstico y automatización. Esto incluye:
                            </Parrafo>
                            <Lista
                                items={[
                                    'Datos de contacto básicos (nombre, correo electrónico, número de WhatsApp/teléfono).',
                                    'Información de la empresa (nombre del negocio, volumen estimado de leads, cuellos de botella actuales).',
                                    'Cualquier otro dato que proporciones directamente a través de nuestro chatbot o formulario de diagnóstico rápido.',
                                ]}
                            />
                        </Apartado>

                        <Apartado titulo="2. Cómo utilizamos la información">
                            <Parrafo>La información recopilada se utiliza para:</Parrafo>
                            <Lista
                                items={[
                                    'Realizar el diagnóstico de fricción gratuito y preparar tu plan de automatización con IA personalizado.',
                                    'Poder contactarte directamente vía WhatsApp o correo electrónico para agendar tu llamada estratégica.',
                                    'Operar, mantener y optimizar las funciones interactivas del sitio web.',
                                    'Prevenir actividades fraudulentas y asegurar el correcto funcionamiento técnico de las integraciones (como webhooks de n8n).',
                                ]}
                            />
                        </Apartado>

                        <Apartado titulo="3. Transferencia y terceros">
                            <Parrafo>
                                No vendemos, intercambiamos ni alquilamos tu información personal a terceros. Tus datos se
                                procesan de forma segura a través de nuestros sistemas internos y plataformas de
                                procesamiento seguras (como flujos cifrados en n8n) únicamente para los fines antes
                                mencionados.
                            </Parrafo>
                        </Apartado>

                        <Apartado titulo="4. Tus derechos de privacidad">
                            <Parrafo>
                                Tienes derecho a solicitar el acceso, rectificación o eliminación de tus datos personales en
                                cualquier momento. Para ejercer estos derechos o resolver dudas, puedes contactarnos
                                enviando un correo electrónico a:{' '}
                                <a href="mailto:contacto@diabolicalservices.tech" className="enlace font-bold text-white">
                                    contacto@diabolicalservices.tech
                                </a>
                                .
                            </Parrafo>
                        </Apartado>
                    </div>
                </div>
            </section>
        </Pagina>
    );
};

export default PrivacyPolicy;
