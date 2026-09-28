import { describe, expect, it } from 'vitest';

import { duracionBloqueo } from '../src/rutas/acceso';
import { cifrar, comprobar, necesitaRecifrar, politicaContrasena } from '../src/seguridad/contrasenas';
import { describirAgente, huellaDispositivo } from '../src/seguridad/dispositivo';

describe('política de contraseñas (NIST SP 800-63B)', () => {
    it('pide al menos 8 caracteres', () => {
        expect(politicaContrasena('corta')).toMatch(/al menos 8/);
    });

    it('rechaza contraseñas de listas filtradas, sin importar mayúsculas', () => {
        expect(politicaContrasena('password')).toMatch(/filtradas/);
        expect(politicaContrasena('Qwerty123')).toMatch(/filtradas/);
    });

    it('rechaza la que contiene el correo', () => {
        expect(politicaContrasena('humberto-2026-x', { correo: 'humberto@ejemplo.mx' })).toMatch(/correo/);
    });

    it('acepta una contraseña larga y poco común', () => {
        expect(politicaContrasena('tres-cabinas-libres-a-las-5')).toBeNull();
    });
});

describe('Argon2id', () => {
    it('cifra con Argon2id y los parámetros de OWASP, y comprueba', async () => {
        const hash = await cifrar('una-frase-de-prueba-larga');
        expect(hash.startsWith('$argon2id$')).toBe(true);
        expect(necesitaRecifrar(hash)).toBe(false);
        expect(await comprobar(hash, 'una-frase-de-prueba-larga')).toBe(true);
        expect(await comprobar(hash, 'otra')).toBe(false);
    });

    it('un hash roto no lanza: simplemente no coincide', async () => {
        expect(await comprobar('no-es-un-hash', 'x')).toBe(false);
    });
});

describe('bloqueo progresivo', () => {
    it('empieza en 15 minutos, se dobla y no pasa de 24 horas', () => {
        expect(duracionBloqueo(0)).toBe(15 * 60 * 1000);
        expect(duracionBloqueo(1)).toBe(30 * 60 * 1000);
        expect(duracionBloqueo(10)).toBe(24 * 60 * 60 * 1000);
    });
});

describe('dispositivos', () => {
    it('describe el navegador y el sistema', () => {
        expect(describirAgente('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36')).toBe('Chrome en Windows');
        expect(describirAgente('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile Safari/604.1')).toBe('Safari en iOS');
        expect(describirAgente(undefined)).toBe('Dispositivo desconocido');
    });

    it('la huella no cambia con la IP de la misma red, sí con otra red', () => {
        const ua = 'Mozilla/5.0 (Windows NT 10.0) Chrome/130.0';
        expect(huellaDispositivo(ua, '189.203.10.5')).toBe(huellaDispositivo(ua, '189.203.77.9'));
        expect(huellaDispositivo(ua, '189.203.10.5')).not.toBe(huellaDispositivo(ua, '45.12.10.5'));
    });
});
