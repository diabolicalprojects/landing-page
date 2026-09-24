import React from 'react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';

import Pagina, { Migas } from '../components/common/Pagina';
import Enlace from '../components/common/Enlace';
import EncabezadoSeccion from '../components/common/EncabezadoSeccion';
import PantallaEscena from '../components/common/PantallaEscena';
import Preguntas from '../components/common/Preguntas';
import MotionGrafico from '../motion/MotionGrafico';
import { useBloque } from '../contenido';
import { ESCENAS } from '../motion/escenas';
import { getServicio } from '../data/servicios';
import logoCuadrado from '../assets/logo/LOGO-DIABOLICAL-CUADRADO-BLANCO.svg';

/*
 * Landing de un servicio principal.
 *
 * Los tres servicios estrella —sitios web, chatbots y agendamiento
 * automatizado— tienen su página fuera de /servicios, con dirección propia
 * porque cada uno persigue su búsqueda:
 *
 *   /paginas-web-aguascalientes               páginas web · sitios web en Aguascalientes
 *   /chatbots-aguascalientes                  chatbots Aguascalientes
 *   /agendamiento-automatizado-aguascalientes agendamiento automatizado
 *
 * Qué bloque de contenido pinta cada una lo dice servicios.json (`bloque`), y
 * el title y la descripción también (`seo`). La escena del hero es la del
 * propio servicio, con la misma clave que su slug.
 *
 * Todo el texto sale del contenido editable, y server/schema.js publica el
 * FAQPage a partir del mismo bloque: si el equipo edita una respuesta en el
 * panel, el marcado cambia con ella.
 *
 * El párrafo de definición va solo, justo debajo del hero, y se entiende sin
 * nada alrededor. Es el que un motor generativo puede citar tal cual cuando le
 * preguntan quién hace páginas web en Aguascalientes.
 *
 * Ritmo de fondos, igual que la portada: tres inversiones a claro, cada una
 * donde cambia la conversación.
 *
 *   Hero          negro      la frase clave y la escena del sitio armándose
 *   Definición    negro·2    el párrafo citable
 *   Tipos         CLARO      los cuatro sitios, cada uno con su escena y lo que no incluye
 *   Diferencias   negro      por qué una página que trabaja
 *   Proceso       negro·1    cómo y en cuánto
 *   Precio        CLARO      la pregunta que todos hacen, contestada sin cifra
 *   Portafolio    negro      oculto mientras no haya sitios publicados
 *   Preguntas     negro
 *   Cierre        CLARO      servicios relacionados y la tarjeta negra
 */

const lineaSuperior = { borderTop: '1px solid var(--linea)' };

