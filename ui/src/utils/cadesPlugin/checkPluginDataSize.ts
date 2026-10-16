import { t } from 'i18next'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'
import { ATTACHED_MAX_FILE_SIZE, MAX_CRYPTO_FILE_SIZE, PLUGIN_MESSAGE_LIMIT } from '@constants/cadesPlugin'
import { base64Length } from '@utils/cadesPlugin/base64Data'

/**
 * Megabytes for the text of an error. The size of a file is rounded up and a limit down, so a file larger than the limit
 * never looks equal to it: not "200 MB, the maximum is 200 MB" for 200.3 MB
 */
export const toMegabytes = (bytes: number, round: (value: number) => number = Math.ceil) => round(bytes / (1024 * 1024))

/**
 * Whether the data fits into one message to the plugin: then it is signed whole, with `SignCades`
 *
 * @param data - a file, or base64 of the data
 */
export const fitsPluginMessage = (data: Blob | string) => base64Length(data) <= PLUGIN_MESSAGE_LIMIT

/**
 * Checks that a file is not larger than `max`.
 *
 * @param size - the size of the file, bytes
 * @param max - the largest allowed size, bytes
 * @param message - the key of the text of the error, with `size` and `max` in megabytes
 * @throws CadesPluginError with code `FILE_TOO_LARGE` and a localized message
 */
export function checkMaxFileSize(size: number, max: number = MAX_CRYPTO_FILE_SIZE, message: string = 'File too large') {
    if (size > max) {
        throw new CadesPluginError(
            t(message, { size: toMegabytes(size), max: toMegabytes(max, Math.floor) }),
            CadesPluginError.FILE_TOO_LARGE
        )
    }
}

/**
 * Checks that a file can get an attached signature: it is signed whole, so it must fit into one message to the plugin
 * together with the signature, see `ATTACHED_MAX_FILE_SIZE`
 *
 * @param size - the size of the file, bytes
 * @throws CadesPluginError with code `FILE_TOO_LARGE` and a message that advises a detached signature
 */
export const checkAttachedFileSize = (size: number) =>
    checkMaxFileSize(size, ATTACHED_MAX_FILE_SIZE, 'File too large for attached signature')
