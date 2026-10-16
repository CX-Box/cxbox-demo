import { getCadesPlugin } from '@utils/cadesPlugin/getCadesPlugin'
import { CertificateAsync } from '@interfaces/sign'
import { SignatureType } from '@constants/cadesPlugin'
import createSigner from '@utils/cadesPlugin/createSigner'
import { checkPluginMethods } from '@utils/cadesPlugin/pluginCalls'

/**
 * Creates a detached CAdES signature for the hash of the data: the data itself is not passed to the plugin,
 * so the size of a file is not limited by the plugin. The signature is the same as `SignCades` makes
 * for this data: the same signer, attributes and `messageDigest`.
 *
 * @param hashedData - the hash of the data made by `hashData`
 * @returns base64 of the signature
 * @throws CadesPluginError `PLUGIN_OUTDATED` when the plugin has no `SignHash`
 */
export default async function createSignatureForHash(
    certificate: CertificateAsync,
    hashedData: CAdESCOM.CPHashedDataAsync,
    { cadesType, tsaUrl }: { cadesType: SignatureType; tsaUrl: string }
): Promise<string> {
    const cadesplugin = getCadesPlugin()

    const oSignedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
    checkPluginMethods(oSignedData, 'SignHash')
    const oSigner = await createSigner(certificate, { cadesType, tsaUrl })

    return await oSignedData.SignHash(hashedData, oSigner, cadesplugin[`CADESCOM_${cadesType}`])
}
