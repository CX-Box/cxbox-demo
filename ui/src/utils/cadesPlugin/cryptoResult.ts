import { t } from 'i18next'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'

/**
 * The error for a result that is not what it must be: such a result is never saved.
 * Signing and encryption of a large file are assembled in parts, and a mistake there would give a file
 * that looks fine to the sender and is not opened by the recipient
 *
 * @param reason - what is wrong, for the support
 */
export const resultDamaged = (reason: string) =>
    new CadesPluginError(t('Crypto result damaged', { reason }), CadesPluginError.RESULT_DAMAGED)

const BASE64_CHARS = /^[A-Za-z0-9+/]*={0,2}$/

/**
 * Checks one part of base64 the plugin returned: it must decode on its own.
 * A part cut not at a border of 4 characters would be decoded without an error, but with wrong bytes at the joint
 *
 * @param part - base64 without whitespace
 * @param index - number of the part, from 1, for the message
 * @throws CadesPluginError `RESULT_DAMAGED`
 */
export function checkBase64Part(part: string, index: number) {
    if (part.length % 4 !== 0 || !BASE64_CHARS.test(part)) {
        throw resultDamaged(`part ${index} of the plugin answer is not whole base64 (length ${part.length})`)
    }
}

const ID_ENVELOPED_DATA = [0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x03]

/**
 * Checks that the joined parts of an encrypted message are a whole CMS EnvelopedData: the type is right
 * and the message is finished (the end of an indefinite length, or the length of the whole data for a definite one)
 *
 * @throws CadesPluginError `RESULT_DAMAGED`
 */
export async function checkEnvelopedData(message: Blob) {
    const head = new Uint8Array(await message.slice(0, 32).arrayBuffer())
    if (head.length < 2 || head[0] !== 0x30) {
        throw resultDamaged('the encrypted message is not a CMS structure')
    }

    let header = 2
    if (head[1] === 0x80) {
        const tail = new Uint8Array(await message.slice(-2).arrayBuffer())
        if (message.size < 4 || tail[0] !== 0 || tail[1] !== 0) {
            throw resultDamaged('the encrypted message is not finished')
        }
    } else {
        let length = head[1]
        if (length & 0x80) {
            const count = length & 0x7f
            length = 0
            for (let i = 0; i < count; i++) {
                length = length * 256 + head[2 + i]
            }
            header += count
        }
        if (header + length !== message.size) {
            throw resultDamaged(`the encrypted message has ${message.size} bytes, its header says ${header + length}`)
        }
    }

    if (!ID_ENVELOPED_DATA.every((byte, i) => head[header + i] === byte)) {
        throw resultDamaged('the encrypted message is not EnvelopedData')
    }
}
