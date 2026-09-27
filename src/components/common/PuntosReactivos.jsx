import React, { useEffect, useRef } from 'react';

/*
 * Fondo de la portada en escritorio: una malla de puntos que se deforma al
 * pasar el cursor.
 *
 * Cada punto está atado a su sitio con un muelle. El cursor lo empuja hacia
 * fuera, más cuanto más cerca, y al irse el muelle lo devuelve con un pequeño
 * rebote: la malla se abre como una lente y se cierra detrás. Un clic suelta
 * una onda que recorre la malla. Sin cursor, una ola de brillo muy lenta la
 * cruza en diagonal para que el fondo siga vivo.
 *
 * Solo desde 1024 px y con ratón: en el teléfono no hay cursor que seguir y
 * se queda la retícula de siempre, más tenue (ver FondoHero). Quien pide menos
 * movimiento ve la malla quieta.
 *
 * Cuesta poco: un solo <canvas>, los puntos agrupados por intensidad (una
 * pintura por grupo, no una por punto), a 30 fotogramas cuando nada se mueve y
 * parado del todo fuera de pantalla o con la pestaña oculta. Arranca después
 * de hidratar, así que no toca el primer pintado.
 */

const SEPARACION = 26; // px entre puntos
const ALCANCE = 190; // radio de influencia del cursor
const EMPUJE = 30; // lo que se aparta un punto justo bajo el cursor
const RIGIDEZ = 0.09; // muelle hacia su sitio
const FRICCION = 0.8; // < 1: rebota un poco y se asienta
const NIVELES = 12; // grupos de intensidad
const ONDA_VELOCIDAD = 900; // px por segundo
const ONDA_ANCHO = 70;
const ONDA_VIDA = 1.1; // segundos
const ONDA_FUERZA = 16;

/** Radio y opacidad de un punto según su nivel de intensidad (0…1). */
const radio = (i) => 1.15 + i * 1.5;
const alfa = (i) => 0.2 + i * 0.7;

