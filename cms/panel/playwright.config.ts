import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from '@playwright/test';

/*
 * E2E del panel contra la API real, con Postgres en memoria. Las credenciales
 * del administrador de prueba se generan en cada ejecución: no hay ninguna
 * guardada en el repositorio.
 *
 * Usa el Chrome instalado en la máquina (y el de los runners de GitHub), así
 * que no hace falta descargar navegadores.
 */

const aqui = path.dirname(fileURLToPath(import.meta.url));
const PUERTO = 3199;

process.env.CMS_E2E_CORREO ??= 'e2e@prueba.local';
process.env.CMS_E2E_CONTRASENA ??= `e2e-${randomBytes(12).toString('base64url')}`;

export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    fullyParallel: false,
    workers: 1,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: `http://localhost:${PUERTO}`,
        channel: 'chrome',
        trace: 'retain-on-failure',
        locale: 'es-MX',
        timezoneId: 'America/Mexico_City',
    },
    projects: [
        { name: 'escritorio', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
        { name: 'telefono', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    ],
    webServer: {
        command: 'npx tsx scripts/servidor-e2e.ts',
        cwd: path.resolve(aqui, '../api'),
        url: `http://localhost:${PUERTO}/admin/api/salud`,
        reuseExistingServer: false,
        timeout: 60_000,
        env: {
            CMS_PUERTO: String(PUERTO),
            CMS_PANEL_DIR: path.resolve(aqui, 'dist'),
            CMS_E2E_CORREO: process.env.CMS_E2E_CORREO,
            CMS_E2E_CONTRASENA: process.env.CMS_E2E_CONTRASENA,
        },
    },
});
