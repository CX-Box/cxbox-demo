import { CertificateAsync } from '@interfaces/sign'
import createSignatureForBase64 from '@utils/cadesPlugin/createSignatureForBase64'
import createSignatureForHash from '@utils/cadesPlugin/createSignatureForHash'
import verifySignature, { verifyHashSignature } from '@utils/cadesPlugin/verifySignature'
import { getHashSigningAlgorithm, hashData } from '@utils/cadesPlugin/hashData'
import { checkRecipientFileSize, fitsPluginMessage } from '@utils/cadesPlugin/checkPluginDataSize'
import { attachContent } from '@utils/cadesPlugin/attachContent'
import {
    Base64Text,
    checkInterrupted,
    CryptoInput,
    CryptoPartsOptions,
    dataSize,
    toBase64String,
    toBytesBlob
} from '@utils/cadesPlugin/base64Data'
import {
    DEFAULT_SIGNATURE_PACKAGE,
    DEFAULT_SIGNATURE_TYPE,
    SIGNATURE_PACKAGE,
    SignaturePackage,
    SignatureType,
    TSA_URL
} from '@constants/cadesPlugin'

/**
 * Signs a file or base64 data with the CryptoPro plugin and, with `verify`, checks the created signature.
 *
 * Data that fits into one message to the plugin is signed as before: whole, with `SignCades`.
 * Larger data needs a GOST certificate: it is signed by the hash of the data passed to the plugin in parts,
 * so the size of a file is not limited by the plugin; an attached signature is then assembled from the detached one.
 *
 * @returns base64 of the signature: a string, or {@link Base64Text} for an attached signature of large data
 * @throws CadesPluginError: `UNSUPPORTED_KEY_ALGORITHM` for large data and a certificate that is not GOST,
 * `PLUGIN_OUTDATED` for large data and a plugin without the methods for signing a hash,
 * `FILE_TOO_LARGE` for an attached signature of data larger than `RECIPIENT_MAX_FILE_SIZE`,
 * `SIGNATURE_VERIFICATION_FAILED` when the created signature is not valid;
 * `PLUGIN_NOT_RESPONDING` when the plugin does not answer a part of large data;
 * `RESULT_DAMAGED` when the data or the assembled attached signature is not whole;
 * Error "Interrupted" when `isInterrupted` returns `true` between the parts
 */
export default async function createVerifiedSignature(
    certificate: CertificateAsync,
    data: CryptoInput,
    {
        cadesType = DEFAULT_SIGNATURE_TYPE,
        signaturePackage = DEFAULT_SIGNATURE_PACKAGE,
        tsaUrl = TSA_URL,
        // a signature by the hash of large data is always verified
        verify = true,
        onProgress,
        isInterrupted
    }: { cadesType?: SignatureType; signaturePackage?: SignaturePackage; tsaUrl?: string; verify?: boolean } & CryptoPartsOptions
): Promise<string | Base64Text> {
    const isAttached = signaturePackage !== SIGNATURE_PACKAGE.detached
    if (isAttached) {
        checkRecipientFileSize(dataSize(data), 'sign')
    }

    if (!fitsPluginMessage(data)) {
        const algorithm = await getHashSigningAlgorithm(certificate)
        const hashedData = await hashData(data, algorithm, { onProgress, isInterrupted })
        checkInterrupted(isInterrupted)

        const signature = await createSignatureForHash(certificate, hashedData, { cadesType, tsaUrl })

        // always: the check takes the hash, not the data again, so it costs one plugin call even when `verify` is `false`
        await verifyHashSignature(signature, hashedData, { cadesType })

        if (!isAttached) {
            return signature
        }
        checkInterrupted(isInterrupted)
        return attachContent(signature, await toBytesBlob(data, isInterrupted), isInterrupted)
    }

    const base64Data = await toBase64String(data)

    const signature = await createSignatureForBase64(certificate, base64Data, { cadesType, signaturePackage, tsaUrl })

    if (verify) {
        await verifySignature(signature, base64Data, { cadesType, signaturePackage })
    }

    return signature
}
