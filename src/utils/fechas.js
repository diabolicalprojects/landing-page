/*
 * Fecha legible sin depender de la zona horaria del navegador: partir la
 * cadena ISO evita que un artículo publicado hoy se muestre como de ayer al
 * otro lado del meridiano.
 */
const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export const fechaLegible = (iso) => {
    const [anio, mes, dia] = iso.split('-');
    return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${anio}`;
};
