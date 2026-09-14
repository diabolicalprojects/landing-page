import { JAKARTA } from './fuentes.js';

/*
 * Los mismos tokens que el sitio.
 *
 * Se copian aquí en lugar de importarse de src/ porque este proyecto tiene su
 * propio node_modules y su propio bundler, y una importación cruzada obligaría
 * a que el estudio de video conociera el build del sitio. Son diez valores; lo
 * que no se puede permitir es que se separen sin que nadie lo note, así que van
 * con la ruta del original al lado.
 *
 * Fuente: src/data/contenido.json (bloque "tema") y src/index.css.
 */
export const MARCA = {
    acento: '#FF4A1C',
    acentoTinta: '#0A0A0A',
    negro: '#000000',
    superficie1: '#0B0B0B',
    superficie2: '#151515',
    texto1: '#FFFFFF',
    texto2: 'rgba(255,255,255,0.72)',
    texto3: 'rgba(255,255,255,0.52)',
    linea: 'rgba(255,255,255,0.10)',
};

/** La curva de todo el sitio. Una sola desaceleración, reconocible. */
export const SALIDA = [0.16, 1, 0.3, 1];

export const TIPO = {
    titulo: `'CODE Bold', ${JAKARTA}, system-ui, sans-serif`,
    texto: `${JAKARTA}, system-ui, -apple-system, sans-serif`,
};

/*
 * La escena. Es la misma que el panel de guardia de la portada, y no por
 * ahorrar: quien ve el anuncio y entra al sitio tiene que reconocer lo mismo.
 *
 * Espejo de src/data/contenido.json → hero.escena.eventos.
 */
export const EVENTOS = [
    { hora: '01:52', canal: 'WhatsApp', texto: 'Cotización enviada a Laura M.' },
    { hora: '02:03', canal: 'Sitio web', texto: 'Cita agendada · jueves 10:30' },
    { hora: '02:11', canal: 'Instagram', texto: 'Pregunta respondida y clasificada' },
    { hora: '02:14', canal: 'Agenda', texto: 'Recordatorio programado a 24 h' },
];
