import { t } from 'i18next'
import { HASH_PART_SIZE, PLUGIN_PART_TIMEOUT } from '@constants/cadesPlugin'
import { blobToBase64 } from '@utils/cadesPlugin/blobToBase64'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'
import { pluginErrorMessage, withTimeout } from '@utils/cadesPlugin/pluginCalls'
import { resultDamaged } from '@utils/cadesPlugin/cryptoResult'

/**
 * Progress and interruption of an operation that passes a file to the plugin in parts
 */
export interface CryptoPartsOptions {
    /** Called after each part; `part` starts from 1 */
    onProgress?: (part: number, total: number) => void
    /** Checked before each part: `true` stops the operation with the error "Interrupted" */
    isInterrupted?: () => boolean
}

/**
 * Base64 text kept in a Blob instead of a string: the base64 of a 500 MB file is longer than a browser string can be.
 * The bytes of the Blob are the base64 characters without line breaks, the data is what they decode to.
 */
export class Base64Text {
    /**
     * @param size - the size of the data, bytes; without it, the largest size the text can decode to (up to 2 bytes more)
     */
    constructor(readonly text: Blob, readonly size: number = Math.floor(text.size / 4) * 3) {}
}

/**
 * Data passed to the plugin: a file (its bytes are the data), base64 of the data, or {@link Base64Text}
 */
export type CryptoInput = Blob | string | Base64Text

/** The same part as base64: a multiple of 4 characters, so each part decodes on its own */
const BASE64_PART_LENGTH = (HASH_PART_SIZE / 3) * 4

/** Number of characters other than whitespace: the plugin returns base64 with line breaks */
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
 */
export const base64Length = (data: CryptoInput) =>
    data instanceof Base64Text ? data.text.size : typeof data === 'string' ? countBase64Chars(data) : Math.ceil(data.size / 3) * 4

/**
 * Size of the data, bytes
 */
export function dataSize(data: CryptoInput) {
    if (typeof data !== 'string') {
        return data.size
    }
    const end = data.trimEnd()
    const padding = end.endsWith('==') ? 2 : end.endsWith('=') ? 1 : 0
    return (base64Length(data) / 4) * 3 - padding
}

/**
 * Stops an operation that the user interrupted
 *
 * @throws Error "Interrupted" when `isInterrupted` returns `true`
 */
export function checkInterrupted(isInterrupted?: () => boolean) {
    if (isInterrupted?.()) {
        throw new Error(t('Interrupted'))
    }
}

/**
 * Number of the parts {@link base64Parts} gives; 0 for empty data
 */
export const partCount = (data: CryptoInput) => Math.ceil(base64Length(data) / BASE64_PART_LENGTH)

/**
 * The data as base64 parts of `HASH_PART_SIZE` bytes, for the plugin methods that take data part by part.
 * Line breaks in a base64 string are dropped: they would shift the borders of the parts.
 */
export async function* base64Parts(data: CryptoInput): AsyncGenerator<string> {
    if (typeof data === 'string') {
        const base64 = data.replace(/\s/g, '')
        for (let start = 0; start < base64.length; start += BASE64_PART_LENGTH) {
            yield base64.slice(start, start + BASE64_PART_LENGTH)
        }
        return
    }
    if (data instanceof Base64Text) {
        for (let start = 0; start < data.text.size; start += BASE64_PART_LENGTH) {
            yield await data.text.slice(start, start + BASE64_PART_LENGTH).text()
        }
        return
    }
    for (let start = 0; start < data.size; start += HASH_PART_SIZE) {
        yield await blobToBase64(data.slice(start, start + HASH_PART_SIZE))
    }
}

/**
 * Passes the data to a plugin method part by part.
 *
 * @param call - the plugin call for one part; `isLast` is `true` for the last part. Empty data makes one call with ''
 * @throws Error "Interrupted" when `isInterrupted` returns `true` between the parts;
 * CadesPluginError with the number of the part when the plugin fails or does not answer in `PLUGIN_PART_TIMEOUT`
 */
