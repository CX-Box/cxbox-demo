import { getCadesPlugin } from '@utils/cadesPlugin/getCadesPlugin'
import { CertificateAsync } from '@interfaces/sign'

export async function encryptBase64(certificate: CertificateAsync, base64Data: string): Promise<string> {
    const cadesplugin = getCadesPlugin()

    const oEnvelopedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CPEnvelopedData')
    await oEnvelopedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY)
    await oEnvelopedData.propset_Content(base64Data)

    const oRecipients = await oEnvelopedData.Recipients
    await oRecipients.Add(certificate)

    return await oEnvelopedData.Encrypt(cadesplugin.CADESCOM_ENCODE_BASE64)
}
