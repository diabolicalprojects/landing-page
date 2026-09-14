import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/*
 * Copia al directorio público de este proyecto los assets que la pieza usa del
 * sitio.
 *
 * Podría apuntarse el publicDir de Remotion a ../public y ahorrarse la copia,
 * pero servir un directorio fuera del proyecto no funcionó: el bundler resuelve
 * la fuente y el logotipo contra rutas que no existen. La copia es explícita,
 * se regenera en cada render y video/public está ignorado por git, así que
 * sigue habiendo UNA sola fuente de verdad —la del sitio— y no dos ficheros
 * que se van separando sin que nadie lo note.
 */

const aqui = path.dirname(fileURLToPath(import.meta.url));
const origenSitio = path.join(aqui, '..', '..', 'public');
const destino = path.join(aqui, '..', 'public');

const ASSETS = ['logo-cuadrado-blanco.svg', 'fonts/CODE-Bold.otf'];

// El horizontal vive en src/assets, no en public: se copia con nombre plano
// para que staticFile lo encuentre.
const EXTRA = [
    ['../src/assets/logo/LOGO-DIABOLICAL-HORIZONTAL-BLANCO.svg', 'logo-horizontal-blanco.svg'],
];

let copiados = 0;
for (const relativo of ASSETS) {
    const desde = path.join(origenSitio, relativo);
    const hasta = path.join(destino, relativo);

    if (!fs.existsSync(desde)) {
        console.error(`[video] Falta ${relativo} en el public del sitio. La pieza saldrá incompleta.`);
        process.exitCode = 1;
        continue;
    }

    fs.mkdirSync(path.dirname(hasta), { recursive: true });
    fs.copyFileSync(desde, hasta);
    copiados += 1;
}

for (const [relativo, nombre] of EXTRA) {
    const desde = path.join(aqui, '..', relativo);
    if (!fs.existsSync(desde)) {
        console.error(`[video] Falta ${relativo}. La pieza saldrá sin logotipo.`);
        process.exitCode = 1;
        continue;
    }
    fs.copyFileSync(desde, path.join(destino, nombre));
    copiados += 1;
}

console.log(`[video] ${copiados} de ${ASSETS.length + EXTRA.length} assets del sitio listos en video/public.`);
