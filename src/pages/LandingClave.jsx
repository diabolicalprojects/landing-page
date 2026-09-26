import React from 'react';
import { ArrowRight } from 'lucide-react';

import Pagina from '../components/common/Pagina';
import HeroPagina from '../components/common/HeroPagina';
import Enlace from '../components/common/Enlace';
import EncabezadoSeccion from '../components/common/EncabezadoSeccion';
import Preguntas from '../components/common/Preguntas';
import Fotografia from '../components/common/Fotografia';
import CtaServicio from '../components/common/CtaServicio';
import TarjetaEscena from '../components/common/TarjetaEscena';
import Proceso from '../components/sections/Proceso';
import { useBloque } from '../contenido';
import { CLAVES, getClave } from '../data/claves';
import { SERVICIOS_PRINCIPALES } from '../data/servicios';
import logoCuadrado from '../assets/logo/LOGO-DIABOLICAL-CUADRADO-BLANCO.svg';

/*
 * Landing de una frase clave: «Sitios web en Aguascalientes», «Empresas de IA
 * en Aguascalientes», «Inteligencia artificial Aguascalientes» e «IA para
 * negocios Aguascalientes». Cada una en su dirección con la frase dentro
 * (src/data/claves.json) y con su texto en el contenido editable.
 *
 * Lo que la hace útil para Google y para los motores de IA:
 *
 *   Hero          la frase clave en el h1 y en el título de la pestaña
 *   Definición    un párrafo que se entiende solo: el que un motor cita tal cual
 *   Soluciones    lo que resuelve, con su escena y enlace a cada servicio
 *   Proceso       cómo se trabaja, con plazos
 *   Preguntas     preguntas con respuesta directa, marcadas como FAQPage
 *   Cierre        las demás landings de la red y el botón
 *
 * El JSON-LD (Service, FAQPage y migas) lo arma server/schema.js con el mismo
 * bloque, para que lo marcado sea exactamente lo que se ve.
 *
 * Ritmo de fondos: negro, negro·2, negro·1, CLARO (proceso), negro, CLARO.
 */

/** Las landings de frase clave y de servicio principal, enlazadas entre sí. */
const RED = [
    ...CLAVES.map((c) => ({ texto: c.nombreEnlace, destino: c.ruta })),
    ...SERVICIOS_PRINCIPALES.map((s) => ({ texto: s.seo?.enlace ?? s.nombre, destino: s.ruta })),
];

