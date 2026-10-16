import { getCadesPlugin } from '@utils/cadesPlugin/getCadesPlugin'
import { CertificateAsync } from '@interfaces/sign'
import { SignaturePackage, SignatureType } from '@constants/cadesPlugin'
import createSigner from '@utils/cadesPlugin/createSigner'

export default async function createSignatureForBase64(
    certificate: CertificateAsync,
    base64Data: string,
    { cadesType, signaturePackage, tsaUrl }: { cadesType: SignatureType; signaturePackage: SignaturePackage; tsaUrl: string }
): Promise<string> {
    const cadesplugin = getCadesPlugin()

    const oSigner = await createSigner(certificate, { cadesType, tsaUrl })

    // Signing
    const oSignedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
    await oSignedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY)
    await oSignedData.propset_Content(base64Data)

    const isDetached = signaturePackage === 'detached'

    return await oSignedData.SignCades(oSigner, cadesplugin[`CADESCOM_${cadesType}`], isDetached)
}
