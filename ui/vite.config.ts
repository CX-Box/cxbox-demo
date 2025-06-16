import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    base: 'ui',
    plugins: [react()],
    server: {
        proxy: {
            '/api/v1': {
                target: 'http://localhost:8080'
            }
        }
    },
    build: {
        outDir: 'build',
        assetsDir: 'static'
    }
})
