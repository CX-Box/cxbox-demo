import { getCadesPlugin } from '@utils/cadesPlugin/getCadesPlugin'
import { CertificateAsync } from '@interfaces/sign'
import { SIGNATURE_TYPES, SignaturePackage, SignatureType } from '@constants/cadesPlugin'

export default async function createSignatureForBase64(
    certificate: CertificateAsync,
    base64Data: string,
    { cadesType, signaturePackage, tsaUrl }: { cadesType: SignatureType; signaturePackage: SignaturePackage; tsaUrl: string }
): Promise<string> {
    const cadesplugin = getCadesPlugin()

    // Setting up a signer
    const oSigner = await cadesplugin.CreateObjectAsync('CAdESCOM.CPSigner')

    const oSigningTimeAttr = await cadesplugin.CreateObjectAsync('CAdESCOM.CPAttribute')
    await oSigningTimeAttr.propset_Name(cadesplugin.CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME)
    const oTimeNow = new Date()
    await oSigningTimeAttr.propset_Value(oTimeNow)

    const attr = await oSigner.AuthenticatedAttributes2
    await attr.Add(oSigningTimeAttr)

    const oDocumentNameAttr = await cadesplugin.CreateObjectAsync('CAdESCOM.CPAttribute')
    await oDocumentNameAttr.propset_Name(cadesplugin.CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_NAME)
    await oDocumentNameAttr.propset_Value('Document Name')
    await attr.Add(oDocumentNameAttr)

    await oSigner.propset_Certificate(certificate)
    await oSigner.propset_Options(cadesplugin.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN)

    if (cadesType === SIGNATURE_TYPES.CADES_T) {
        await oSigner.propset_TSAAddress(tsaUrl)
    }

    // Signing
    const oSignedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
    await oSignedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY)
    await oSignedData.propset_Content(base64Data)

    const isDetached = signaturePackage === 'detached'

    return await oSignedData.SignCades(oSigner, cadesplugin[`CADESCOM_${cadesType}`], isDetached)
}
