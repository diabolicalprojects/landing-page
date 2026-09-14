# Estudio de video

Piezas de video y de imagen hechas con [Remotion](https://remotion.dev): React
que se renderiza a MP4 fotograma a fotograma.

## Por qué está separado del sitio

Este directorio tiene su **propio `package.json` y su propio `node_modules`**, y
está excluido en `.dockerignore`. No es manía de orden:

El `Dockerfile` construye el sitio **en el servidor de producción**, y ahí ya
murieron tres despliegues seguidos por falta de memoria — uno se llevó por
delante el sitio, el panel de despliegue y la app de un cliente. Si Remotion
estuviera en las dependencias de desarrollo del sitio, `npm ci` lo instalaría
—junto al Chrome que necesita para renderizar— en **cada despliegue**. Separado,
el servidor de producción ni se entera de que esto existe.

El precio es tener que instalar aparte. Vale la pena.

## Uso

```bash
cd video
npm install        # la primera vez
npm run studio     # editor visual, con línea de tiempo
npm run render     # genera los dos videos en video/out/
```

La primera ejecución descarga un Chrome sin interfaz (unos 150 MB). Es una vez.

### Lo que produce

| Comando | Salida | Para qué |
|---|---|---|
| `npm run render` | `out/guardia-cuadrada.mp4` (1080×1080) | Instagram y Facebook |
| | `out/guardia-horizontal.mp4` (1920×1080) | Anuncios y YouTube |
| `npm run og` | `../public/og-image.png` | La imagen al compartir el enlace **(sobrescribe la actual)** |

Diez segundos cada uno, 30 fps, H.264. Es lo que aceptan los gestores de
anuncios sin recodificar.

## La pieza

«Guardia nocturna» es la misma escena que preside la portada: el reloj corre de
madrugada y los avisos van entrando mientras el negocio está cerrado. Cuenta el
argumento entero sin una sola cifra inventada — no dice cuánto mejora nada,
enseña el sistema trabajando a las dos de la mañana.

Lleva el aviso «Escena ilustrativa del sistema en marcha. No es un cliente real»
**dentro de la pieza**, no en la descripción del post: el video circula solo y la
descripción se queda atrás en cuanto alguien lo reenvía.

En apaisado el panel y la frase conviven. En cuadrado no caben, así que el
cierre releva al panel a los seis segundos y medio.

## De dónde salen la marca y los assets

`scripts/preparar.mjs` copia a `video/public/` el logotipo y la fuente **del
sitio** antes de cada render. Se ejecuta solo (`prerender`, `prestudio`), así que
no hay que acordarse.

Los colores y las horas están en `src/marca.js`, con la ruta del original al
lado. Si cambias el acento en el panel de `/admin`, **este fichero no se entera**:
actualízalo a mano o el anuncio saldrá con el color viejo. Son diez valores; se
duplican a conciencia para que el estudio de video no tenga que conocer el build
del sitio.

`video/public/`, `video/out/` y `video/node_modules/` están ignorados por git.
Los videos renderizados no se versionan: se regeneran con un comando.
