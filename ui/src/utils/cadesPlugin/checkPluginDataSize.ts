import { t } from 'i18next'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'
import { MAX_CRYPTO_FILE_SIZE, PLUGIN_MESSAGE_LIMIT, RECIPIENT_MAX_FILE_SIZE } from '@constants/cadesPlugin'
import { base64Length, CryptoInput } from '@utils/cadesPlugin/base64Data'

/**
 * Megabytes for the text of an error. The size of a file is rounded up and a limit down, so a file larger than the limit
 * never looks equal to it: not "200 MB, the largest is 200 MB" for 200.3 MB
 */
export const toMegabytes = (bytes: number, round: (value: number) => number = Math.ceil) => round(bytes / (1024 * 1024))

/**
 * The largest file that is signed whole, as before, bytes: a larger one is signed by its hash, which needs a GOST certificate.
 * Encrypt and sign signs the `.enc` file — base64 text with a line break every 64 characters, so the file is about
 * 3/4 · 64/66 of it (the CMS around the data is not counted: the result is an estimate for the user)
 *
 * @param signsEncryptedFile - `true` for encrypt and sign
 */
export function getLargestWholeSignedFileSize(signsEncryptedFile: boolean) {
    const data = Math.floor(PLUGIN_MESSAGE_LIMIT / 4) * 3
    return signsEncryptedFile ? Math.floor((((data / 66) * 64) / 4) * 3) : data
}

/**
 * Whether the data fits into one message to the plugin: then it is passed whole, as before
 *
 * @param data - a file, base64 of the data, or {@link Base64Text}
 */
export const fitsPluginMessage = (data: CryptoInput) => base64Length(data) <= PLUGIN_MESSAGE_LIMIT

/**
 * Whether data of this size fits into one message to the plugin, see {@link fitsPluginMessage}
 *
 * @param size - bytes
 */
export const fitsPluginMessageSize = (size: number) => Math.ceil(size / 3) * 4 <= PLUGIN_MESSAGE_LIMIT

/**
 * Checks that a file is not larger than `MAX_CRYPTO_FILE_SIZE`.
 *
 * @param size - the size of the file, bytes
 * @param max - the largest allowed size, bytes
 * @throws CadesPluginError with code `FILE_TOO_LARGE` and a localized message
 */
export function checkMaxFileSize(size: number, max: number = MAX_CRYPTO_FILE_SIZE) {
    if (size > max) {
        throw new CadesPluginError(
            t('File too large', { size: toMegabytes(size), max: toMegabytes(max, Math.floor) }),
            CadesPluginError.FILE_TOO_LARGE
        )
    }
}

const RECIPIENT_MESSAGES = {
    sign: 'File too large for recipient',
    signEncrypted: 'Encrypted file too large for recipient',
    encrypt: 'File too large for recipient to decrypt'
}

/**
 * Checks that a file is not larger than `RECIPIENT_MAX_FILE_SIZE` before an attached signature or encryption:
 * the recipient opens such a file whole. Does nothing when the limit is not set.
 *
 * @param size - the size of the file, bytes
 * @param operation - what is done with the file: the message advises a detached signature for `sign` and `signEncrypted`,
 * not for `encrypt`; `signEncrypted` — an attached signature of the encrypted file, which is larger than the file
 * @param max - the largest allowed size, bytes; `undefined` for no limit
 * @throws CadesPluginError with code `FILE_TOO_LARGE` and a localized message
 */
export function checkRecipientFileSize(
    size: number,
    operation: 'sign' | 'signEncrypted' | 'encrypt',
    max: number | undefined = RECIPIENT_MAX_FILE_SIZE
) {
    if (max !== undefined && size > max) {
        const message = RECIPIENT_MESSAGES[operation]
        throw new CadesPluginError(t(message, { max: toMegabytes(max, Math.floor) }), CadesPluginError.FILE_TOO_LARGE)
    }
}
