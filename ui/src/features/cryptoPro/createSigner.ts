import { DEFAULT_DOCUMENT_NAME, DEFAULT_SIGNATURE_TYPE, SIGNATURE_TYPES, TSA_URL } from './constants'
import { getCadesPlugin } from './plugin'
import { CertificateAsync, SignOptions } from './types'

/**
 * `CPSigner` with the signed attributes signingTime and documentName and the whole certificate chain in the signature.
 *
 * @remarks
 * Same signer for `SignCades` and `SignHash`. For `CADES_T` the time stamp service address is set.
 */
export async function createSigner(certificate: CertificateAsync, options: SignOptions = {}): Promise<CAdESCOM.CPSignerAsync> {
    const { cadesType = DEFAULT_SIGNATURE_TYPE, tsaUrl = TSA_URL, documentName = DEFAULT_DOCUMENT_NAME } = options
    const { cadesplugin } = await getCadesPlugin()
    const signer = await cadesplugin.CreateObjectAsync('CAdESCOM.CPSigner')
    const attributes = await signer.AuthenticatedAttributes2

    const signingTime = await cadesplugin.CreateObjectAsync('CAdESCOM.CPAttribute')
    await signingTime.propset_Name(cadesplugin.CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME)
    await signingTime.propset_Value(new Date())
    await attributes.Add(signingTime)

    const documentNameAttribute = await cadesplugin.CreateObjectAsync('CAdESCOM.CPAttribute')
    await documentNameAttribute.propset_Name(cadesplugin.CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_NAME)
    await documentNameAttribute.propset_Value(documentName)
    await attributes.Add(documentNameAttribute)

    await signer.propset_Certificate(certificate)
    await signer.propset_Options(cadesplugin.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN)
    if (cadesType === SIGNATURE_TYPES.CADES_T && tsaUrl) {
        await signer.propset_TSAAddress(tsaUrl)
    }
    return signer
}
