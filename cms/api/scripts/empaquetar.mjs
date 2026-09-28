import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

/*
 * Empaqueta la API para producción: el código propio y los esquemas
 * compartidos (TypeScript) van dentro; las dependencias de npm se quedan
 * fuera y se instalan en la imagen, porque algunas son nativas (Argon2) o
 * traen archivos que no se empaquetan (el WebAssembly de PGlite).
 */

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, '..');
const paquete = JSON.parse(readFileSync(path.join(raiz, 'package.json'), 'utf8'));
const externas = Object.keys(paquete.dependencies).filter((d) => !d.startsWith('@diabolical/'));

await build({
    absWorkingDir: raiz,
    entryPoints: {
        servidor: 'src/servidor.ts',
        'crear-admin': 'src/cli/crear-admin.ts',
        migrar: 'src/cli/migrar.ts',
    },
    outdir: 'dist',
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'esm',
    sourcemap: true,
    external: externas.flatMap((d) => [d, `${d}/*`]),
    logLevel: 'info',
});
