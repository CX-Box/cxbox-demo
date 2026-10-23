import { DEFAULT_CHUNK_SIZE, forEachBase64Chunk } from './base64Chunks'
import { blobToBase64 } from './blobToBase64'

/**
 * Decodes a base64 string into bytes with `atob`.
 *
 * @remarks
 * Decodes the whole string at once: only for small strings such as signatures returned by the plugin.
 * Standard base64 (RFC 4648), `=` padding optional. Line breaks are removed first: the plugin returns base64 with `\r\n`
 * every 76 characters (CryptoAPI format); browsers' `atob` skips them, but other decoders reject them,
 * so the result does not depend on that leniency.
 *
 * @throws DOMException `InvalidCharacterError` for text that is not base64 (e.g. base64url `-`, `_`) — never wrong bytes
 */
export function base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64.replace(/\s/g, ''))
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes
}

/**
 * Collects base64 text of bytes that arrive in pieces of any size, without keeping the bytes themselves.
 *
 * @remarks
 * Each piece is encoded right away; up to 2 bytes are carried to the next piece, so that every encoded run is a multiple of 3 bytes
 * and the runs concatenate into valid base64 (`=` padding only at the very end). Memory: the resulting text plus one piece.
 *
 * @example
 * ```ts
 * const text = new Base64TextBuilder()
 * for (const piece of pieces) await text.append(piece)
 * const blob = await text.toBlob()
 * ```
 */
export class Base64TextBuilder {
    private readonly parts: Blob[] = []
    private carry = new Uint8Array(0)

    /** Adds the next piece; pieces of any size, including empty, in their order. */
    async append(bytes: Uint8Array): Promise<void> {
        const joined = new Uint8Array(this.carry.length + bytes.length)
        joined.set(this.carry)
        joined.set(bytes, this.carry.length)
        const usable = joined.length - (joined.length % 3)
        if (usable > 0) {
            this.parts.push(new Blob([await blobToBase64(new Blob([joined.subarray(0, usable)]))]))
        }
        this.carry = joined.slice(usable)
    }

    /** The text so far plus the encoded remainder; call once, after the last {@link append}. */
    async toBlob(type = 'application/octet-stream'): Promise<Blob> {
        if (this.carry.length > 0) {
            this.parts.push(new Blob([await blobToBase64(new Blob([this.carry]))]))
            this.carry = new Uint8Array(0)
        }
        return new Blob(this.parts, { type })
    }
}

/**
 * Converts binary data of any size into a Blob holding its base64 text, without a string of the whole file.
 *
 * @remarks
 * For files that must be stored as base64 text but exist as a large Blob, e.g. an attached signature assembled around the file.
 * Encodes bytes as they are, whatever they hold (DER, BER, anything). Each chunk's base64 becomes a separate Blob part
 * right away; memory stays at one chunk plus the resulting Blob.
 */
export async function blobToBase64TextBlob(blob: Blob, type = 'application/octet-stream'): Promise<Blob> {
    const parts: Blob[] = []
    await forEachBase64Chunk(blob, DEFAULT_CHUNK_SIZE, chunk => {
        parts.push(new Blob([chunk]))
    })
    return new Blob(parts, { type })
}
