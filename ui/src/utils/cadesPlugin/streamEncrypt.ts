import { CertificateAsync } from '@interfaces/sign'
import { getCadesPlugin } from '@utils/cadesPlugin/getCadesPlugin'
import { checkPluginMethods } from '@utils/cadesPlugin/pluginCalls'
import { Base64Text, base64ToBytes, CryptoInput, CryptoPartsOptions, passPluginParts, toBase64Text } from '@utils/cadesPlugin/base64Data'
import { checkBase64Part, checkEnvelopedData } from '@utils/cadesPlugin/cryptoResult'

/**
 * Checks that the plugin can encrypt in parts, before the data is passed to it.
 *
 * @throws CadesPluginError `PLUGIN_OUTDATED`
 */
export async function checkStreamEncrypt() {
    checkPluginMethods(await getCadesPlugin().CreateObjectAsync('CAdESCOM.CPEnvelopedData'), 'StreamEncrypt')
}

/**
 * Encrypts data for the certificate part by part, so a file of any size never goes to the plugin in one message.
 *
 * The plugin returns the encrypted message in parts of base64: each is decoded and the bytes are joined,
 * which gives the same CMS EnvelopedData as `Encrypt` (BER with indefinite lengths) — the `.enc` file format does not change.
 * Each part must be whole base64, and the joined message must be a finished EnvelopedData: otherwise the `.enc` file
 * would not be decrypted by the recipient, so it is not returned.
 *
 * @returns base64 of the encrypted message
 * @throws CadesPluginError `PLUGIN_OUTDATED` when the plugin has no `StreamEncrypt`;
 * CadesPluginError with the number of the part when the plugin fails; `RESULT_DAMAGED` when the message is not whole;
 * Error "Interrupted" when `isInterrupted` returns `true`
 */
export async function streamEncrypt(
    certificate: CertificateAsync,
    data: CryptoInput,
    options: CryptoPartsOptions = {}
): Promise<Base64Text> {
    const cadesplugin = getCadesPlugin()

    const oEnvelopedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CPEnvelopedData')
    checkPluginMethods(oEnvelopedData, 'StreamEncrypt')
    await oEnvelopedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY)
    const oRecipients = await oEnvelopedData.Recipients
    await oRecipients.Add(certificate)

    // each part goes to a Blob at once, so the decoded bytes do not pile up in memory
    const encrypted: Blob[] = []
    await passPluginParts(
        data,
        async (part, isLast) => {
            const result = (await oEnvelopedData.StreamEncrypt(part, isLast))?.replace(/\s/g, '')
            if (result) {
                checkBase64Part(result, encrypted.length + 1)
                encrypted.push(new Blob([base64ToBytes(result)]))
            }
        },
        options
    )

    const message = new Blob(encrypted)
    await checkEnvelopedData(message)
    return toBase64Text(message, options.isInterrupted)
}
