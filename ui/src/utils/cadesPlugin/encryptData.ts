import { blobToBase64 } from '@utils/cadesPlugin/blobToBase64'
import { CertificateAsync } from '@interfaces/sign'
import { encryptBase64 } from '@utils/cadesPlugin/encryptBase64'

export async function encryptData(certificate: CertificateAsync, fileOrBase64: Blob | string): Promise<string> {
    let base64Data: string

    if (typeof fileOrBase64 === 'string') {
        base64Data = fileOrBase64
    } else {
        base64Data = await blobToBase64(fileOrBase64)
    }

    return encryptBase64(certificate, base64Data)
}
