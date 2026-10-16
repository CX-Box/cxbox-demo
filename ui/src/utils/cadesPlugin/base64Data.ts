import { t } from 'i18next'
import { HASH_PART_SIZE, PLUGIN_PART_TIMEOUT } from '@constants/cadesPlugin'
import { blobToBase64 } from '@utils/cadesPlugin/blobToBase64'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'
import { pluginErrorMessage, withTimeout } from '@utils/cadesPlugin/pluginCalls'

/**
 * Progress of signing a file that is passed to the plugin in parts
 */
export interface CryptoPartsOptions {
    /** Called with 0 before the first part and then after each part */
    onProgress?: (part: number, total: number) => void
}

/** The same part as base64: a multiple of 4 characters, so each part decodes on its own */
const BASE64_PART_LENGTH = (HASH_PART_SIZE / 3) * 4

/** Number of characters other than whitespace: base64 may come with line breaks */
const countBase64Chars = (base64: string) => {
    let count = 0
    for (let i = 0; i < base64.length; i++) {
        const code = base64.charCodeAt(i)
        if (code !== 0x0a && code !== 0x0d && code !== 0x20 && code !== 0x09) {
            count++
        }
    }
    return count
}

/**
 * Length of the base64 of the data without line breaks, characters
 *
 * @param data - a file, or base64 of the data
 */
export const base64Length = (data: Blob | string) => (typeof data === 'string' ? countBase64Chars(data) : Math.ceil(data.size / 3) * 4)

/**
 * Size of the data, bytes
 *
 * @param data - a file, or base64 of the data
 */
export function dataSize(data: Blob | string) {
    if (typeof data !== 'string') {
        return data.size
    }
    const end = data.trimEnd()
    const padding = end.endsWith('==') ? 2 : end.endsWith('=') ? 1 : 0
    return (base64Length(data) / 4) * 3 - padding
}

/**
 * Number of the parts {@link base64Parts} gives; 0 for empty data
 */
export const partCount = (data: Blob | string) => Math.ceil(base64Length(data) / BASE64_PART_LENGTH)

/**
 * The data as base64 parts of `HASH_PART_SIZE` bytes. Line breaks in a base64 string are dropped:
 * they would shift the borders of the parts. A file is read part by part, never whole.
 */
export async function* base64Parts(data: Blob | string): AsyncGenerator<string> {
    if (typeof data === 'string') {
        // the same characters as countBase64Chars drops, so the parts match partCount
        const base64 = data.replace(/[\n\r \t]/g, '')
        for (let start = 0; start < base64.length; start += BASE64_PART_LENGTH) {
            yield base64.slice(start, start + BASE64_PART_LENGTH)
        }
        return
    }
    for (let start = 0; start < data.size; start += HASH_PART_SIZE) {
        yield await blobToBase64(data.slice(start, start + HASH_PART_SIZE))
    }
}

/**
 * Passes not empty data to a plugin method part by part: each part waits for the answer to the previous one,
 * and the first error stops the passing, so no part is missed.
 *
 * @param call - the plugin call for one part
 * @throws CadesPluginError with the number of the part when the plugin fails,
 * with code `PLUGIN_NOT_RESPONDING` when it does not answer in `PLUGIN_PART_TIMEOUT`;
 * when fewer or more parts were passed than `partCount` gives
 */
export async function passPluginParts(
    data: Blob | string,
    call: (part: string) => Promise<unknown>,
    { onProgress }: CryptoPartsOptions = {}
) {
    const total = partCount(data)
    let index = 0
    onProgress?.(index, total)

    for await (const part of base64Parts(data)) {
        try {
            await withTimeout(call(part), PLUGIN_PART_TIMEOUT)
        } catch (err) {
            const code = err instanceof CadesPluginError ? err.code : CadesPluginError.UNKNOWN
            throw new CadesPluginError(t('Plugin error at part', { error: pluginErrorMessage(err), part: index + 1, total }), code, {
                cause: err
            })
        }
        index++
        onProgress?.(index, total)
    }

    // a hash of a part of the data would be signed as the hash of the whole data
    if (index !== total) {
        throw new CadesPluginError(`${index} parts of the data were passed to the plugin instead of ${total}`, CadesPluginError.UNKNOWN)
    }
}
