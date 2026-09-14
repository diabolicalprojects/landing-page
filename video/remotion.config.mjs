import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Config } from '@remotion/cli/config';

const aqui = path.dirname(fileURLToPath(import.meta.url));

/*
 * El directorio público es el de este proyecto, y scripts/preparar.mjs copia
 * ahí el logotipo y la fuente DEL SITIO antes de cada render.
 *
 * Apuntar directamente a ../public sería más corto pero no funciona: el bundler
 * no resuelve assets de un directorio fuera del proyecto. Con la copia sigue
 * habiendo una sola fuente de verdad —la del sitio— y el anuncio no puede
 * acabar con una tipografía distinta a la de la web.
 */
Config.setPublicDir(path.join(aqui, 'public'));

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// H.264 en MP4: es lo que aceptan Instagram, Facebook y los gestores de
// anuncios sin recodificar. Un WebM más ligero no les sirve.
Config.setCodec('h264');
