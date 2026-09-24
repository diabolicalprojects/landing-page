import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Monitor, RotateCw, Smartphone, Tablet } from 'lucide-react';

import { MENSAJE_BORRADOR } from '../contenido';

/*
 * Vista previa en vivo.
 *
 * Es el sitio de verdad dentro de un iframe, no una maqueta que se le parece.
 * El borrador viaja por postMessage en cada tecla, así que lo que se ve aquí es
 * exactamente lo que se va a publicar, con sus fuentes, su CSS y su
 * comportamiento. Una maqueta aparte siempre acaba mintiendo.
 *
 * El iframe avisa cuando está listo para recibir; hasta entonces no se le manda
 * nada. Sin ese apretón de manos, el primer borrador llegaría antes de que el
 * sitio montara su escucha y la vista previa arrancaría con el texto publicado.
 */

const TAMANOS = [
    { id: 'escritorio', nombre: 'Escritorio', icono: Monitor, ancho: null },
    { id: 'tableta', nombre: 'Tableta', icono: Tablet, ancho: 820 },
    { id: 'movil', nombre: 'Móvil', icono: Smartphone, ancho: 400 },
];

const VistaPrevia = ({ contenido, ruta = '/' }) => {
    const marcoRef = useRef(null);
    const listaRef = useRef(false);
    const [tamano, setTamano] = useState('escritorio');
    const [recarga, setRecarga] = useState(0);

    const enviar = useCallback((valor) => {
        const ventana = marcoRef.current?.contentWindow;
        if (!ventana || !listaRef.current) return;
        ventana.postMessage(
            { tipo: MENSAJE_BORRADOR, contenido: valor },
            window.location.origin
        );
    }, []);

    useEffect(() => {
        const alRecibir = (evento) => {
            if (evento.origin !== window.location.origin) return;
            if (evento.data?.tipo !== `${MENSAJE_BORRADOR}:lista`) return;
            listaRef.current = true;
            enviar(contenido);
        };
        window.addEventListener('message', alRecibir);
        return () => window.removeEventListener('message', alRecibir);
    }, [contenido, enviar]);

    // Cada cambio del borrador se reenvía. Es barato: un postMessage con un
    // objeto de unos pocos kB y un re-render de React dentro del iframe.
    useEffect(() => {
        enviar(contenido);
    }, [contenido, enviar]);

    // Al cambiar de página el iframe carga otra dirección, y hasta que esa página
    // monte su escucha no hay a quién mandarle el borrador.
    useEffect(() => {
        listaRef.current = false;
    }, [ruta]);

    const anchoActual = TAMANOS.find((t) => t.id === tamano)?.ancho;

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex flex-none items-center gap-2 border-b border-white/10 px-4 py-2.5">
                <span className="text-[0.75rem] font-bold tracking-tight text-white/45">
                    Vista previa en vivo
                </span>

                <div className="ml-auto flex items-center gap-1">
                    {TAMANOS.map(({ id, nombre, icono: Icono }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setTamano(id)}
                            aria-pressed={tamano === id}
                            title={nombre}
                            className={`rounded-lg p-2 transition-colors ${
                                tamano === id
                                    ? 'bg-white text-black'
                                    : 'text-white/45 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <Icono size={15} />
                            <span className="sr-only">{nombre}</span>
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => {
                            listaRef.current = false;
                            setRecarga((n) => n + 1);
                        }}
                        title="Recargar la vista previa"
                        className="rounded-lg p-2 text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <RotateCw size={15} />
                        <span className="sr-only">Recargar</span>
                    </button>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-[#0a0a0a] p-3">
                <div
                    className="mx-auto h-full overflow-hidden rounded-xl border border-white/10 bg-black transition-[max-width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ maxWidth: anchoActual ? `${anchoActual}px` : '100%' }}
                >
                    <iframe
                        key={recarga}
                        ref={marcoRef}
                        src={ruta}
                        title="Vista previa del sitio"
                        className="h-full w-full border-0"
                        onLoad={() => enviar(contenido)}
                    />
                </div>
            </div>
        </div>
    );
};

export default VistaPrevia;
