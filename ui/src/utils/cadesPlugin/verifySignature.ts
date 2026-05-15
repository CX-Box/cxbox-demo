import { getCadesPlugin } from '@utils/cadesPlugin/getCadesPlugin'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'
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
