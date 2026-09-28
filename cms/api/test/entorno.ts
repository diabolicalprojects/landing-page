import { randomUUID } from 'node:crypto';

import type { FastifyInstance } from 'fastify';

import type { Rol } from '@diabolical/esquemas';

import { crearApp } from '../src/app';
import { leerConfig } from '../src/config';
import type { Mensaje } from '../src/correo';
import { abrirBase, conContexto, SISTEMA, type Base } from '../src/db/base';
import { usuarios } from '../src/db/esquema';
import { migrar } from '../src/db/migrar';
import { cifrar } from '../src/seguridad/contrasenas';

/*
 * Un CMS completo para cada archivo de pruebas: Postgres en memoria (PGlite),
 * migrado, con la aplicación real encima. `CMS_BASE_DATOS` permite correr las
 * mismas pruebas contra un Postgres de verdad (así lo hace el CI).
 */

export const ORIGEN = 'http://localhost:5174';

export interface Entorno {
    app: FastifyInstance;
    base: Base;
    correos: Mensaje[];
    crearUsuario(rol: Rol, extra?: { activo?: boolean }): Promise<{ id: string; correo: string; contrasena: string }>;
    entrar(correo: string, contrasena: string, agente?: string): Promise<string>;
    cerrar(): Promise<void>;
}

export async function crearEntorno(opciones: { limiteAcceso?: number } = {}): Promise<Entorno> {
    const url = process.env.CMS_BASE_DATOS_PRUEBAS ?? 'pglite:memoria';
    const config = leerConfig({
        NODE_ENV: 'test',
        CMS_ORIGEN: ORIGEN,
        CMS_BASE_DATOS: 'pglite:memoria',
        CMS_PANEL_DIR: '/no-existe',
        // Todas las pruebas entran desde la misma IP; el límite real se prueba aparte.
        CMS_LIMITE_ACCESO: String(opciones.limiteAcceso ?? 1000),
    });
    // Contra un Postgres real, cada entorno tiene su propia base, que se crea
    // aquí y se borra al cerrar: dos entornos del mismo archivo no se pisan.
    let urlEntorno = url;
    let borrarBase: (() => Promise<void>) | null = null;
    if (url.startsWith('postgres')) {
        const { default: pg } = await import('pg');
        const nombre = `cms_prueba_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
        const servidor = new pg.Client({ connectionString: url });
        await servidor.connect();
        await servidor.query(`create database ${nombre}`);
        await servidor.end();
        const destino = new URL(url);
        destino.pathname = `/${nombre}`;
        urlEntorno = destino.toString();
        borrarBase = async () => {
            const limpieza = new pg.Client({ connectionString: url });
            await limpieza.connect();
            await limpieza.query(`drop database if exists ${nombre} with (force)`);
            await limpieza.end();
        };
    }

    const base = await abrirBase(urlEntorno);
    await migrar(base);

    const correos: Mensaje[] = [];
    const app = await crearApp({
        config,
        base,
        enviarCorreo: async (m) => {
            correos.push(m);
            return true;
        },
    });
    await app.ready();

    return {
        app,
        base,
        correos,
        async crearUsuario(rol, extra = {}) {
            const correo = `${rol}-${randomUUID().slice(0, 8)}@prueba.mx`;
            const contrasena = `prueba-${randomUUID()}`;
            const hash = await cifrar(contrasena);
            const [u] = await conContexto(base.db, SISTEMA, (tx) =>
                tx
                    .insert(usuarios)
                    .values({ correo, nombre: `Persona ${rol}`, rol, hash, activo: extra.activo ?? true })
                    .returning()
            );
            return { id: u!.id, correo, contrasena };
        },
        async entrar(correo, contrasena, agente = 'Mozilla/5.0 (Windows NT 10.0) Chrome/130.0') {
            const r = await app.inject({
                method: 'POST',
                url: '/admin/api/sesion',
                headers: { 'x-cms': '1', origin: ORIGEN, 'user-agent': agente },
                payload: { correo, contrasena },
            });
            if (r.statusCode !== 200) throw new Error(`No se pudo entrar: ${r.statusCode} ${r.body}`);
            const cookie = r.cookies.find((c) => c.name === 'cms_sesion');
            return `cms_sesion=${cookie!.value}`;
        },
        async cerrar() {
            await app.close();
            await base.cerrar();
            await borrarBase?.();
        },
    };
}

/** Cabeceras de una petición del panel con la sesión dada. */
export function del(cookie: string) {
    return { cookie, 'x-cms': '1', origin: ORIGEN };
}
