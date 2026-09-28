/*
 * 0001 · Acceso: usuarios, sesiones, dispositivos conocidos y auditoría.
 *
 * Seguridad en dos capas: la API comprueba permisos en cada ruta y, además,
 * Postgres aplica Row Level Security. La aplicación nunca se conecta como dueña
 * de las tablas: trabaja con el rol `cms_app`, sujeto a las políticas, y en
 * cada transacción declara quién es (`app.rol`, `app.usuario_id`).
 *
 *   sistema         lo que ocurre antes de saber quién es (el login, validar
 *                   una cookie). Solo lo fija el código de acceso.
 *   administrador   todo
 *   editor, lector  sus propios datos
 *
 * En producción el rol `cms_app` se crea antes, con LOGIN y contraseña (es un
 * secreto: no puede vivir en una migración). Aquí solo se crea si falta, sin
 * login, que es lo que necesitan el desarrollo y las pruebas.
 */
export default /* sql */ `
do $$
begin
    create role cms_app nologin;
exception when duplicate_object then
    null;
end
$$;

create function cms_rol() returns text
language sql stable
as $$ select coalesce(nullif(current_setting('app.rol', true), ''), 'anonimo') $$;

create function cms_usuario() returns uuid
language sql stable
as $$ select nullif(current_setting('app.usuario_id', true), '')::uuid $$;

create type rol_cms as enum ('administrador', 'editor', 'lector');

create table usuarios (
    id uuid primary key default gen_random_uuid(),
    correo text not null unique check (correo = lower(correo)),
    nombre text not null check (length(nombre) between 1 and 80),
    rol rol_cms not null default 'editor',
    hash text not null,
    activo boolean not null default true,
    intentos_fallidos integer not null default 0,
    bloqueos integer not null default 0,
    bloqueado_hasta timestamptz,
    contrasena_cambiada_en timestamptz not null default now(),
    ultimo_acceso timestamptz,
    creado_en timestamptz not null default now(),
    actualizado_en timestamptz not null default now()
);

create table sesiones (
    id text primary key,
    publico uuid not null unique default gen_random_uuid(),
    usuario_id uuid not null references usuarios(id) on delete cascade,
    ip text,
    agente text,
    dispositivo text not null default '',
    creada_en timestamptz not null default now(),
    ultimo_uso timestamptz not null default now(),
    expira_en timestamptz not null,
    revocada_en timestamptz
);
create index sesiones_usuario on sesiones (usuario_id);

create table dispositivos (
    usuario_id uuid not null references usuarios(id) on delete cascade,
    huella text not null,
    descripcion text not null default '',
    visto_primero timestamptz not null default now(),
    visto_ultimo timestamptz not null default now(),
    primary key (usuario_id, huella)
);

create table auditoria (
    id bigint generated always as identity primary key,
    fecha timestamptz not null default now(),
    usuario_id uuid references usuarios(id) on delete set null,
    usuario_correo text,
    accion text not null,
    entidad text not null,
    entidad_id text,
    cambios jsonb,
    ip text,
    agente text
);
create index auditoria_fecha on auditoria (fecha desc, id desc);
create index auditoria_usuario on auditoria (usuario_id, fecha desc);

-- Un usuario puede cambiar su nombre y su contraseña, pero no su rol, su
-- estado ni su correo: eso es cosa de un administrador. RLS protege filas, no
-- columnas; esto protege las columnas.
create function usuarios_proteger() returns trigger
language plpgsql
as $$
begin
    if cms_rol() not in ('administrador', 'sistema') then
        if new.rol is distinct from old.rol
            or new.activo is distinct from old.activo
            or new.correo is distinct from old.correo then
            raise exception 'Sin permiso para cambiar rol, estado o correo'
                using errcode = '42501';
        end if;
    end if;
    new.actualizado_en := now();
    return new;
end
$$;
create trigger usuarios_proteger before update on usuarios
    for each row execute function usuarios_proteger();

-- La auditoría solo crece: nadie la edita ni la borra, tampoco un administrador.
grant usage on schema public to cms_app;
grant select, insert, update on usuarios to cms_app;
grant select, insert, update, delete on sesiones to cms_app;
grant select, insert, update on dispositivos to cms_app;
grant select, insert on auditoria to cms_app;
grant usage on sequence auditoria_id_seq to cms_app;
grant execute on function cms_rol(), cms_usuario() to cms_app;

alter table usuarios enable row level security;
alter table sesiones enable row level security;
alter table dispositivos enable row level security;
alter table auditoria enable row level security;

create policy usuarios_gestion on usuarios
    using (cms_rol() in ('administrador', 'sistema'))
    with check (cms_rol() in ('administrador', 'sistema'));
create policy usuarios_propio_ver on usuarios for select
    using (id = cms_usuario());
create policy usuarios_propio_editar on usuarios for update
    using (id = cms_usuario())
    with check (id = cms_usuario());

create policy sesiones_gestion on sesiones
    using (cms_rol() in ('administrador', 'sistema'))
    with check (cms_rol() in ('administrador', 'sistema'));
create policy sesiones_propias on sesiones
    using (usuario_id = cms_usuario())
    with check (usuario_id = cms_usuario());

create policy dispositivos_sistema on dispositivos
    using (cms_rol() = 'sistema')
    with check (cms_rol() = 'sistema');

create policy auditoria_insertar on auditoria for insert
    with check (cms_rol() <> 'anonimo');
create policy auditoria_ver_todo on auditoria for select
    using (cms_rol() = 'administrador');
create policy auditoria_ver_propia on auditoria for select
    using (usuario_id = cms_usuario());
`;
