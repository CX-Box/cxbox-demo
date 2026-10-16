import { t } from 'i18next'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'

/**
 * Text of an error of a plugin call. The plugin rejects with an Error, or, through the browser extension,
 * with a plain object `{ message }`: `String()` of it would give "[object Object]"
 */
export function pluginErrorMessage(err: unknown): string {
    if (err instanceof CadesPluginError) {
        return err.message
    }
    if (err instanceof Error) {
        return window.cadesplugin?.getLastError?.(err) ?? err.message
    }
    const message = (err as { message?: unknown } | null)?.message
    return typeof message === 'string' ? message : String(err)
}

/**
 * Checks that a plugin object has the methods needed for large files: an old plugin has no such methods,
 * and a call of a missing one fails with a TypeError that says nothing to the user.
 *
 * @throws CadesPluginError `PLUGIN_OUTDATED`
 */
export function checkPluginMethods(object: object, ...methods: string[]) {
    if (methods.some(method => typeof (object as Record<string, unknown>)[method] !== 'function')) {
        throw new CadesPluginError(t('Plugin outdated'), CadesPluginError.PLUGIN_OUTDATED)
    }
}

/**
 * Rejects when the promise is not settled in time: the browser extension may lose the answer of the plugin,
 * and the operation would wait forever. The plugin call itself is not cancelled.
 *
 * @param timeout - milliseconds
 * @throws CadesPluginError `PLUGIN_NOT_RESPONDING` when the timeout passes first
 */
export function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeoutError = new Promise<never>((_, reject) => {
        timer = setTimeout(
            () =>
                reject(
                    new CadesPluginError(
                        t('Plugin not responding', { seconds: Math.round(timeout / 1000) }),
                        CadesPluginError.PLUGIN_NOT_RESPONDING
                    )
                ),
            timeout
        )
    })
    return Promise.race([promise, timeoutError]).finally(() => clearTimeout(timer))
}
