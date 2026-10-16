import { blobToBase64 } from '@utils/cadesPlugin/blobToBase64'
import { CertificateAsync } from '@interfaces/sign'
import createSignatureForBase64 from '@utils/cadesPlugin/createSignatureForBase64'
import verifySignature, { verifyHashSignature } from '@utils/cadesPlugin/verifySignature'
import createSignatureForHash from '@utils/cadesPlugin/createSignatureForHash'
import { getHashAlgorithm, hashData } from '@utils/cadesPlugin/hashData'
import { checkAttachedFileSize, checkMaxFileSize, fitsPluginMessage } from '@utils/cadesPlugin/checkPluginDataSize'
import { CryptoPartsOptions, dataSize } from '@utils/cadesPlugin/base64Data'
import {
    DEFAULT_SIGNATURE_PACKAGE,
    DEFAULT_SIGNATURE_TYPE,
    SIGNATURE_PACKAGE,
    SignaturePackage,
    SignatureType,
    TSA_URL
} from '@constants/cadesPlugin'

/**
 * Signs a file or base64 data with the CryptoPro plugin and verifies the created signature.
 *
 * Data that fits into one message to the plugin is signed as before: whole, with `SignCades`, and verified with the data.
 * A detached signature of larger data is made by the hash of the data passed to the plugin in parts
 * (see `hashData`), so the size of a file is not limited by the plugin; it is verified by the same hash.
 * An attached signature holds the data, so it is always made whole and is limited by `ATTACHED_MAX_FILE_SIZE`.
 *
 * @param onProgress - called with the parts of a large file passed to the plugin; not called for data signed whole
 * @returns base64 of the signature
 * @throws CadesPluginError `FILE_TOO_LARGE` for data larger than `MAX_CRYPTO_FILE_SIZE`,
 * or than `ATTACHED_MAX_FILE_SIZE` for an attached signature, before the data is passed to the plugin;
 * `SIGNATURE_VERIFICATION_FAILED` when the created signature is not valid;
 * `PLUGIN_NOT_RESPONDING` or an error with the number of the part when the plugin fails on a part of large data
 */
export default async function createVerifiedSignature(
    certificate: CertificateAsync,
    fileOrBase64: Blob | string,
    {
        cadesType = DEFAULT_SIGNATURE_TYPE,
        signaturePackage = DEFAULT_SIGNATURE_PACKAGE,
        tsaUrl = TSA_URL,
        onProgress
    }: { cadesType?: SignatureType; signaturePackage?: SignaturePackage; tsaUrl?: string } & CryptoPartsOptions
): Promise<string> {
    checkMaxFileSize(dataSize(fileOrBase64))

    if (signaturePackage !== SIGNATURE_PACKAGE.detached) {
        checkAttachedFileSize(dataSize(fileOrBase64))
    } else if (!fitsPluginMessage(fileOrBase64)) {
        const hashedData = await hashData(fileOrBase64, await getHashAlgorithm(certificate), { onProgress })
        const hashSignature = await createSignatureForHash(certificate, hashedData, { cadesType, tsaUrl })
        await verifyHashSignature(hashSignature, hashedData, { cadesType })
        return hashSignature
    }

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
