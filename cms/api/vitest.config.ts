import { defineConfig } from 'vitest/config';

// Cada archivo de pruebas levanta su propio Postgres (PGlite) en memoria. Contra
// un Postgres real (CMS_BASE_DATOS_PRUEBAS, en el CI) comparten base, así que
// van de uno en uno.
export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        environment: 'node',
        pool: 'forks',
        fileParallelism: !process.env.CMS_BASE_DATOS_PRUEBAS,
        testTimeout: 30_000,
        hookTimeout: 60_000,
    },
});
