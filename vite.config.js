import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
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
