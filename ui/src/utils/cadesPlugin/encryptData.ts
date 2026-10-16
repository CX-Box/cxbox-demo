import { CertificateAsync } from '@interfaces/sign'
import { encryptBase64 } from '@utils/cadesPlugin/encryptBase64'
import { checkRecipientFileSize, fitsPluginMessage } from '@utils/cadesPlugin/checkPluginDataSize'
import { streamEncrypt } from '@utils/cadesPlugin/streamEncrypt'
import { Base64Text, CryptoInput, CryptoPartsOptions, dataSize, toBase64String } from '@utils/cadesPlugin/base64Data'

/**
 * Encrypts a file or base64 data for the certificate with the CryptoPro plugin.
 *
 * Data that fits into one message to the plugin is encrypted whole, as before; larger data is encrypted in parts.
 *
 * @returns base64 of the encrypted message: a string, or {@link Base64Text} for large data
 * @throws CadesPluginError `FILE_TOO_LARGE` when the data is larger than `RECIPIENT_MAX_FILE_SIZE`,
 * `PLUGIN_OUTDATED` when the plugin cannot encrypt in parts; `PLUGIN_NOT_RESPONDING` when the plugin does not answer a part;
 * `RESULT_DAMAGED` when the encrypted message is not whole; Error "Interrupted" when `isInterrupted` returns `true`
 */
export async function encryptData(
    certificate: CertificateAsync,
    data: CryptoInput,
    options: CryptoPartsOptions = {}
): Promise<string | Base64Text> {
    checkRecipientFileSize(dataSize(data), 'encrypt')

    if (!fitsPluginMessage(data)) {
        return streamEncrypt(certificate, data, options)
    }

    return encryptBase64(certificate, await toBase64String(data))
}
