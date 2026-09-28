import { eq } from 'drizzle-orm';

import { esquemaCorreo, esquemaNombre } from '@diabolical/esquemas';

import { registrar } from '../auditoria';
import { leerConfig } from '../config';
import { abrirBase, conContexto, SISTEMA } from '../db/base';
import { usuarios } from '../db/esquema';
import { migrar } from '../db/migrar';
import { cifrar, politicaContrasena } from '../seguridad/contrasenas';
import { revocarDeUsuario } from '../seguridad/sesiones';
import { argumento, preguntar, preguntarOculto } from './terminal';

/*
 * Crea la primera cuenta de administrador, o restablece la contraseña de una
 * existente con --restablecer (la salida de emergencia si nadie puede entrar).
 *
 *   npm run cms:crear-admin
 *   npm run cms:crear-admin -- --correo hola@ejemplo.mx --nombre "Ana"
 *   npm run cms:crear-admin -- --restablecer --correo hola@ejemplo.mx
 *
 * La contraseña se pide por terminal, sin eco, y solo se guarda su hash. No se
 * acepta por argumento: quedaría en el historial del shell y en la lista de
 * procesos.
 */

const config = leerConfig();
const restablecer = argumento('restablecer') !== undefined;

const correo = esquemaCorreo.parse(argumento('correo') || (await preguntar('Correo: ')));

const base = await abrirBase(config.baseDatosMigrar);
await migrar(base);
await base.cerrar();

const app = await abrirBase(config.baseDatos);
const [existente] = await conContexto(app.db, SISTEMA, (tx) =>
    tx.select().from(usuarios).where(eq(usuarios.correo, correo)).limit(1)
);

if (existente && !restablecer) {
    console.error('Ya existe una cuenta con ese correo. Para cambiar su contraseña: --restablecer.');
    process.exit(1);
}
if (!existente && restablecer) {
    console.error('No existe ninguna cuenta con ese correo.');
    process.exit(1);
}

const nombre = existente ? existente.nombre : esquemaNombre.parse(argumento('nombre') || (await preguntar('Nombre: ')));

const contrasena = await preguntarOculto('Contraseña: ');
const motivo = politicaContrasena(contrasena, { correo });
if (motivo) {
    console.error(motivo);
    process.exit(1);
}
if (process.stdin.isTTY) {
    const repetida = await preguntarOculto('Repita la contraseña: ');
    if (repetida !== contrasena) {
        console.error('Las contraseñas no coinciden.');
        process.exit(1);
    }
}

const hash = await cifrar(contrasena);

await conContexto(app.db, SISTEMA, async (tx) => {
    if (existente) {
        await tx
            .update(usuarios)
            .set({ hash, contrasenaCambiadaEn: new Date(), intentosFallidos: 0, bloqueos: 0, bloqueadoHasta: null, activo: true })
            .where(eq(usuarios.id, existente.id));
        await revocarDeUsuario(tx, existente.id);
        await registrar(tx, {
            usuarioCorreo: 'terminal',
            accion: 'usuario.contrasena',
            entidad: 'usuario',
            entidadId: existente.id,
            cambios: { desde: 'terminal' },
        });
    } else {
        const [u] = await tx.insert(usuarios).values({ correo, nombre, rol: 'administrador', hash }).returning();
        await registrar(tx, {
            usuarioCorreo: 'terminal',
            accion: 'usuario.crear',
            entidad: 'usuario',
            entidadId: u!.id,
            cambios: { correo, nombre, rol: 'administrador', desde: 'terminal' },
        });
    }
});
await app.cerrar();

console.log(existente ? `Contraseña restablecida para ${correo}.` : `Administrador creado: ${correo}.`);
