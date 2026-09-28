import { ACCIONES, type Accion } from '@diabolical/esquemas';

/* Fechas y textos, en español de México y con la hora de Aguascalientes. */

const ZONA = 'America/Mexico_City';

const hora = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', timeZone: ZONA });
const diaHora = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: ZONA,
});
const completa = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short', timeZone: ZONA });
const diaDe = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA });

/** «hace 3 min», «hoy a las 14:05», «ayer a las 9:30», «12 sept, 18:40». */
export function relativa(iso: string, ahora = new Date()): string {
    const fecha = new Date(iso);
    const segundos = Math.round((ahora.getTime() - fecha.getTime()) / 1000);
    if (segundos < 45) return 'hace un momento';
    if (segundos < 3600) return `hace ${Math.round(segundos / 60)} min`;
    const hoy = diaDe.format(ahora);
    const ayer = diaDe.format(new Date(ahora.getTime() - 86_400_000));
    const dia = diaDe.format(fecha);
    if (dia === hoy) return `hoy a las ${hora.format(fecha)}`;
    if (dia === ayer) return `ayer a las ${hora.format(fecha)}`;
    return diaHora.format(fecha);
}

/** «14:35», o «27 sept, 14:35» si no es hoy. Para momentos futuros. */
export function momento(iso: string, ahora = new Date()): string {
    const fecha = new Date(iso);
    return diaDe.format(fecha) === diaDe.format(ahora) ? `las ${hora.format(fecha)}` : `el ${diaHora.format(fecha)}`;
}

export function fechaCompleta(iso: string): string {
    return completa.format(new Date(iso));
}

export function nombreAccion(accion: string): string {
    return ACCIONES[accion as Accion] ?? accion;
}
