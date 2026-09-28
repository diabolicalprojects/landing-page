import { leerConfig } from '../config';
import { abrirBase } from '../db/base';
import { migrar } from '../db/migrar';

/* Aplica las migraciones pendientes con la conexión del dueño del esquema. */

const config = leerConfig();
const base = await abrirBase(config.baseDatosMigrar);
const aplicadas = await migrar(base);
await base.cerrar();
console.log(aplicadas.length ? `Migraciones aplicadas: ${aplicadas.join(', ')}` : 'No había migraciones pendientes.');
