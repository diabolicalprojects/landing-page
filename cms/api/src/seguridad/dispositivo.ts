import { createHash } from 'node:crypto';

/*
 * Una descripción legible del dispositivo («Chrome en Windows») y una huella
 * aproximada para reconocer si ya se había entrado desde él. La huella mezcla
 * navegador, sistema y el prefijo de la IP: un cambio de red en la misma
 * ciudad no dispara el aviso, un país distinto sí.
 */

const NAVEGADORES: [RegExp, string][] = [
    [/Edg\//, 'Edge'],
    [/OPR\/|Opera/, 'Opera'],
    [/Firefox\//, 'Firefox'],
    [/Chrome\//, 'Chrome'],
    [/Safari\//, 'Safari'],
];

const SISTEMAS: [RegExp, string][] = [
    [/Windows/, 'Windows'],
    [/iPhone|iPad|iOS/, 'iOS'],
    [/Android/, 'Android'],
    [/Mac OS X|Macintosh/, 'macOS'],
    [/Linux/, 'Linux'],
];

export function describirAgente(agente: string | undefined): string {
    if (!agente) return 'Dispositivo desconocido';
    const navegador = NAVEGADORES.find(([r]) => r.test(agente))?.[1] ?? 'Navegador';
    const sistema = SISTEMAS.find(([r]) => r.test(agente))?.[1];
    return sistema ? `${navegador} en ${sistema}` : navegador;
}

function prefijoIp(ip: string | undefined): string {
    if (!ip) return '';
    if (ip.includes(':')) return ip.split(':').slice(0, 3).join(':');
    return ip.split('.').slice(0, 2).join('.');
}

export function huellaDispositivo(agente: string | undefined, ip: string | undefined): string {
    return createHash('sha256')
        .update(`${describirAgente(agente)}|${prefijoIp(ip)}`)
        .digest('hex')
        .slice(0, 32);
}
