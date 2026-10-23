import { CRYPTOPRO_CONFIG } from './config'
import { CadesPluginError, wrapPluginError, CADES_ERROR_CODES } from './errors'

/**
 * The loaded plugin, wrapped: `window.cadesplugin` is itself a thenable, so a promise resolved with it would resolve
 * to its result instead of the plugin object.
 */
export interface LoadedCadesPlugin {
    cadesplugin: CADESPluginAsync
    /** Plugin version, e.g. `2.0.15820` */
    version: string
}

let script: Promise<void> | null = null
let plugin: Promise<LoadedCadesPlugin> | null = null

/** Adds `cadesplugin_api.js` to the page and waits for the plugin it exposes; on failure the script is removed. */
function loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = `${process.env.PUBLIC_URL}/cadesplugin_api.js`
        script.async = true

        const fail = (error: unknown) => {
            script.remove()
            reject(error)
        }

        script.onload = async () => {
            if (window.cadesplugin && typeof window.cadesplugin.catch === 'function') {
                window.cadesplugin.catch(() => {})
            }
            try {
                await window.cadesplugin
                resolve()
            } catch (e) {
                fail(e)
            }
        }
        script.onerror = () => fail(new Error('Failed to load cadesplugin_api.js'))

        document.head.appendChild(script)
    })
}

/** The script once per page; forgotten only if it failed (and was removed), so a retry never adds a second one */
function scriptLoaded(): Promise<void> {
    if (!script) {
        script = loadScript()
        script.catch(() => {
            script = null
        })
    }
    return script
}

async function load(): Promise<LoadedCadesPlugin> {
    try {
        await scriptLoaded()
        const loaded = window.cadesplugin
        if (!loaded || !('CreateObjectAsync' in loaded)) {
            // only IE/NPAPI has the sync API
            throw new CadesPluginError(CADES_ERROR_CODES.PLUGIN_NOT_AVAILABLE, 'CryptoPro plugin is not available in async mode')
        }
        // the extension and the native host answer; the version comes with the same call
        const about = await loaded.CreateObjectAsync('CAdESCOM.About')
        return { cadesplugin: loaded, version: String(await about.Version) }
    } catch (error) {
        throw wrapPluginError(error, CADES_ERROR_CODES.PLUGIN_NOT_AVAILABLE)
    }
}

/**
 * The plugin, loaded on the first call; every function of the module awaits it, so an explicit load is not needed.
 *
 * @remarks
 * One shared promise: concurrent calls wait for the same load. A failed load is forgotten, so the next call retries
 * (e.g. after the extension is installed): the script is added again only if it failed itself,
 * otherwise only the check of the plugin is repeated.
 *
 * @example
 * ```ts
 * const { cadesplugin } = await getCadesPlugin()
 * ```
 *
 * @throws {@link CadesPluginError} `PLUGIN_NOT_AVAILABLE` if the plugin or the extension is missing or not responding
 */
export function getCadesPlugin(): Promise<LoadedCadesPlugin> {
    if (!plugin) {
        plugin = load()
        plugin.catch(() => {
            plugin = null
        })
    }
    return plugin
}

/**
 * Loads the plugin ahead of the first operation, e.g. to show «plugin not found» before the user picks a certificate.
 * Optional: every operation loads the plugin itself.
 *
 * @throws {@link CadesPluginError} `PLUGIN_NOT_AVAILABLE` if the plugin or the extension is missing or not responding
 */
export async function ensureCadesPluginInstalled(): Promise<void> {
    await getCadesPlugin()
}

/**
 * Plugin version, e.g. `2.0.15820`; read once when the plugin is loaded.
 *
 * @throws {@link CadesPluginError} `PLUGIN_NOT_AVAILABLE` as {@link getCadesPlugin}
 */
export async function getPluginVersion(): Promise<string> {
    return (await getCadesPlugin()).version
}

/**
 * Waits for a plugin call that takes one chunk at most `CRYPTOPRO_CONFIG.chunkTimeout`; the call itself is not cancelled.
 *
 * @param result - the pending plugin call
 * @param call - its name for the error text, e.g. `Hash`
 * @throws {@link CadesPluginError} `PLUGIN_NOT_RESPONDING` if the plugin does not answer in time
 */
export async function withChunkTimeout<T>(result: Promise<T>, call: string): Promise<T> {
    const ms = CRYPTOPRO_CONFIG.chunkTimeout
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(
            () => reject(new CadesPluginError(CADES_ERROR_CODES.PLUGIN_NOT_RESPONDING, `${call}: no answer from the plugin in ${ms} ms`)),
            ms
        )
    })
    try {
        return await Promise.race([result, timeout])
    } finally {
        clearTimeout(timer)
    }
}

/**
 * Whether the plugin version is at least `min`; a version that is not dotted numbers counts as too old.
 */
export function isPluginVersionAtLeast(version: string, min: string): boolean {
    return /^\d+(\.\d+)*$/.test(version) && compareVersions(version, min) >= 0
}

/**
 * Compares dotted versions numerically, missing parts are 0: negative if `a < b`, 0 if equal, positive if `a > b`.
 * Numbers only, as the plugin reports them; semver suffixes (`-beta`, `+build`) are not supported — {@link isPluginVersionAtLeast} rejects them.
 */
export function compareVersions(a: string, b: string): number {
    const left = a.split('.').map(Number)
    const right = b.split('.').map(Number)
    for (let i = 0; i < Math.max(left.length, right.length); i++) {
        const diff = (left[i] || 0) - (right[i] || 0)
        if (diff !== 0) {
            return diff
        }
    }
    return 0
}
