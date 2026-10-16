import { getCadesPlugin } from '@utils/cadesPlugin/getCadesPlugin'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'
import { checkPluginMethods, pluginErrorMessage } from '@utils/cadesPlugin/pluginCalls'
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
        throw new CadesPluginError(pluginErrorMessage(err), CadesPluginError.SIGNATURE_VERIFICATION_FAILED, { cause: err })
    }
}

/**
 * Verifies a detached signature by the hash of the data, without passing the data to the plugin again.
 *
 * @param hashedData - the hash the signature was created for, made by `hashData`
 * @throws CadesPluginError with code `SIGNATURE_VERIFICATION_FAILED`; `PLUGIN_OUTDATED` when the plugin has no `VerifyHash`
 */
export async function verifyHashSignature(
    sSignedMessage: string,
    hashedData: CAdESCOM.CPHashedDataAsync,
    { cadesType }: { cadesType: SignatureType }
): Promise<void> {
    const cadesplugin = getCadesPlugin()

    const oSignedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
    checkPluginMethods(oSignedData, 'VerifyHash')
    try {
        await oSignedData.VerifyHash(hashedData, sSignedMessage, cadesplugin[`CADESCOM_${cadesType}`])
    } catch (err) {
        throw new CadesPluginError(pluginErrorMessage(err), CadesPluginError.SIGNATURE_VERIFICATION_FAILED, { cause: err })
    }
}
