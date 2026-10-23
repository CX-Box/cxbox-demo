import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The page with cadesplugin_api.js, as small as the loader needs: <script> elements and window.cadesplugin

interface FakeScript {
    src: string
    removed: boolean
    onload: (() => void) | null
    onerror: (() => void) | null
    remove: () => void
}

let scripts: FakeScript[]
/** What the next added script does: expose the plugin, or fail to load */
let nextScript: 'loads' | 'fails'
/** The plugin the script exposes; `CreateObjectAsync('CAdESCOM.About')` rejects while `aboutFails` */
let aboutFails: boolean

const fakePlugin = () =>
    Object.assign(Promise.resolve(), {
        CreateObjectAsync: async (name: string) => {
            if (aboutFails) {
                // eslint-disable-next-line no-throw-literal -- the real plugin rejects with exactly such an object
                throw { message: `${name}: native host is not available`, requestid: 1, type: 'error' }
            }
            return { Version: Promise.resolve('2.0.15820') }
        }
    })

beforeEach(() => {
    vi.resetModules()
    scripts = []
    nextScript = 'loads'
    aboutFails = false
    const window: { cadesplugin?: unknown } = {}
    vi.stubGlobal('window', window)
    vi.stubGlobal('document', {
        createElement: () => {
            const script: FakeScript = { src: '', removed: false, onload: null, onerror: null, remove: () => (script.removed = true) }
            return script
        },
        head: {
            appendChild: (script: FakeScript) => {
                scripts.push(script)
                const outcome = nextScript
                setTimeout(() => {
                    if (outcome === 'fails') {
                        script.onerror?.()
                    } else {
                        window.cadesplugin = fakePlugin()
                        script.onload?.()
                    }
                })
            }
        }
    })
})

afterEach(() => {
    vi.unstubAllGlobals()
})

const loadModule = () => import('./plugin')

describe('getCadesPlugin', () => {
    it('adds the script once for concurrent calls and reads the version', async () => {
        const { getCadesPlugin, getPluginVersion } = await loadModule()

        const [first, second] = await Promise.all([getCadesPlugin(), getCadesPlugin()])

        expect(first).toBe(second)
        expect(scripts).toHaveLength(1)
        expect(await getPluginVersion()).toBe('2.0.15820')
    })

    it('when the plugin does not answer, retries without a second script', async () => {
        const { getCadesPlugin } = await loadModule()
        aboutFails = true

        await expect(getCadesPlugin()).rejects.toEqual(expect.objectContaining({ code: 'PLUGIN_NOT_AVAILABLE' }))
        aboutFails = false
        await expect(getCadesPlugin()).resolves.toBeDefined()

        expect(scripts).toHaveLength(1)
        expect(scripts[0].removed).toBe(false)
    })

    it('when the script fails to load, removes it and adds it again on retry', async () => {
        const { getCadesPlugin } = await loadModule()
        nextScript = 'fails'

        await expect(getCadesPlugin()).rejects.toEqual(expect.objectContaining({ code: 'PLUGIN_NOT_AVAILABLE' }))
        nextScript = 'loads'
        await expect(getCadesPlugin()).resolves.toBeDefined()

        expect(scripts.map(script => script.removed)).toEqual([true, false])
    })

    it('rejects a plugin without the async API with PLUGIN_NOT_AVAILABLE', async () => {
        const { getCadesPlugin } = await loadModule()
        document.head.appendChild = ((script: FakeScript) => {
            scripts.push(script)
            setTimeout(() => {
                ;(window as { cadesplugin?: unknown }).cadesplugin = Object.assign(Promise.resolve(), { CreateObject: () => ({}) })
                script.onload?.()
            })
        }) as never

        await expect(getCadesPlugin()).rejects.toEqual(
            expect.objectContaining({ code: 'PLUGIN_NOT_AVAILABLE', message: expect.stringMatching(/async mode/) })
        )
    })
})
