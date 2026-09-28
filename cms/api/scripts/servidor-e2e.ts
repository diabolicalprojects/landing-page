import { crearApp } from '../src/app';
import { leerConfig } from '../src/config';
import { abrirBase, conContexto, SISTEMA } from '../src/db/base';
import { usuarios } from '../src/db/esquema';
import { migrar } from '../src/db/migrar';
import { cifrar } from '../src/seguridad/contrasenas';

/*
 * Servidor para las pruebas E2E: Postgres en memoria, un administrador con las
 * credenciales que genera la configuración de Playwright en cada ejecución, y
 * el panel compilado. Nada de esto toca datos reales.
 */

const correo = process.env.CMS_E2E_CORREO;
const contrasena = process.env.CMS_E2E_CONTRASENA;
if (!correo || !contrasena) throw new Error('Faltan CMS_E2E_CORREO y CMS_E2E_CONTRASENA');

const puerto = Number(process.env.CMS_PUERTO ?? 3199);
const config = leerConfig({
    ...process.env,
    NODE_ENV: 'test',
    CMS_BASE_DATOS: 'pglite:memoria',
    CMS_ORIGEN: `http://localhost:${puerto}`,
    CMS_PUERTO: String(puerto),
});

const base = await abrirBase(config.baseDatos);
await migrar(base);
const hash = await cifrar(contrasena);
await conContexto(base.db, SISTEMA, (tx) =>
    tx.insert(usuarios).values({ correo, nombre: 'Administración E2E', rol: 'administrador', hash })
);

const app = await crearApp({ config, base, enviarCorreo: async () => true });
await app.listen({ port: puerto, host: '127.0.0.1' });
console.log(`[e2e] CMS en http://localhost:${puerto}/admin/`);