const LandingClave = ({ slug }) => {
    const clave = getClave(slug);
    const { hero = {}, definicion = {}, soluciones = {}, faq = {}, cierre = {} } = useBloque(clave?.bloque);

    if (!clave) return null;

    const cta = { servicio: clave.servicio ?? undefined, texto: clave.ctaTexto ?? undefined };
    const relacionadas = RED.filter((r) => r.destino !== clave.ruta);
    const items = (soluciones.items ?? []).filter((i) => i?.titulo);

    return (
        <Pagina>
            <HeroPagina
                migas={[{ texto: hero.titulo ?? clave.clave }]}
                largo
                titulo={
                    <>
                        {hero.titulo}{' '}
                        {hero.tituloApagado && <span className="titular-apagado">{hero.tituloApagado}</span>}
                    </>
                }
                entradilla={hero.entradilla}
                bajada={hero.bajada}
                cta={
                    <CtaServicio
                        {...cta}
                        secundario={
                            hero.ctaSecundario?.texto
                                ? { texto: hero.ctaSecundario.texto, destino: hero.ctaSecundario.destino }
                                : undefined
                        }
                        ubicacion="clave-hero"
                    />
                }
                escena={{ clave: clave.escena }}
                pie={clave.foto && <Fotografia clave={clave.foto} className="mt-14 md:mt-20" />}
            />

            {/* Definición: el párrafo citable. */}
            {definicion.texto && (
                <section className="zona-oscura zona-oscura-2 seccion-compacta" aria-labelledby="clave-definicion">
                    <div className="contenedor">
                        <h2 id="clave-definicion" className="sr-only">
                            {definicion.titulo}
                        </h2>
                        <p className="cuerpo-l m-0 max-w-[68ch]" style={{ color: 'var(--texto-1)' }}>
                            {definicion.texto}
                        </p>
                    </div>
                </section>
            )}

            {/* Lo que resuelve: una tarjeta con escena por servicio o por giro. */}
            {items.length > 0 && (
                <section id={soluciones.id} className="zona-oscura zona-oscura-1 seccion scroll-mt-4">
                    <div className="contenedor">
                        <EncabezadoSeccion titulo={soluciones.titulo} entradilla={soluciones.entradilla} />
                        <ul className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
                            {items.map((i) => (
                                <li key={i.titulo}>
                                    <TarjetaEscena
                                        escena={i.escena}
                                        titulo={i.titulo}
                                        texto={i.texto}
                                        destino={i.destino}
                                        enlace={i.enlace}
                                    />
                                </li>
                            ))}
                        </ul>
                        <CtaServicio {...cta} ubicacion="clave-soluciones" className="mt-12" />
                    </div>
                </section>
            )}

            <Proceso conCta={false} />

            {(faq.items ?? []).length > 0 && (
                <section id="preguntas" className="zona-oscura seccion">
                    <div className="contenedor">
                        <EncabezadoSeccion titulo={faq.titulo} />
                        <div className="mt-12 max-w-4xl md:mt-14">
                            <Preguntas items={faq.items.filter((p) => p?.pregunta && p?.respuesta)} />
                        </div>
                        <CtaServicio {...cta} ubicacion="clave-faq" className="mt-10" />
                    </div>
                </section>
            )}

            <section className="zona-clara seccion">
                <div className="contenedor">
                    <nav aria-labelledby="clave-relacionadas">
                        <h2 id="clave-relacionadas" className="titular-m">
                            También en Aguascalientes
                        </h2>
                        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {relacionadas.map((r) => (
                                <li key={r.destino}>
                                    <Enlace
                                        destino={r.destino}
                                        className="tarjeta tarjeta-enlace flex h-full min-h-[4.5rem] items-center justify-between gap-4 px-5 py-4"
                                    >
                                        <span className="text-[0.9375rem] font-bold tracking-tight">{r.texto}</span>
                                        <ArrowRight
                                            size={16}
                                            className="flex-none"
                                            style={{ color: 'var(--texto-3)' }}
                                            aria-hidden="true"
                                        />
                                    </Enlace>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {cierre.titulo && (
                        <div
                            className="zona-oscura relative mt-16 overflow-hidden px-6 py-16 text-center md:mt-20 md:px-16 md:py-24"
                            style={{ borderRadius: 'var(--radio-losa)' }}
                        >
                            <div className="rejilla" aria-hidden="true" />
                            <div className="relative mx-auto max-w-2xl">
                                <img src={logoCuadrado} alt="" width="48" height="48" className="mx-auto mb-8 w-12 opacity-90" />
                                <h2 className="titular-l">{cierre.titulo}</h2>
                                <p className="cuerpo-l mx-auto mt-6 text-center">{cierre.texto}</p>
                                <Enlace
                                    destino={cierre.boton?.destino}
                                    className="boton boton-acento boton-grande mt-10 inline-flex"
                                >
                                    {cierre.boton?.texto}
                                    <ArrowRight size={17} aria-hidden="true" />
                                </Enlace>
                                {cierre.alternativa?.texto && (
                                    <p className="mt-6">
                                        <Enlace
                                            destino={cierre.alternativa.destino}
                                            className="enlace inline-flex min-h-[1.75rem] items-center py-1 text-sm text-white/60"
                                        >
                                            {cierre.alternativa.texto}
                                        </Enlace>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </Pagina>
    );
};

export default LandingClave;
