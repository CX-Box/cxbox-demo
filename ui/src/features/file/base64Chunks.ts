import { blobToBase64 } from './blobToBase64'
import { MiB } from './size'

/** Default chunk size: 3 MiB, as in the CryptoPro sample plugin-samples-fileapi_stream; a multiple of 3, see {@link forEachBase64Chunk} */
export const DEFAULT_CHUNK_SIZE = 3 * MiB

/**
 * Callback for one chunk.
 *
 * @param chunk - base64 of the chunk bytes (empty string for an empty file)
 * @param isLast - `true` for the last chunk
 */
export type Base64ChunkHandler = (chunk: string, isLast: boolean) => unknown | Promise<unknown>

/**
 * Reads a Blob in chunks and passes base64 of each chunk to `fn`, waiting for it before reading the next one.
 *
 * @remarks
 * Mechanism of plugin-samples-fileapi_stream: `slice` by `chunkSize`, `readAsDataURL` of each chunk ({@link blobToBase64}).
 * Only the current chunk and its base64 are held, not the whole file.
 * An empty Blob gives one empty chunk, so consumers (e.g. a hash) still get a call with `isLast = true`.
 * A rejection of `fn` stops reading and rejects the returned promise.
 *
 * The chunk size is a multiple of 3 bytes: 3 bytes = 4 base64 characters, so `=` padding is only in the last chunk
 * and the chunk texts concatenate into the base64 of the whole file ({@link blobToBase64TextBlob}). The plugin decodes
 * each chunk on its own; the CryptoPro sample uses 3 MiB, also a multiple of 3.
 *
 * @param chunkSize - chunk size in bytes, a positive multiple of 3
 * @returns number of chunks passed to `fn`
 * @throws RangeError if `chunkSize` is not a positive multiple of 3
 */
export async function forEachBase64Chunk(blob: Blob, chunkSize: number, fn: Base64ChunkHandler): Promise<number> {
    if (!Number.isInteger(chunkSize) || chunkSize <= 0 || chunkSize % 3 !== 0) {
        throw new RangeError(`Chunk size must be a positive multiple of 3 bytes, got ${chunkSize}`)
    }
    const count = Math.max(1, Math.ceil(blob.size / chunkSize))
    for (let i = 0; i < count; i++) {
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, blob.size)
        await fn(await blobToBase64(blob.slice(start, end)), i === count - 1)
    }
    return count
}
