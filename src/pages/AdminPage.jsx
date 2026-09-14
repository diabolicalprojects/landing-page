import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Activity,
    AlertTriangle,
    Check,
    Eye,
    EyeOff,
    Inbox,
    LayoutGrid,
    Loader2,
    LogOut,
    Palette,
    RotateCcw,
    Search,
    Undo2,
} from 'lucide-react';

import { cn } from '../utils/cn';
import { SITE_URL } from '../config';
import { CONTENIDO_BASE } from '../contenido';
import { BLOQUES } from '../admin/esquema';
import { Grupo, aplicar } from '../admin/Campos';
import EditorTema from '../admin/EditorTema';
import Prospectos from '../admin/Prospectos';
import VistaPrevia from '../admin/VistaPrevia';
import logoCuadradoBlanco from '../assets/logo/LOGO-DIABOLICAL-CUADRADO-BLANCO.svg';

/*
 * Panel de control.
 *
 * Lo que había antes era un formulario de SEO: cuatro pestañas de metadatos y
 * nada más. Todo el texto del sitio vivía en el código, así que cambiar una
 * frase exigía un programador y un despliegue.
 *
 * Ahora el contenido entero es editable, con el sitio real al lado
 * actualizándose mientras se escribe. El objetivo es que alguien que no ha
 * tocado código en su vida pueda cambiar un titular, añadir un giro de negocio
 * o revisar los prospectos del fin de semana sin llamar a nadie.
 *
 * Tres reglas que sostienen el diseño de esta pantalla:
 *
 *   1. Nada se publica hasta pulsar Publicar. El borrador vive en memoria y se
 *      ve en la vista previa, pero el sitio público no cambia.
 *   2. Siempre hay marcha atrás: deshacer los cambios sin guardar, y volver al
 *      contenido de fábrica si algo quedó inservible.
 *   3. Ningún campo dice cómo se llama en el JSON. Dice para qué sirve.
 */

const api = axios.create({ withCredentials: true });

const SECCIONES = [
    { id: 'contenido', nombre: 'Contenido', icono: LayoutGrid },
    { id: 'prospectos', nombre: 'Prospectos', icono: Inbox },
    { id: 'diseno', nombre: 'Diseño', icono: Palette },
    { id: 'seo', nombre: 'SEO', icono: Search },
    { id: 'analitica', nombre: 'Analítica', icono: Activity },
];

