import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'
import * as path from 'path'

export default defineConfig({
    base: '/ui/',
    plugins: [
        react(),
        viteTsconfigPaths(),
        svgr({
            svgrOptions: {
                exportType: 'default',
                ref: true,
                svgo: false,
                titleProp: true
            },
            include: '**/*.svg?react'
        })
    ],
    resolve: {
        alias: [
            { find: '@assets', replacement: path.resolve(__dirname, 'src/assets') },
            // FIX: Fixing the "Unknown theme type" error for Ant Design 3
            { find: /^antd$/, replacement: 'antd/dist/antd.js' }
        ]
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true
            }
        },
        modules: {
            generateScopedName: '[name]__[local]___[hash:base64:5]',
            localsConvention: 'camelCase'
        }
    },
    server: {
        port: 3000,
        proxy: {
            '/api/v1': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            }
        }
    },
    build: {
        outDir: 'build',
        assetsDir: 'static',
        chunkSizeWarningLimit: 1000,
        commonjsOptions: {
            // FIX: Enables require() processing inside modules (Ant Design 3)
            transformMixedEsModules: true
        }
    }
})
