import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const src = resolve(__dirname, 'src')
const { paths } = JSON.parse(readFileSync(resolve(__dirname, 'tsconfig.path.json'), 'utf8')).compilerOptions as {
    paths: Record<string, string[]>
}

// Aliases from tsconfig.path.json, so that @features/* resolves as in the app; '@x/*' is covered by the '@x' prefix
const alias = Object.entries(paths)
    .filter(([key]) => !key.endsWith('/*'))
    .map(([key, [target]]) => ({ find: new RegExp(`^${key}(?=/|$)`), replacement: resolve(src, target) }))

export default defineConfig({
    resolve: { alias },
    test: {
        include: ['src/**/*.test.{ts,tsx}'],
        environment: 'node',
        setupFiles: ['./vitest.setup.ts']
    }
})