const AdminPage = () => {
    const navigate = useNavigate();

    const [seccion, setSeccion] = useState('contenido');
    const [bloqueActivo, setBloqueActivo] = useState('hero');

    const [sesion, setSesion] = useState(false);
    const [panelActivo, setPanelActivo] = useState(true);
    const [usuario, setUsuario] = useState('');
    const [clave, setClave] = useState('');
    const [verClave, setVerClave] = useState(false);
    const [errorAcceso, setErrorAcceso] = useState('');
    const [autenticando, setAutenticando] = useState(false);

    // `publicado` es lo que hay en el servidor; `borrador` lo que se está
    // editando. Tener las dos permite saber si hay cambios sin guardar y poder
    // deshacerlos sin recargar.
    const [publicado, setPublicado] = useState(CONTENIDO_BASE);
    const [borrador, setBorrador] = useState(CONTENIDO_BASE);
    const [guardando, setGuardando] = useState(false);
    const [aviso, setAviso] = useState(null);
    const [mostrarPrevia, setMostrarPrevia] = useState(true);

    const [seo, setSeo] = useState(null);
    const [guardandoSeo, setGuardandoSeo] = useState(false);

    const avisoRef = useRef(null);

    const hayCambios = useMemo(
        () => JSON.stringify(borrador) !== JSON.stringify(publicado),
        [borrador, publicado]
    );

    // Avisar antes de cerrar la pestaña con cambios sin publicar. Perder media
    // hora de edición por cerrar sin querer es el fallo más caro de un CMS.
    useEffect(() => {
        if (!hayCambios) return undefined;
        const alCerrar = (evento) => {
            evento.preventDefault();
            evento.returnValue = '';
        };
        window.addEventListener('beforeunload', alCerrar);
        return () => window.removeEventListener('beforeunload', alCerrar);
    }, [hayCambios]);

    useEffect(() => {
        document.title = 'Panel · Diabolical';
    }, []);

    const mostrarAviso = useCallback((tono, texto) => {
        setAviso({ tono, texto });
        clearTimeout(avisoRef.current);
        avisoRef.current = setTimeout(() => setAviso(null), 5000);
    }, []);

    // La cookie de sesión es httpOnly, así que solo el servidor sabe si hay
    // sesión. Se pregunta al montar para no perderla al recargar.
    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/api/session');
                setSesion(Boolean(data?.authenticated));
                setPanelActivo(data?.adminEnabled !== false);
            } catch {
                setSesion(false);
            }

            try {
                const { data } = await api.get('/api/contenido');
                if (data?.contenido) {
                    setPublicado(data.contenido);
                    setBorrador(data.contenido);
                }
            } catch (error) {
                console.error('No se pudo cargar el contenido:', error);
            }

            try {
                const { data } = await api.get('/api/settings');
                if (data && typeof data === 'object') setSeo(data);
            } catch (error) {
                console.error('No se pudo cargar la configuración SEO:', error);
            }
        })();
    }, []);

    const entrar = async (evento) => {
        evento.preventDefault();
        setErrorAcceso('');
        setAutenticando(true);
        try {
            const { data } = await api.post('/api/login', { username: usuario, password: clave });
            // Sin servidor Express esta ruta devolvería el HTML de la SPA con
            // estado 200. Exigir el JSON evita dar por buena una sesión falsa.
            if (data?.ok !== true) throw new Error('respuesta inesperada');
            setSesion(true);
            setClave('');
        } catch (error) {
            setErrorAcceso(
                error?.response?.data?.error || 'Acceso denegado: usuario o contraseña incorrectos.'
            );
        } finally {
            setAutenticando(false);
        }
    };

    const salir = async () => {
        try {
            await api.post('/api/logout');
        } finally {
            setSesion(false);
        }
    };

    const cambiar = useCallback((ruta, valor) => {
        setBorrador((previo) => aplicar(previo, ruta, valor));
    }, []);

    const publicar = async () => {
        setGuardando(true);
        try {
            await api.post('/api/contenido', borrador);
            setPublicado(borrador);
            mostrarAviso('ok', 'Publicado. Ya está en el sitio.');
        } catch (error) {
            if (error?.response?.status === 401) {
                setSesion(false);
                setErrorAcceso('La sesión caducó. Vuelve a entrar; tus cambios siguen aquí.');
                return;
            }
            mostrarAviso('error', error?.response?.data?.error || 'No se pudo publicar.');
        } finally {
            setGuardando(false);
        }
    };

    const descartar = () => {
        setBorrador(publicado);
        mostrarAviso('ok', 'Cambios descartados.');
    };

    const restablecer = async () => {
        const seguro = window.confirm(
            'Esto devuelve TODO el contenido del sitio a como venía de fábrica y se publica al instante. Lo que hayas escrito se pierde. ¿Seguimos?'
        );
        if (!seguro) return;

        try {
            const { data } = await api.post('/api/contenido/restablecer');
            const valor = data?.valor ?? CONTENIDO_BASE;
            setPublicado(valor);
            setBorrador(valor);
            mostrarAviso('ok', 'Contenido devuelto al de fábrica.');
        } catch {
            mostrarAviso('error', 'No se pudo restablecer.');
        }
    };

    const guardarSeo = async (evento) => {
        evento.preventDefault();
        setGuardandoSeo(true);
        try {
            await api.post('/api/settings', seo);
            mostrarAviso('ok', 'Metadatos guardados.');
        } catch (error) {
            if (error?.response?.status === 401) {
                setSesion(false);
                return;
            }
            mostrarAviso('error', 'No se pudieron guardar los metadatos.');
        } finally {
            setGuardandoSeo(false);
        }
    };

    // --- Acceso -----------------------------------------------------------

    if (!sesion) {
        return (
            <div className="font-jakarta flex min-h-screen items-center justify-center bg-black p-5">
                <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center md:p-10">
                    <img
                        src={logoCuadradoBlanco}
                        width="64"
                        height="64"
                        className="mx-auto mb-8 w-16 opacity-90"
                        alt="Diabolical"
                    />
                    <h1 className="text-xl font-extrabold tracking-tight text-white">
                        Panel de Diabolical
                    </h1>
                    <p className="mt-2 text-[0.8125rem] text-white/50">
                        Entra para editar el sitio y ver los prospectos.
                    </p>

                    {!panelActivo && (
                        <p className="mt-6 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-left text-[0.75rem] leading-relaxed text-white/70">
                            El panel está desactivado en el servidor. Faltan las variables
                            ADMIN_USERNAME, ADMIN_PASSWORD_HASH y SESSION_SECRET.
                        </p>
                    )}

                    <form onSubmit={entrar} className="mt-8 space-y-3 text-left">
                        <div>
                            <label htmlFor="usuario" className="sr-only">
                                Usuario
                            </label>
                            <input
                                id="usuario"
                                name="username"
                                type="text"
                                autoComplete="username"
                                placeholder="Usuario"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                className="min-h-[3rem] w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 text-[0.9375rem] text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/35"
                            />
                        </div>

                        <div className="relative">
                            <label htmlFor="clave" className="sr-only">
                                Contraseña
                            </label>
                            <input
                                id="clave"
                                name="password"
                                type={verClave ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="Contraseña"
                                value={clave}
                                onChange={(e) => setClave(e.target.value)}
                                className="min-h-[3rem] w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 pr-12 text-[0.9375rem] text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/35"
                            />
                            <button
                                type="button"
                                onClick={() => setVerClave(!verClave)}
                                aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/35 transition-colors hover:text-white"
                            >
                                {verClave ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {errorAcceso && (
                            <p role="alert" className="text-[0.8125rem] text-white/80">
                                {errorAcceso}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={autenticando || !panelActivo}
                            className="boton boton-acento w-full"
                        >
                            {autenticando ? 'Comprobando...' : 'Entrar'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- Panel ------------------------------------------------------------

    const bloque = BLOQUES.find((b) => b.clave === bloqueActivo) ?? BLOQUES[0];
    const campoSeo =
        'min-h-[3rem] w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-[0.875rem] text-white outline-none transition-colors focus:border-white/35';

    return (
        <div className="font-jakarta flex h-screen flex-col overflow-hidden bg-[#070707] text-white">
            <header className="flex flex-none flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3">
                <img src={logoCuadradoBlanco} alt="" width="28" height="28" className="w-7" />
                <span className="text-[0.8125rem] font-extrabold tracking-tight">Panel</span>

                {hayCambios && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-2.5 py-1 text-[0.6875rem] font-bold text-white/70">
                        <span
                            className="block h-1.5 w-1.5 rounded-full"
                            style={{ background: 'var(--acento)' }}
                            aria-hidden="true"
                        />
                        Sin publicar
                    </span>
                )}

                <div className="ml-auto flex flex-wrap items-center gap-2">
                    {aviso && (
                        <p
                            role="status"
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.75rem] font-bold',
                                aviso.tono === 'ok'
                                    ? 'bg-white/10 text-white'
                                    : 'bg-white text-black'
                            )}
                        >
                            {aviso.tono === 'ok' ? <Check size={13} /> : <AlertTriangle size={13} />}
                            {aviso.texto}
                        </p>
                    )}

                    {seccion === 'contenido' && (
                        <button
                            type="button"
                            onClick={() => setMostrarPrevia(!mostrarPrevia)}
                            className="hidden rounded-lg border border-white/12 px-3 py-2 text-[0.75rem] font-bold text-white/70 transition-colors hover:border-white/30 hover:text-white lg:inline-flex"
                        >
                            {mostrarPrevia ? 'Ocultar vista previa' : 'Ver vista previa'}
                        </button>
                    )}

                    {hayCambios && (
                        <button
                            type="button"
                            onClick={descartar}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-2 text-[0.75rem] font-bold text-white/70 transition-colors hover:border-white/30 hover:text-white"
                        >
                            <Undo2 size={13} /> Descartar
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={publicar}
                        disabled={!hayCambios || guardando}
                        className="boton boton-acento min-h-[2.5rem] px-5 text-[0.8125rem]"
                    >
                        {guardando ? (
                            <>
                                <Loader2 size={14} className="animate-spin" /> Publicando
                            </>
                        ) : (
                            'Publicar'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={salir}
                        aria-label="Cerrar sesión"
                        className="rounded-lg p-2 text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            <div className="flex min-h-0 flex-1">
                <aside className="flex w-14 flex-none flex-col gap-1 border-r border-white/10 p-2 md:w-56 md:p-3">
                    {SECCIONES.map(({ id, nombre, icono: Icono }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setSeccion(id)}
                            aria-current={seccion === id ? 'page' : undefined}
                            title={nombre}
                            className={cn(
                                'flex items-center gap-3 rounded-xl p-3 text-left transition-colors',
                                seccion === id
                                    ? 'bg-white text-black'
                                    : 'text-white/55 hover:bg-white/5 hover:text-white'
                            )}
                        >
                            <Icono size={17} className="flex-none" />
                            <span className="hidden text-[0.8125rem] font-bold tracking-tight md:block">
                                {nombre}
                            </span>
                        </button>
                    ))}

                    <div className="mt-auto hidden md:block">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full rounded-xl p-3 text-left text-[0.75rem] font-bold text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            Ver el sitio
                        </button>
                        <button
                            type="button"
                            onClick={restablecer}
                            className="flex w-full items-center gap-2 rounded-xl p-3 text-left text-[0.75rem] font-bold text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <RotateCcw size={13} /> Volver al original
                        </button>
                    </div>
                </aside>

                {seccion === 'contenido' && (
                    <>
                        <nav
                            aria-label="Secciones de la página"
                            className="hidden w-52 flex-none overflow-y-auto border-r border-white/10 p-3 xl:block"
                        >
                            <p className="px-2 pb-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/35">
                                La página
                            </p>
                            {BLOQUES.map((b) => {
                                const oculto = borrador?.[b.clave]?.visible === false;
                                return (
                                    <button
                                        key={b.clave}
                                        type="button"
                                        onClick={() => setBloqueActivo(b.clave)}
                                        aria-current={bloqueActivo === b.clave ? 'true' : undefined}
                                        className={cn(
                                            'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[0.8125rem] font-semibold transition-colors',
                                            bloqueActivo === b.clave
                                                ? 'bg-white/10 text-white'
                                                : 'text-white/55 hover:bg-white/5 hover:text-white'
                                        )}
                                    >
                                        <span className="truncate">{b.nombre}</span>
                                        {oculto && (
                                            <EyeOff
                                                size={12}
                                                className="ml-auto flex-none text-white/35"
                                                aria-label="Oculta en el sitio"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
                            <div className="mx-auto max-w-xl">
                                <div className="xl:hidden">
                                    <label
                                        htmlFor="selector-bloque"
                                        className="mb-1.5 block text-[0.75rem] font-bold text-white/60"
                                    >
                                        Sección de la página
                                    </label>
                                    <select
                                        id="selector-bloque"
                                        value={bloqueActivo}
                                        onChange={(e) => setBloqueActivo(e.target.value)}
                                        className={`${campoSeo} mb-6`}
                                    >
                                        {BLOQUES.map((b) => (
                                            <option key={b.clave} value={b.clave} className="bg-[#111]">
                                                {b.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <header className="mb-6">
                                    <h2 className="text-xl font-extrabold tracking-tight text-white">
                                        {bloque.nombre}
                                    </h2>
                                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-white/50">
                                        {bloque.ayuda}
                                    </p>
                                </header>

                                <div className="space-y-4 pb-16">
                                    <Grupo
                                        valor={borrador?.[bloque.clave] ?? {}}
                                        ruta={[bloque.clave]}
                                        onCambio={cambiar}
                                    />
                                </div>
                            </div>
                        </main>

                        {mostrarPrevia && (
                            <section className="hidden w-[46%] flex-none border-l border-white/10 lg:block">
                                <VistaPrevia contenido={borrador} ruta="/" />
                            </section>
                        )}
                    </>
                )}

                {seccion === 'prospectos' && (
                    <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
                        <Prospectos onSesionCaducada={() => setSesion(false)} />
                    </main>
                )}

                {seccion === 'diseno' && (
                    <>
                        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
                            <EditorTema tema={borrador?.tema} onCambio={cambiar} />
                        </main>
                        <section className="hidden w-[42%] flex-none border-l border-white/10 lg:block">
                            <VistaPrevia contenido={borrador} ruta="/" />
                        </section>
                    </>
                )}

                {seccion === 'seo' && seo && (
                    <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
                        <form onSubmit={guardarSeo} className="mx-auto max-w-2xl space-y-6">
                            <header>
                                <h2 className="text-xl font-extrabold tracking-tight text-white">
                                    SEO
                                </h2>
                                <p className="mt-1 text-[0.8125rem] leading-relaxed text-white/50">
                                    Lo que se ve en Google y al compartir el enlace. El título y la
                                    descripción de cada página interior se generan solos.
                                </p>
                            </header>

                            <div>
                                <label
                                    htmlFor="seo-title"
                                    className="mb-1.5 block text-[0.8125rem] font-semibold text-white/80"
                                >
                                    Título en Google
                                </label>
                                <input
                                    id="seo-title"
                                    type="text"
                                    value={seo.title ?? ''}
                                    onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                                    className={campoSeo}
                                />
                                <p className="mt-1 text-[0.75rem] text-white/45">
                                    {(seo.title ?? '').length} caracteres. Entre 30 y 60 es lo que
                                    cabe sin que Google lo corte.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="seo-desc"
                                    className="mb-1.5 block text-[0.8125rem] font-semibold text-white/80"
                                >
                                    Descripción en Google
                                </label>
                                <textarea
                                    id="seo-desc"
                                    rows={3}
                                    value={seo.description ?? ''}
                                    onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                                    className={`${campoSeo} resize-y leading-relaxed`}
                                />
                                <p className="mt-1 text-[0.75rem] text-white/45">
                                    {(seo.description ?? '').length} caracteres. Por encima de 160 se
                                    corta, y lo primero que se pierde es el final.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="seo-og"
                                    className="mb-1.5 block text-[0.8125rem] font-semibold text-white/80"
                                >
                                    Imagen al compartir el enlace
                                </label>
                                <input
                                    id="seo-og"
                                    type="text"
                                    placeholder={`${SITE_URL}/og-image.png`}
                                    value={seo.ogImage ?? ''}
                                    onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                                    className={`${campoSeo} font-mono text-[0.8125rem]`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={guardandoSeo}
                                className="boton boton-acento"
                            >
                                {guardandoSeo ? 'Guardando...' : 'Guardar metadatos'}
                            </button>
                        </form>
                    </main>
                )}

                {seccion === 'analitica' && seo && (
                    <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
                        <form onSubmit={guardarSeo} className="mx-auto max-w-2xl space-y-6">
                            <header>
                                <h2 className="text-xl font-extrabold tracking-tight text-white">
                                    Analítica
                                </h2>
                                <p className="mt-1 text-[0.8125rem] leading-relaxed text-white/50">
                                    Google Analytics y Tag Manager ya están puestos en el código del
                                    sitio. Estos campos son para añadir OTRA etiqueta distinta;
                                    repetir la que ya está contaría las visitas dos veces.
                                </p>
                            </header>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="gtm"
                                        className="mb-1.5 block text-[0.8125rem] font-semibold text-white/80"
                                    >
                                        Google Tag Manager
                                    </label>
                                    <input
                                        id="gtm"
                                        type="text"
                                        placeholder="GTM-XXXXXXX"
                                        value={seo.googleTagManager ?? ''}
                                        onChange={(e) =>
                                            setSeo({ ...seo, googleTagManager: e.target.value })
                                        }
                                        className={`${campoSeo} font-mono`}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="pixel"
                                        className="mb-1.5 block text-[0.8125rem] font-semibold text-white/80"
                                    >
                                        Píxel de Meta
                                    </label>
                                    <input
                                        id="pixel"
                                        type="text"
                                        placeholder="1234567890"
                                        value={seo.metaPixel ?? ''}
                                        onChange={(e) => setSeo({ ...seo, metaPixel: e.target.value })}
                                        className={`${campoSeo} font-mono`}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={guardandoSeo}
                                className="boton boton-acento"
                            >
                                {guardandoSeo ? 'Guardando...' : 'Guardar'}
                            </button>
                        </form>
                    </main>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
