import { getCadesPlugin } from '@utils/cadesPlugin/getCadesPlugin'
import { CertificateAsync } from '@interfaces/sign'
import { SIGNATURE_TYPES, SignatureType } from '@constants/cadesPlugin'

/**
 * Signer of a CAdES signature: the certificate with its whole chain, the signing time and document name attributes,
 * and the timestamp service for `CADES_T`. The same signer is used to sign data and to sign a hash.
 */
export default async function createSigner(
    certificate: CertificateAsync,
    { cadesType, tsaUrl }: { cadesType: SignatureType; tsaUrl: string }
) {
    const cadesplugin = getCadesPlugin()

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

    return oSigner
}
