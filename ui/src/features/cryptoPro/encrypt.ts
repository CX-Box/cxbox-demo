// Encryption in chunks with CPEnvelopedData.StreamEncrypt; the parts are joined into one CMS EnvelopedData (README, «Encryption in parts»).
// The bytes of the parts are joined, not the base64 strings: each string has its own padding.

import { Base64TextBuilder, base64ToBytes, forEachBase64Chunk } from '@features/file'
import { CRYPTOPRO_CONFIG } from './config'
import { CadesPluginError, wrapPluginError, CADES_ERROR_CODES } from './errors'
import { getCadesPlugin, getPluginVersion, isPluginVersionAtLeast, withChunkTimeout } from './plugin'
import { CertificateData, EncryptResult } from './types'

async function checkPluginVersion(): Promise<void> {
    const version = await getPluginVersion()
    if (!isPluginVersionAtLeast(version, CRYPTOPRO_CONFIG.minPluginVersion)) {
        throw new CadesPluginError(
            CADES_ERROR_CODES.PLUGIN_OUTDATED,
            `CryptoPro plugin ${version} is too old for encryption in chunks, ${CRYPTOPRO_CONFIG.minPluginVersion} or later is required`
        )
    }
}

/**
 * Encrypts data for the recipient into CMS EnvelopedData; the file is read in chunks and never held whole.
 *
 * @remarks
 * The algorithm is chosen by the plugin, as before. The message is BER, as the parts of `StreamEncrypt` join.
 * An empty Blob is encrypted by `Encrypt` (DER, which is valid BER): `StreamEncrypt('', true)` as the only call returns nothing (measured).
 *
 * @example
 * ```ts
 * const { encrypted } = await encrypt(file, recipient)
 * await CxBoxApiInstance.uploadFile(encrypted, `${name}.enc`)
 * ```
 *
 * @throws {@link CadesPluginError} `PLUGIN_OUTDATED` for plugins older than 2.0.15260; `PLUGIN_NOT_RESPONDING` if a chunk
 * is not taken in time; `ENCRYPT_FAILED` for an empty message; the recipient certificate is checked
 * by the plugin: `CERT_*`, `UNSUPPORTED_KEY`, `ENCRYPT_FAILED`
 */
export async function encrypt(data: Blob, recipient: CertificateData): Promise<EncryptResult> {
    const { cadesplugin } = await getCadesPlugin()
    try {
        if (data.size > 0) {
            await checkPluginVersion()
        }
        const envelopedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CPEnvelopedData')
        await envelopedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY)
        if (data.size === 0) {
            // Content resets the object, so it is set before the recipients
            await envelopedData.propset_Content('')
        }
        await (await envelopedData.Recipients).Add(recipient.itself)

        if (data.size === 0) {
            const text = await envelopedData.Encrypt(cadesplugin.CADESCOM_ENCODE_BASE64)
            return { encrypted: new Blob([text], { type: 'application/octet-stream' }) }
        }

        // Each part goes straight into the base64 text: the encrypted bytes are not kept (300 MB file: peak +706 → +442 MB)
        const text = new Base64TextBuilder()
        let encryptedSize = 0
        await forEachBase64Chunk(data, CRYPTOPRO_CONFIG.chunkSize, async (chunk, isLast) => {
            // An intermediate result may be empty — that is normal
            const part = await withChunkTimeout(envelopedData.StreamEncrypt(chunk, isLast), 'StreamEncrypt')
            if (part) {
                const bytes = base64ToBytes(part)
                encryptedSize += bytes.length
                await text.append(bytes)
            }
        })
        if (encryptedSize === 0) {
            throw new CadesPluginError(CADES_ERROR_CODES.ENCRYPT_FAILED, 'The plugin returned an empty encrypted message')
        }
        return { encrypted: await text.toBlob() }
    } catch (error) {
        throw wrapPluginError(error, CADES_ERROR_CODES.ENCRYPT_FAILED)
    }
}
