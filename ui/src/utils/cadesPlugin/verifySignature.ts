import { getCadesPlugin } from '@utils/cadesPlugin/getCadesPlugin'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'
import { pluginErrorMessage } from '@utils/cadesPlugin/pluginCalls'
import { SignaturePackage, SignatureType } from '@constants/cadesPlugin'

export default async function verifySignature(
    sSignedMessage: string,
    base64DataToVerify: string,
    { cadesType, signaturePackage = 'detached' }: { cadesType: SignatureType; signaturePackage?: SignaturePackage }
): Promise<void> {
    const cadesplugin = getCadesPlugin()
    const isDetached = signaturePackage === 'detached'

    try {
        const oSignedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')

        if (isDetached) {
            await oSignedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY)
            await oSignedData.propset_Content(base64DataToVerify)
        }

        await oSignedData.VerifyCades(sSignedMessage, cadesplugin[`CADESCOM_${cadesType}`], isDetached)
    } catch (err) {
        const errorMessage = err instanceof Error ? cadesplugin.getLastError?.(err) ?? String(err) : String(err)

        throw new CadesPluginError(errorMessage, CadesPluginError.SIGNATURE_VERIFICATION_FAILED, { cause: err })
    }
}

/**
 * Verifies a detached signature by the hash of the data, without passing the data to the plugin again.
 * The plugin compares the hash with `messageDigest` of the signature, not with the data:
 * that the hash is the one of the whole data is ensured by `hashData`.
 *
 * @param hashedData - the hash the signature was created for, made by `hashData`
 * @throws CadesPluginError with code `SIGNATURE_VERIFICATION_FAILED`
 */
export async function verifyHashSignature(
    sSignedMessage: string,
    hashedData: CAdESCOM.CPHashedDataAsync,
    { cadesType }: { cadesType: SignatureType }
): Promise<void> {
    const cadesplugin = getCadesPlugin()

    try {
        const oSignedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
        await oSignedData.VerifyHash(hashedData, sSignedMessage, cadesplugin[`CADESCOM_${cadesType}`])
    } catch (err) {
        throw new CadesPluginError(pluginErrorMessage(err), CadesPluginError.SIGNATURE_VERIFICATION_FAILED, { cause: err })
    }
}
