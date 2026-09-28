import { crearApp } from './app';
import { leerConfig } from './config';
import { abrirBase } from './db/base';
import { migrar } from './db/migrar';
import { limpiarSesiones } from './seguridad/sesiones';

/*
 * Arranque del CMS.
 *
 * Migra al arrancar con la conexión del dueño del esquema y después trabaja
 * con la de cms_app. Con PGlite (desarrollo) es la misma conexión.
 */

const config = leerConfig();

if (config.baseDatosMigrar !== config.baseDatos && !config.baseDatosMigrar.startsWith('pglite:')) {
    const dueno = await abrirBase(config.baseDatosMigrar);
    const aplicadas = await migrar(dueno);
    await dueno.cerrar();
    if (aplicadas.length) console.log(`[cms] Migraciones aplicadas: ${aplicadas.join(', ')}`);
}

const base = await abrirBase(config.baseDatos);
if (config.baseDatos.startsWith('pglite:')) {
    const aplicadas = await migrar(base);
    if (aplicadas.length) console.log(`[cms] Migraciones aplicadas: ${aplicadas.join(', ')}`);
}

const app = await crearApp({ config, base });

const limpieza = setInterval(
    () => {
        limpiarSesiones(base.db).catch((e) => app.log.warn({ err: e }, 'No se pudieron limpiar las sesiones'));
    },
    6 * 60 * 60 * 1000
);
limpieza.unref();

const cerrar = async (senal: string) => {
    app.log.info(`${senal}: cerrando el CMS`);
    clearInterval(limpieza);
    await app.close();
    await base.cerrar();
    process.exit(0);
};
process.on('SIGTERM', () => void cerrar('SIGTERM'));
process.on('SIGINT', () => void cerrar('SIGINT'));

await app.listen({ port: config.puerto, host: config.host });
