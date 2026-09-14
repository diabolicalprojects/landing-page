import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Build de servidor usado solo por el prerender. Emite .mjs porque el paquete es
 * CommonJS y Node trataría un .js como CJS al importarlo.
 */
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        ssr: 'src/entry-server.jsx',
        outDir: '.ssr',
        emptyOutDir: true,
        // Igual que en el build de cliente: no comprimir solo para informar.
        reportCompressedSize: false,
        rollupOptions: {
            output: { entryFileNames: 'entry-server.mjs' },
        },
    },
});