export async function passPluginParts(
    data: CryptoInput,
    call: (part: string, isLast: boolean) => Promise<unknown>,
    { onProgress, isInterrupted }: CryptoPartsOptions = {}
) {
    const total = partCount(data)
    let index = 0

    const pass = async (part: string, isLast: boolean) => {
        checkInterrupted(isInterrupted)
        try {
            await withTimeout(call(part, isLast), PLUGIN_PART_TIMEOUT)
        } catch (err) {
            const error = pluginErrorMessage(err)
            // the code tells the callers what happened: a damaged result or a plugin that does not answer
            const code = err instanceof CadesPluginError ? err.code : CadesPluginError.UNKNOWN
            throw new CadesPluginError(t('Plugin error at part', { error, part: index + 1, total }), code, { cause: err })
        }
        index++
        onProgress?.(index, total)
    }

    // the last part is the one with nothing after it: the count may differ from `total` only by a mistake,
    // and a missed `isLast` would leave the encrypted message unfinished
    let previous: string | null = null
    for await (const part of base64Parts(data)) {
        if (previous !== null) {
            await pass(previous, false)
        }
        previous = part
    }

    // empty data: the plugin fails ("the parameter is incorrect") on an object that was never fed any data
    await pass(previous ?? '', true)
}

/**
 * The data as one base64 string, for the plugin methods that take data whole
 *
 * @throws CadesPluginError `RESULT_DAMAGED` when the base64 of a file is not of its size
 */
export async function toBase64String(data: CryptoInput) {
    if (typeof data === 'string') {
        return data
    }
    if (data instanceof Base64Text) {
        return data.text.text()
    }
    const base64 = await blobToBase64(data)
    checkLength('base64 of the file', base64.length, base64Length(data))
    return base64
}

/**
 * Checks a size after a conversion: a short result would be signed or saved as if it were the whole data
 *
 * @throws CadesPluginError `RESULT_DAMAGED`
 */
function checkLength(what: string, actual: number, expected: number) {
    if (actual !== expected) {
        throw resultDamaged(`${what} has ${actual} characters or bytes instead of ${expected}`)
    }
}

/**
 * Bytes of base64 text: what a `.sig` or `.enc` file stores
 */
export const toTextBlob = (base64: string | Base64Text) => (base64 instanceof Base64Text ? base64.text : new Blob([base64]))

/**
 * Bytes of the data, decoded part by part
 *
 * @throws Error "Interrupted" when `isInterrupted` returns `true` between the parts;
 * CadesPluginError `RESULT_DAMAGED` when the result is not of the size of the data
 */
export async function toBytesBlob(data: CryptoInput, isInterrupted?: () => boolean): Promise<Blob> {
    if (data instanceof Blob) {
        return data
    }
    const parts: Blob[] = []
    for await (const part of base64Parts(data)) {
        checkInterrupted(isInterrupted)
        parts.push(new Blob([base64ToBytes(part)]))
    }
    const bytes = new Blob(parts)
    checkLength('the decoded data', bytes.size, dataSize(data))
    return bytes
}

/**
 * Base64 of bytes, part by part: the result is {@link Base64Text}, not a string, so its size is not limited.
 * Each part goes to a Blob at once, so the strings do not pile up in memory
 *
 * @throws Error "Interrupted" when `isInterrupted` returns `true` between the parts;
 * CadesPluginError `RESULT_DAMAGED` when the result is not of the size of the data
 */
export async function toBase64Text(bytes: Blob, isInterrupted?: () => boolean): Promise<Base64Text> {
    const parts: Blob[] = []
    for await (const part of base64Parts(bytes)) {
        checkInterrupted(isInterrupted)
        parts.push(new Blob([part]))
    }
    const text = new Blob(parts)
    checkLength('the base64 text', text.size, base64Length(bytes))
    return new Base64Text(text, bytes.size)
}

/**
 * Bytes of base64; whitespace is ignored
 */
export function base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64.replace(/\s/g, ''))
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes
}