const PuntosReactivos = ({ className = '' }) => {
    const ref = useRef(null);

    useEffect(() => {
        const lienzo = ref.current;
        const ctx = lienzo?.getContext('2d');
        if (!ctx) return undefined;

        const escritorio = window.matchMedia('(min-width: 1024px)');
        const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');

        let ancho = 0;
        let alto = 0;
        let n = 0;
        // Por punto: x0, y0 (su sitio), dx, dy (desvío), vx, vy (velocidad).
        let puntos = new Float32Array(0);
        let grupos = [];
        let cuentas = new Uint32Array(NIVELES);

        const cursor = { x: 0, y: 0, cx: 0, cy: 0, dentro: false, activo: false };
        let ondas = [];
        let cuadro = 0;
        let anterior = 0;
        let enPantalla = true;
        let enMarcha = false;
        let enReposo = false;
        const inicio = performance.now();

        function medir() {
            const caja = lienzo.getBoundingClientRect();
            ancho = caja.width;
            alto = caja.height;
            const ppp = Math.min(window.devicePixelRatio || 1, 2);
            lienzo.width = Math.round(ancho * ppp);
            lienzo.height = Math.round(alto * ppp);
            ctx.setTransform(ppp, 0, 0, ppp, 0, 0);

            // La malla parte del centro: una columna pasa justo bajo el logo.
            const mitad = Math.ceil(ancho / 2 / SEPARACION);
            const columnas = mitad * 2 + 1;
            const filas = Math.ceil(alto / SEPARACION) + 1;
            n = columnas * filas;
            puntos = new Float32Array(n * 6);
            let k = 0;
            for (let f = 0; f < filas; f++) {
                for (let c = 0; c < columnas; c++) {
                    puntos[k] = ancho / 2 + (c - mitad) * SEPARACION;
                    puntos[k + 1] = SEPARACION / 2 + f * SEPARACION;
                    k += 6;
                }
            }
            grupos = Array.from({ length: NIVELES }, () => new Float32Array(n * 2));
            cuentas = new Uint32Array(NIVELES);
        }

        function pintar(ahora) {
            const t = (ahora - inicio) / 1000;
            const R2 = ALCANCE * ALCANCE;

            // El cursor se sigue con un poco de retraso: la lente se desliza.
            // Solo cuenta si está sobre la malla o a un alcance de ella.
            let influye = false;
            let siguiendo = false;
            if (cursor.activo) {
                const caja = lienzo.getBoundingClientRect();
                const x = cursor.x - caja.left;
                const y = cursor.y - caja.top;
                influye = x > -ALCANCE && y > -ALCANCE && x < ancho + ALCANCE && y < alto + ALCANCE;
                if (!cursor.dentro) {
                    cursor.cx = x;
                    cursor.cy = y;
                    cursor.dentro = true;
                }
                cursor.cx += (x - cursor.cx) * 0.3;
                cursor.cy += (y - cursor.cy) * 0.3;
                siguiendo = influye && Math.abs(x - cursor.cx) + Math.abs(y - cursor.cy) > 0.2;
            }
            ondas = ondas.filter((o) => t - o.t < ONDA_VIDA);

            cuentas.fill(0);
            let movimiento = 0;

            for (let k = 0; k < n * 6; k += 6) {
                const x0 = puntos[k];
                const y0 = puntos[k + 1];
                let tx = 0;
                let ty = 0;
                let cerca = 0;

                if (influye) {
                    const ex = x0 - cursor.cx;
                    const ey = y0 - cursor.cy;
                    const d2 = ex * ex + ey * ey;
                    if (d2 < R2) {
                        const d = Math.sqrt(d2) || 1;
                        const f = 1 - d / ALCANCE;
                        const suave = f * f * (3 - 2 * f);
                        tx = (ex / d) * EMPUJE * suave;
                        ty = (ey / d) * EMPUJE * suave;
                        cerca = suave;
                    }
                }

                for (const o of ondas) {
                    const ex = x0 - o.x;
                    const ey = y0 - o.y;
                    const d = Math.sqrt(ex * ex + ey * ey) || 1;
                    const edad = t - o.t;
                    const frente = Math.abs(d - edad * ONDA_VELOCIDAD);
                    if (frente < ONDA_ANCHO) {
                        const fuerza = (1 - frente / ONDA_ANCHO) * (1 - edad / ONDA_VIDA);
                        tx += (ex / d) * ONDA_FUERZA * fuerza;
                        ty += (ey / d) * ONDA_FUERZA * fuerza;
                        cerca = Math.max(cerca, fuerza * 0.7);
                    }
                }

                // Muelle: acelera hacia el objetivo y pierde un poco en cada paso.
                let vx = (puntos[k + 4] + (tx - puntos[k + 2]) * RIGIDEZ) * FRICCION;
                let vy = (puntos[k + 5] + (ty - puntos[k + 3]) * RIGIDEZ) * FRICCION;
                if (Math.abs(vx) < 0.001) vx = 0;
                if (Math.abs(vy) < 0.001) vy = 0;
                puntos[k + 4] = vx;
                puntos[k + 5] = vy;
                puntos[k + 2] += vx;
                puntos[k + 3] += vy;
                movimiento += Math.abs(vx) + Math.abs(vy);

                // La ola de fondo: un brillo que cruza la malla en diagonal.
                const ola = 0.5 + 0.5 * Math.sin(t * 0.8 - (x0 * 0.8 + y0) * 0.009);
                const nivel = Math.min(1, cerca + ola * ola * 0.2);
                const g = Math.min(NIVELES - 1, (nivel * (NIVELES - 1) + 0.5) | 0);
                const i = cuentas[g]++ * 2;
                grupos[g][i] = x0 + puntos[k + 2];
                grupos[g][i + 1] = y0 + puntos[k + 3];
            }

            ctx.clearRect(0, 0, ancho, alto);
            ctx.fillStyle = '#fff';
            for (let g = 0; g < NIVELES; g++) {
                const total = cuentas[g];
                if (!total) continue;
                const nivel = g / (NIVELES - 1);
                const r = radio(nivel);
                const lista = grupos[g];
                ctx.globalAlpha = alfa(nivel);
                ctx.beginPath();
                for (let j = 0; j < total * 2; j += 2) {
                    ctx.moveTo(lista[j] + r, lista[j + 1]);
                    ctx.arc(lista[j], lista[j + 1], r, 0, Math.PI * 2);
                }
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            return movimiento > 0.05 || siguiendo || ondas.length > 0;
        }

        function bucle(ahora) {
            cuadro = requestAnimationFrame(bucle);
            // Con la malla en reposo basta la mitad de fotogramas para la ola.
            if (!enReposo || ahora - anterior > 32) {
                anterior = ahora;
                enReposo = !pintar(ahora);
            }
        }

        function arrancar() {
            const debe = escritorio.matches && enPantalla && !document.hidden && !quieto.matches;
            if (debe && !enMarcha) {
                enMarcha = true;
                enReposo = false;
                cuadro = requestAnimationFrame(bucle);
            } else if (!debe && enMarcha) {
                enMarcha = false;
                cancelAnimationFrame(cuadro);
            }
        }

        function preparar() {
            if (!escritorio.matches) {
                arrancar();
                return;
            }
            medir();
            // Menos movimiento: la malla quieta, dibujada una vez.
            if (quieto.matches) pintar(inicio);
            lienzo.dataset.lista = '';
            arrancar();
        }

        const mover = (e) => {
            if (e.pointerType === 'touch') return;
            cursor.x = e.clientX;
            cursor.y = e.clientY;
            cursor.activo = true;
            enReposo = false;
        };
        const salir = (e) => {
            if (e.relatedTarget) return;
            cursor.activo = false;
            cursor.dentro = false;
        };
        const pulsar = (e) => {
            if (e.pointerType === 'touch' || !enMarcha) return;
            const caja = lienzo.getBoundingClientRect();
            const x = e.clientX - caja.left;
            const y = e.clientY - caja.top;
            if (x < 0 || y < 0 || x > caja.width || y > caja.height) return;
            ondas.push({ x, y, t: (performance.now() - inicio) / 1000 });
            enReposo = false;
        };
        const visibilidad = () => arrancar();

        const observador =
            typeof IntersectionObserver === 'undefined'
                ? null
                : new IntersectionObserver(([entrada]) => {
                      enPantalla = entrada.isIntersecting;
                      arrancar();
                  });
        observador?.observe(lienzo);

        const tamano = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => preparar());
        tamano?.observe(lienzo);

        window.addEventListener('pointermove', mover, { passive: true });
        window.addEventListener('pointerdown', pulsar, { passive: true });
        document.addEventListener('pointerout', salir);
        document.addEventListener('visibilitychange', visibilidad);
        escritorio.addEventListener('change', preparar);
        quieto.addEventListener('change', preparar);

        preparar();

        return () => {
            cancelAnimationFrame(cuadro);
            observador?.disconnect();
            tamano?.disconnect();
            window.removeEventListener('pointermove', mover);
            window.removeEventListener('pointerdown', pulsar);
            document.removeEventListener('pointerout', salir);
            document.removeEventListener('visibilitychange', visibilidad);
            escritorio.removeEventListener('change', preparar);
            quieto.removeEventListener('change', preparar);
        };
    }, []);

    return <canvas ref={ref} className={`puntos-hero ${className}`} aria-hidden="true" />;
};

export default PuntosReactivos;
