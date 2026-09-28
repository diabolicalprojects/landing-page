import { describe, expect, it } from 'vitest';

import {
    esquemaCambiarContrasena,
    esquemaCrearUsuario,
    esquemaInicioSesion,
    permisosDe,
    puede,
} from '../src';

describe('roles y permisos', () => {
    it('el administrador puede todo', () => {
        expect(puede('administrador', 'usuarios:gestionar')).toBe(true);
        expect(puede('administrador', 'codigo:gestionar')).toBe(true);
    });

    it('el editor edita contenido pero no toca usuarios, ajustes ni código', () => {
        expect(puede('editor', 'contenido:editar')).toBe(true);
        expect(puede('editor', 'usuarios:gestionar')).toBe(false);
        expect(puede('editor', 'ajustes:gestionar')).toBe(false);
        expect(puede('editor', 'codigo:gestionar')).toBe(false);
        expect(puede('editor', 'auditoria:ver')).toBe(false);
    });

    it('solo lectura no puede cambiar nada', () => {
        const permisos = permisosDe('lector');
        expect(permisos.every((p) => p.endsWith(':ver'))).toBe(true);
    });
});

describe('validación de acceso', () => {
    it('normaliza el correo a minúsculas y sin espacios', () => {
        const r = esquemaInicioSesion.parse({ correo: '  Ana@Ejemplo.MX ', contrasena: 'x' });
        expect(r.correo).toBe('ana@ejemplo.mx');
    });

    it('rechaza contraseñas de menos de 8 caracteres al crear', () => {
        const r = esquemaCrearUsuario.safeParse({
            correo: 'ana@ejemplo.mx',
            nombre: 'Ana',
            rol: 'editor',
            contrasena: 'corta',
        });
        expect(r.success).toBe(false);
    });

    it('rechaza un rol inventado', () => {
        const r = esquemaCrearUsuario.safeParse({
            correo: 'ana@ejemplo.mx',
            nombre: 'Ana',
            rol: 'superadmin',
            contrasena: 'larga-y-rara-2026',
        });
        expect(r.success).toBe(false);
    });

    it('pide la contraseña actual para cambiarla', () => {
        expect(esquemaCambiarContrasena.safeParse({ actual: '', nueva: 'otra-mas-larga' }).success).toBe(false);
    });
});
