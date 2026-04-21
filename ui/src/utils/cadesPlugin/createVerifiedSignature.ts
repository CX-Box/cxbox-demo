import { blobToBase64 } from '@utils/cadesPlugin/blobToBase64'
import { CertificateAsync } from '@interfaces/sign'
import createSignatureForBase64 from '@utils/cadesPlugin/createSignatureForBase64'
import verifySignature from '@utils/cadesPlugin/verifySignature'
import { DEFAULT_SIGNATURE_PACKAGE, DEFAULT_SIGNATURE_TYPE, SignaturePackage, SignatureType, TSA_URL } from '@constants/cadesPlugin'

export default async function createVerifiedSignature(
    certificate: CertificateAsync,
    fileOrBase64: Blob | string,
    {
        cadesType = DEFAULT_SIGNATURE_TYPE,
        signaturePackage = DEFAULT_SIGNATURE_PACKAGE,
        tsaUrl = TSA_URL
    }: { cadesType?: SignatureType; signaturePackage?: SignaturePackage; tsaUrl?: string }
): Promise<string> {
    let base64Data: string

    if (typeof fileOrBase64 === 'string') {
        base64Data = fileOrBase64
    } else {
        base64Data = await blobToBase64(fileOrBase64)
    }

    const signature = await createSignatureForBase64(certificate, base64Data, { cadesType, signaturePackage, tsaUrl })

    await verifySignature(signature, base64Data, { cadesType, signaturePackage })

    return signature
}