const LandingServicio = ({ slug }) => {
    const servicio = getServicio(slug);
    const {
        hero = {},
        definicion = {},
        tipos = {},
        diferencias = {},
        proceso = {},
        precio = {},
        portafolio = {},
        relacionados = {},
        faq = {},
        cierre = {},
    } = useBloque(servicio?.bloque);

    const proyectos = (portafolio.proyectos ?? []).filter((p) => p?.nombre);
    const hayPortafolio = portafolio.visible !== false && proyectos.length > 0;

    return (
        <Pagina>
            <Migas
                ruta={[
                    { texto: 'Servicios', destino: '/servicios' },
                    { texto: servicio?.nombre ?? hero.titulo },
                ]}
            />

            {/* Hero */}
            <section className="zona-oscura seccion">
                <div className="contenedor">
                    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
                        <header className="lg:col-span-7">
                            {hero.insignia && <p className="insignia">{hero.insignia}</p>}
                            <h1 className="titular-xl titular-largo mt-5">{hero.titulo}</h1>
                            <p className="cuerpo-l mt-7">{hero.entradilla}</p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Enlace destino={hero.ctaPrimario?.destino} className="boton boton-acento">
                                    {hero.ctaPrimario?.texto}
                                    <ArrowRight size={16} aria-hidden="true" />
                                </Enlace>
                                <Enlace destino={hero.ctaSecundario?.destino} className="boton boton-fantasma">
                                    {hero.ctaSecundario?.texto}
                                </Enlace>
                            </div>

                            {hero.pie && (
                                <p className="etiqueta-mono mt-8" style={{ color: 'var(--texto-3)' }}>
                                    {hero.pie}
                                </p>
                            )}
                        </header>

                        <div className="lg:col-span-5">
                            <MotionGrafico
                                escena={slug}
                                prioridad
                                etiqueta={
                                    ESCENAS[slug]?.descripcion ??
                                    `Ilustración animada del mecanismo de ${servicio?.nombre?.toLowerCase()}.`
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Definición */}
            {definicion.texto && (
                <section
                    className="zona-oscura zona-oscura-2 seccion-compacta"
                    aria-labelledby="pw-definicion"
                >
                    <div className="contenedor">
                        <div className="grid gap-5 lg:grid-cols-12 lg:gap-16">
                            <h2
                                id="pw-definicion"
                                className="etiqueta pt-1.5 lg:col-span-3"
                                style={{ color: 'var(--texto-3)' }}
                            >
                                {definicion.titulo}
                            </h2>
                            <p className="cuerpo-destacado m-0 max-w-[68ch] lg:col-span-9">
                                {definicion.texto}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Tipos de sitio */}
            <section id="tipos" className="zona-clara seccion">
                <div className="contenedor">
                    <EncabezadoSeccion
                        id="tipos"
                        insignia={tipos.insignia}
                        titulo={tipos.titulo}
                        entradilla={tipos.entradilla}
                    />

                    <ul className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
                        {(tipos.items ?? []).map((tipo) => (
                            <li key={tipo.id ?? tipo.nombre} className="tarjeta flex flex-col overflow-hidden">
                                <PantallaEscena escena={tipo.id} />
                                <div className="flex flex-1 flex-col p-6 md:p-8">
                                <h3 className="titular-m">{tipo.nombre}</h3>
                                <p className="cuerpo mt-3">{tipo.paraQuien}</p>

                                <h4 className="etiqueta mt-7" style={{ color: 'var(--texto-3)' }}>
                                    Incluye
                                </h4>
                                <ul className="mt-3">
                                    {(tipo.incluye ?? []).map((punto) => (
                                        <li
                                            key={punto}
                                            className="flex items-start gap-3.5 py-3"
                                            style={lineaSuperior}
                                        >
                                            <span
                                                className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full"
                                                style={{ background: 'var(--inverso-fondo)' }}
                                                aria-hidden="true"
                                            >
                                                <Check size={11} style={{ color: 'var(--inverso-texto)' }} />
                                            </span>
                                            <span className="cuerpo max-w-none">{punto}</span>
                                        </li>
                                    ))}
                                </ul>

                                {tipo.noIncluye && (
                                    <>
                                        <h4 className="etiqueta mt-6" style={{ color: 'var(--texto-3)' }}>
                                            No incluye
                                        </h4>
                                        <p className="cuerpo mt-2.5">{tipo.noIncluye}</p>
                                    </>
                                )}

                                <div className="flex-1" />

                                <dl className="mt-7 grid grid-cols-2 gap-4 pt-5" style={lineaSuperior}>
                                    <div>
                                        <dt className="etiqueta" style={{ color: 'var(--texto-3)' }}>
                                            Alcance
                                        </dt>
                                        <dd className="mt-2 text-[0.9375rem] font-bold tracking-tight">
                                            {tipo.alcance}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="etiqueta" style={{ color: 'var(--texto-3)' }}>
                                            Plazo típico
                                        </dt>
                                        <dd className="mt-2 text-[0.9375rem] font-bold tracking-tight">
                                            {tipo.plazo}
                                        </dd>
                                    </div>
                                </dl>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Diferencias */}
            <section className="zona-oscura seccion">
                <div className="contenedor">
                    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                        <header className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
                            {diferencias.insignia && <p className="insignia">{diferencias.insignia}</p>}
                            <h2 className="titular-l mt-5">
                                {diferencias.titulo}{' '}
                                {diferencias.tituloApagado && (
                                    <span className="titular-apagado">{diferencias.tituloApagado}</span>
                                )}
                            </h2>
                        </header>

                        <ul className="lg:col-span-7">
                            {(diferencias.items ?? []).map((item) => (
                                <li key={item.id ?? item.titulo} className="py-7" style={lineaSuperior}>
                                    <h3 className="cuerpo-destacado font-extrabold tracking-tight">
                                        {item.titulo}
                                    </h3>
                                    <p className="cuerpo mt-2.5">{item.texto}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {servicio?.limite && (
                        <div className="tarjeta mt-14 max-w-3xl p-7 md:p-10">
                            <h3 className="etiqueta" style={{ color: 'var(--texto-3)' }}>
                                Hasta dónde llega
                            </h3>
                            <p className="cuerpo-destacado mt-4 max-w-none">{servicio.limite}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Proceso */}
            {(proceso.pasos ?? []).length > 0 && (
                <section className="zona-oscura zona-oscura-1 seccion">
                    <div className="contenedor">
                        <EncabezadoSeccion insignia={proceso.insignia} titulo={proceso.titulo} />

                        <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 px-3 py-4 md:mt-16 md:px-8 md:py-8">
                            <MotionGrafico
                                escena="proceso"
                                datos={{ pasos: proceso.pasos }}
                                etiqueta={`Diagrama animado del proceso: ${proceso.pasos.map((p) => p.titulo).join(', ')}.`}
                            />
                        </div>

                        <ol className="mt-10 md:mt-12">
                            {proceso.pasos.map((paso, i) => (
                                <li
                                    key={paso.id ?? paso.titulo}
                                    className="grid gap-3 py-7 md:grid-cols-12 md:gap-8"
                                    style={lineaSuperior}
                                >
                                    <div className="flex items-baseline gap-4 md:col-span-3 md:flex-col md:gap-2">
                                        <span className="cifras etiqueta-mono" style={{ color: 'var(--texto-3)' }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span className="etiqueta-mono" style={{ color: 'var(--texto-2)' }}>
                                            {paso.duracion}
                                        </span>
                                    </div>
                                    <h3 className="titular-m md:col-span-4">{paso.titulo}</h3>
                                    <p className="cuerpo m-0 md:col-span-5">{paso.texto}</p>
                                </li>
                            ))}
                        </ol>

                        {proceso.nota && (
                            <p className="cuerpo mt-4 pt-7" style={{ ...lineaSuperior, color: 'var(--texto-3)' }}>
                                {proceso.nota}
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* Precio */}
            {precio.titulo && (
                <section id="precio" className="zona-clara seccion">
                    <div className="contenedor">
                        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                            <header className="lg:col-span-5">
                                {precio.insignia && <p className="insignia">{precio.insignia}</p>}
                                <h2 className="titular-l mt-5">{precio.titulo}</h2>
                                <p className="cuerpo-l mt-6">{precio.respuesta}</p>
                            </header>

                            <div className="lg:col-span-7">
                                <ol>
                                    {(precio.factores ?? []).map((factor, i) => (
                                        <li
                                            key={factor}
                                            className="flex items-start gap-5 py-5"
                                            style={lineaSuperior}
                                        >
                                            <span
                                                className="cifras etiqueta-mono mt-1 flex-none"
                                                style={{ color: 'var(--texto-3)' }}
                                            >
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span className="cuerpo-destacado">{factor}</span>
                                        </li>
                                    ))}
                                </ol>

                                {precio.cierre && (
                                    <p className="cuerpo mt-2 pt-6" style={lineaSuperior}>
                                        {precio.cierre}
                                    </p>
                                )}

                                {precio.boton?.texto && (
                                    <Enlace destino={precio.boton.destino} className="boton boton-acento mt-8 inline-flex">
                                        {precio.boton.texto}
                                        <ArrowRight size={16} aria-hidden="true" />
                                    </Enlace>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Portafolio: solo con sitios publicados de verdad. */}
            {hayPortafolio && (
                <section id="portafolio" className="zona-oscura seccion">
                    <div className="contenedor">
                        <EncabezadoSeccion insignia={portafolio.insignia} titulo={portafolio.titulo} />

                        <ul className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
                            {proyectos.map((proyecto) => (
                                <li key={proyecto.id ?? proyecto.nombre} className="tarjeta overflow-hidden">
                                    {proyecto.imagen && (
                                        <img
                                            src={proyecto.imagen}
                                            alt={proyecto.alt || `Página web de ${proyecto.nombre}`}
                                            width="1200"
                                            height="750"
                                            loading="lazy"
                                            decoding="async"
                                            className="aspect-[16/10] w-full object-cover object-top"
                                            style={{ borderBottom: '1px solid var(--linea)' }}
                                        />
                                    )}
                                    <div className="p-6 md:p-7">
                                        {(proyecto.tipo || proyecto.giro) && (
                                            <p className="etiqueta" style={{ color: 'var(--texto-3)' }}>
                                                {[proyecto.tipo, proyecto.giro].filter(Boolean).join(' · ')}
                                            </p>
                                        )}
                                        <h3 className="titular-m mt-2.5">{proyecto.nombre}</h3>
                                        {proyecto.descripcion && <p className="cuerpo mt-3">{proyecto.descripcion}</p>}
                                        {proyecto.url && (
                                            <Enlace
                                                destino={proyecto.url}
                                                className="enlace mt-4 inline-flex min-h-[1.75rem] items-center gap-1.5 text-sm font-bold"
                                            >
                                                Ver el sitio publicado
                                                <ArrowUpRight size={14} aria-hidden="true" />
                                            </Enlace>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {/* Preguntas frecuentes */}
            {(faq.items ?? []).length > 0 && (
                <section id="preguntas" className="zona-oscura seccion">
                    <div className="contenedor">
                        {/* Encabezado a lo ancho: el título lleva la frase clave
                            entera y en una columna lateral «Aguascalientes» no
                            cabe a tamaño de titular. */}
                        <EncabezadoSeccion insignia={faq.insignia} titulo={faq.titulo} />
                        <div className="mt-12 max-w-4xl md:mt-14">
                            <Preguntas items={faq.items.filter((p) => p?.pregunta && p?.respuesta)} />
                        </div>
                    </div>
                </section>
            )}

            {/* Cierre */}
            <section className="zona-clara seccion">
                <div className="contenedor">
                    {(relacionados.enlaces ?? []).length > 0 && (
                        <nav aria-labelledby="pw-relacionados">
                            <h2 id="pw-relacionados" className="titular-m">
                                {relacionados.titulo}
                            </h2>
                            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {relacionados.enlaces.map((enlace) => (
                                    <li key={enlace.destino ?? enlace.texto}>
                                        <Enlace
                                            destino={enlace.destino}
                                            className="tarjeta tarjeta-enlace flex h-full min-h-[4.5rem] items-center justify-between gap-4 px-5 py-4"
                                        >
                                            <span className="text-[0.9375rem] font-bold tracking-tight">
                                                {enlace.texto}
                                            </span>
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
                    )}

                    {cierre.titulo && (
                        <div
                            className="zona-oscura relative mt-16 overflow-hidden px-6 py-16 text-center md:mt-20 md:px-16 md:py-24"
                            style={{ borderRadius: 'var(--radio-losa)' }}
                        >
                            <div className="rejilla" aria-hidden="true" />
                            <div className="relative mx-auto max-w-2xl">
                                <img
                                    src={logoCuadrado}
                                    alt=""
                                    width="48"
                                    height="48"
                                    className="mx-auto mb-8 w-12 opacity-90"
                                />
                                <h2 className="titular-l">{cierre.titulo}</h2>
                                <p className="cuerpo-l mx-auto mt-6 text-center">{cierre.texto}</p>

                                <Enlace destino={cierre.boton?.destino} className="boton boton-acento mt-10 inline-flex">
                                    {cierre.boton?.texto}
                                    <ArrowRight size={16} aria-hidden="true" />
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

export default LandingServicio;
