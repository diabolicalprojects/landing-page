# Esquema de datos del CMS

La fuente de verdad son las migraciones SQL (`cms/api/src/db/migraciones`). Drizzle (`cms/api/src/db/esquema.ts`) solo tipa las consultas; las pruebas migran y consultan con él, así que si se desalinean, fallan.

## Fase 1: acceso

```mermaid
erDiagram
    USUARIOS ||--o{ SESIONES : abre
    USUARIOS ||--o{ DISPOSITIVOS : "entra desde"
    USUARIOS ||--o{ AUDITORIA : registra

    USUARIOS {
        uuid id PK
        text correo UK "siempre en minúsculas"
        text nombre
        rol_cms rol "administrador · editor · lector"
        text hash "Argon2id"
        bool activo
        int intentos_fallidos
        int bloqueos "para el bloqueo progresivo"
        timestamptz bloqueado_hasta
        timestamptz contrasena_cambiada_en
        timestamptz ultimo_acceso
    }
    SESIONES {
        text id PK "SHA-256 del token de la cookie"
        uuid publico UK "lo único que ve el panel"
        uuid usuario_id FK
        text ip
        text agente
        text dispositivo "Chrome en Windows"
        timestamptz ultimo_uso
        timestamptz expira_en "30 días"
        timestamptz revocada_en
    }
    DISPOSITIVOS {
        uuid usuario_id PK
        text huella PK "navegador, sistema y prefijo de IP"
        timestamptz visto_primero
        timestamptz visto_ultimo
    }
    AUDITORIA {
        bigint id PK
        timestamptz fecha
        uuid usuario_id FK
        text usuario_correo "copia: sobrevive a cambios"
        text accion
        text entidad
        text entidad_id
        jsonb cambios "antes y después, nunca contraseñas"
        text ip
    }
```

## Roles de base de datos

| Rol | Para qué | Sujeto a RLS |
|---|---|---|
| `cms_dueno` | Dueño del esquema. Solo lo usan las migraciones. | No (es el dueño) |
| `cms_app` | La aplicación. Sin `DELETE` en usuarios ni auditoría. | Sí |

Cada transacción de la aplicación declara su contexto: `app.rol` (`sistema`, `administrador`, `editor`, `lector`) y `app.usuario_id`. `sistema` es lo que ocurre antes de saber quién es: el inicio de sesión y la validación de la cookie.

## Políticas

| Tabla | Quién ve | Quién cambia |
|---|---|---|
| usuarios | Administrador y sistema: todas. Cada usuario: su fila. | Administrador y sistema: todo. Cada usuario: su nombre y su contraseña; un disparador impide que cambie su rol, su estado o su correo. Nadie borra. |
| sesiones | Administrador y sistema: todas. Cada usuario: las suyas. | Igual. |
| dispositivos | Solo sistema. | Solo sistema. |
| auditoria | Administrador: todo. Cada usuario: sus propios registros. | Solo inserción, con contexto. Nadie la edita ni la borra, tampoco un administrador. |

Todo esto está probado en `cms/api/test/rls.test.ts` directamente contra la base de datos, sin pasar por la API.
