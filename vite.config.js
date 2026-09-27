import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/*
 * Los comentarios de index.html son notas para quien mantiene el sitio: se
 * quedan en el repositorio y no viajan a producción, donde cualquiera los lee
 * con el inspector. Se conservan los dos marcadores entre los que el servidor
 * inyecta el SEO de cada página (server/render.js).
 */
const sinComentarios = () => ({
    name: 'sin-comentarios-html',
    apply: 'build',
    transformIndexHtml: {
        order: 'post',
        handler: (html) =>
            html
                .replace(/<!--(?!\s*SEO_INJECT_(?:START|END)\s*-->)[\s\S]*?-->/g, '')
                .replace(/\n\s*\n(\s*\n)+/g, '\n\n'),
    },
});

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        sinComentarios(),
    ],
    build: {
        // Vite comprime cada asset con gzip SOLO para imprimir su peso en el
        // informe final. No cambia lo que se publica, asi que se apaga: ahorra
        // trabajo en un servidor que va justo. Medido: el build de cliente baja
        // de 19,6 s a 17,5 s. NO baja el pico de memoria, y por eso no se
        // vende como tal.
        reportCompressedSize: false,
    },
})
