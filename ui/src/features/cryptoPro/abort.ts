import { CADES_ERROR_CODES, CadesPluginError } from './errors'

const aborted = () => new CadesPluginError(CADES_ERROR_CODES.OPERATION_ABORTED, 'The user stopped waiting for the operation')

/**
 * @throws {@link CadesPluginError} `OPERATION_ABORTED` if the signal is aborted
 */
export function throwIfAborted(signal?: AbortSignal): void {
    if (signal?.aborted) {
        throw aborted()
    }
}

/**
 * Waits for `result` until the signal is aborted.
 *
 * @remarks
 * A plugin call cannot be cancelled: `cadesplugin_api.js` has no such method. On abort we only stop waiting;
 * the call goes on in the plugin, and its late result or error is ignored.
 *
 * @throws {@link CadesPluginError} `OPERATION_ABORTED` on abort; otherwise the error of `result`
 */
export function untilAborted<T>(result: Promise<T>, signal?: AbortSignal): Promise<T> {
    if (!signal) {
        return result
    }
    result.catch(() => undefined)
    return new Promise<T>((resolve, reject) => {
        const onAbort = () => reject(aborted())
        if (signal.aborted) {
            onAbort()
            return
        }
        signal.addEventListener('abort', onAbort, { once: true })
        result.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort))
    })
}
