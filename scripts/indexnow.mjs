#!/usr/bin/env node
/**
 * Avisa a IndexNow (Bing, Yandex, Seznam) de todas las URLs públicas del sitio.
 *
 * Se ejecuta a mano después de cada despliegue:  npm run indexnow
 *
 * Existe porque el sitio no está en el índice de Bing, y el índice de Bing es
 * del que tira la búsqueda de ChatGPT. Esperar a que Bing pase a rastrear un
 * dominio nuevo puede tardar semanas; IndexNow lo empuja en el momento.
 *
 * No falla el despliegue si el aviso no sale: se ejecuta aparte del build a
 * propósito.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const config = require('../server/config');
const { RUTAS_PUBLICAS } = require('../server/schema');

const clave = config.indexNowKey;

if (!clave) {
    console.error(
        '[indexnow] Falta INDEXNOW_KEY en el entorno (o no es hexadecimal de 8 a 128). No se envía nada.'
    );
    process.exit(1);
}

const urlList = RUTAS_PUBLICAS.map((ruta) => `${config.siteUrl}${ruta}`);

const respuesta = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
        host: new URL(config.siteUrl).host,
        key: clave,
        keyLocation: `${config.siteUrl}/${clave}.txt`,
        urlList,
    }),
});

// 200 = aceptado. 202 = aceptado, clave pendiente de validar. El resto es fallo.
const ok = respuesta.status === 200 || respuesta.status === 202;
console.log(`[indexnow] ${urlList.length} URLs enviadas → HTTP ${respuesta.status} ${ok ? 'OK' : 'FALLO'}`);
if (!ok) console.error(`[indexnow] ${(await respuesta.text()).slice(0, 300)}`);

process.exit(ok ? 0 : 1);
