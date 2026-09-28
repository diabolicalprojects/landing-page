import {
    bigint,
    boolean,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';

/*
 * El esquema, tal como lo ve Drizzle para tipar las consultas. La fuente de
 * verdad son las migraciones SQL (db/migraciones): allí están también el RLS,
 * los permisos y los disparadores, que Drizzle no describe. Las pruebas
 * ejecutan las migraciones y consultan con este esquema, así que si se
 * desalinean, fallan.
 */

const fecha = (nombre: string) => timestamp(nombre, { withTimezone: true, mode: 'date' });

export const rolCms = pgEnum('rol_cms', ['administrador', 'editor', 'lector']);

export const usuarios = pgTable('usuarios', {
    id: uuid('id').primaryKey().defaultRandom(),
    correo: text('correo').notNull().unique(),
    nombre: text('nombre').notNull(),
    rol: rolCms('rol').notNull().default('editor'),
    hash: text('hash').notNull(),
    activo: boolean('activo').notNull().default(true),
    intentosFallidos: integer('intentos_fallidos').notNull().default(0),
    bloqueos: integer('bloqueos').notNull().default(0),
    bloqueadoHasta: fecha('bloqueado_hasta'),
    contrasenaCambiadaEn: fecha('contrasena_cambiada_en').notNull().defaultNow(),
    ultimoAcceso: fecha('ultimo_acceso'),
    creadoEn: fecha('creado_en').notNull().defaultNow(),
    actualizadoEn: fecha('actualizado_en').notNull().defaultNow(),
});

export const sesiones = pgTable('sesiones', {
    id: text('id').primaryKey(),
    publico: uuid('publico').notNull().defaultRandom(),
    usuarioId: uuid('usuario_id')
        .notNull()
        .references(() => usuarios.id),
    ip: text('ip'),
    agente: text('agente'),
    dispositivo: text('dispositivo').notNull().default(''),
    creadaEn: fecha('creada_en').notNull().defaultNow(),
    ultimoUso: fecha('ultimo_uso').notNull().defaultNow(),
    expiraEn: fecha('expira_en').notNull(),
    revocadaEn: fecha('revocada_en'),
});

export const dispositivos = pgTable(
    'dispositivos',
    {
        usuarioId: uuid('usuario_id').notNull(),
        huella: text('huella').notNull(),
        descripcion: text('descripcion').notNull().default(''),
        vistoPrimero: fecha('visto_primero').notNull().defaultNow(),
        vistoUltimo: fecha('visto_ultimo').notNull().defaultNow(),
    },
    (t) => [primaryKey({ columns: [t.usuarioId, t.huella] })]
);

export const auditoria = pgTable('auditoria', {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    fecha: fecha('fecha').notNull().defaultNow(),
    usuarioId: uuid('usuario_id'),
    usuarioCorreo: text('usuario_correo'),
    accion: text('accion').notNull(),
    entidad: text('entidad').notNull(),
    entidadId: text('entidad_id'),
    cambios: jsonb('cambios').$type<Record<string, unknown>>(),
    ip: text('ip'),
    agente: text('agente'),
});

export const esquema = { rolCms, usuarios, sesiones, dispositivos, auditoria };
export type Esquema = typeof esquema;
export type Usuario = typeof usuarios.$inferSelect;
