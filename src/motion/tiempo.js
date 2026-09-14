/*
 * Utilidades de tiempo para las escenas animadas.
 *
 * Son deliberadamente propias y no las de Remotion. Una escena tiene que poder
 * dibujarse en el servidor —sin JavaScript, sin reproductor, sin nada— para que
 * su contenido viaje en el HTML. Si importara `interpolate` de `remotion`, el
 * paquete entero entraría en el bundle crítico y la ventaja que este sitio
 * tiene sobre la competencia local se pagaría en kilobytes.
 *
 * Así, las escenas no saben qué las está animando: reciben un número de
 * fotograma y dibujan. En el servidor se les pasa el fotograma del póster; en
 * el navegador, Remotion les pasa el que toque.
 */

export const acotar = (valor, minimo, maximo) =>
    Math.min(Math.max(valor, minimo), maximo);

/**
 * Lleva un valor de un rango a otro, recortando en los extremos.
 *
 * `interpolar(frame, [0, 30], [0, 1])` va de 0 a 1 en el primer segundo y se
 * queda en 1 a partir de ahí, que es lo que casi siempre se quiere: un valor
 * que sigue creciendo fuera del tramo produce elementos que se van de pantalla.
 */
export function interpolar(valor, [desde, hasta], [salidaDesde, salidaHasta]) {
    if (hasta === desde) return salidaDesde;
    const t = acotar((valor - desde) / (hasta - desde), 0, 1);
    return salidaDesde + t * (salidaHasta - salidaDesde);
}

/*
 * La curva de toda la casa: cubic-bezier(0.16, 1, 0.3, 1).
 *
 * Es la misma que usa el CSS del sitio (--salida), y por eso está aquí en vez
 * de un muelle. Un muelle rebota, y este sistema no rebota: entra rápido y se
 * asienta. Que el movimiento del CSS y el de las escenas compartan curva es lo
 * que hace que la página se sienta de una pieza y no de dos.
 *
 * Newton-Raphson sobre la x de la curva. Cuatro iteraciones bastan: el error
 * queda por debajo de una diezmilésima, muy por debajo de lo que un fotograma
 * puede mostrar.
 */
function bezier(x1, y1, x2, y2) {
    const a = (a1, a2) => 1 - 3 * a2 + 3 * a1;
    const b = (a1, a2) => 3 * a2 - 6 * a1;
    const c = (a1) => 3 * a1;

    const calc = (t, a1, a2) => ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;
    const pendiente = (t, a1, a2) => 3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1);

    return (x) => {
        if (x <= 0) return 0;
        if (x >= 1) return 1;

        let t = x;
        for (let i = 0; i < 4; i += 1) {
            const d = pendiente(t, x1, x2);
            if (d === 0) break;
            t -= (calc(t, x1, x2) - x) / d;
        }
        return calc(t, y1, y2);
    };
}

export const salida = bezier(0.16, 1, 0.3, 1);

/**
 * Progreso suavizado de una entrada: 0 antes de `desde`, 1 pasada la duración.
 *
 * Es el bloque con el que se construye casi todo: opacidad, desplazamiento y
 * escala salen de aquí, así que todo lo que entra en una escena lo hace con el
 * mismo ritmo sin tener que repetir la curva en cada sitio.
 */
export const entrada = (frame, desde = 0, duracion = 22) =>
    salida(acotar((frame - desde) / duracion, 0, 1));

/** Va de 0 a 1 y vuelve a 0. Para lo que late o respira. */
export const vaivén = (frame, periodo) =>
    (1 - Math.cos((frame / periodo) * Math.PI * 2)) / 2;

/** Fotogramas por segundo de todas las escenas. */
export const FPS = 30;
