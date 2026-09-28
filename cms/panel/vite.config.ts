import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// El panel vive en /admin. En desarrollo, la API corre aparte (npm run cms:dev:api)
// y Vite le pasa /admin/api.
export default defineConfig({
    base: '/admin/',
    plugins: [react()],
    server: {
        port: 5174,
        strictPort: true,
        proxy: {
            '/admin/api': { target: 'http://localhost:3100' },
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        reportCompressedSize: false,
    },
});
