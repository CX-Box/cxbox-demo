// Signing by hash: HashedData + SignHash, verification by VerifyHash (README, «What the wrapper solves», hash algorithm by the key).

import { resolveCadesType } from './cadesType'
import { createSigner } from './createSigner'
import { wrapPluginError, CADES_ERROR_CODES } from './errors'
import { resolveHashAlgorithm } from './hashAlgorithm'
import { hashBlob } from './hashBlob'
import { getCadesPlugin } from './plugin'
import { signatureDer, toSignedCms } from './signature'
import { CertificateData, SignOptions, SignedCms } from './types'

/** Detached signature with the file hash it signs; the hash is needed to assemble an attached signature. */
export interface DetachedSignature {
    /** CMS SignedData, base64 as returned by the plugin */
    base64: string
    /** The same CMS in DER */
    der: Uint8Array
    /** File hash, hex as `HashedData.Value` returns it */
    hash: string
}

/**
 * Detached signature of a Blob by its hash: the file is read in chunks and never held whole.
 *
 * @internal used by {@link signDetached} and the attached signature assembly
 */
export async function createDetachedSignature(file: Blob, cert: CertificateData, options: SignOptions = {}): Promise<DetachedSignature> {
    const algorithm = resolveHashAlgorithm(cert.keyAlgorithmOid)
    const { cadesplugin } = await getCadesPlugin()
    // The type is passed explicitly: SignHash defaults to CAdES-X Long Type 1
    const cadesType = resolveCadesType(cadesplugin, options)

    let hashedData: CAdESCOM.CPHashedDataAsync
    let base64: string
    let hash: string
    try {
        hashedData = await hashBlob(file, algorithm)
        hash = await hashedData.Value
        const signer = await createSigner(cert.itself, options)
        const signedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
        base64 = await signedData.SignHash(hashedData, signer, cadesType)
    } catch (error) {
        throw wrapPluginError(error, CADES_ERROR_CODES.SIGN_FAILED)
    }

    const der = signatureDer(base64)

    try {
        const verifier = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
        await verifier.VerifyHash(hashedData, base64, cadesType)
        return { base64, der, hash }
    } catch (error) {
        throw wrapPluginError(error, CADES_ERROR_CODES.VERIFY_FAILED)
    }
}

/**
 * Detached CAdES signature of a file of any size.
 *
 * @remarks
 * The hash algorithm follows the certificate key ({@link resolveHashAlgorithm}); the signature is verified by `VerifyHash`
 * before it is returned.
 *
 * @example
 * ```ts
 * const { signature } = await signDetached(file, cert)
 * await CxBoxApiInstance.uploadFile(signature, `${name}.sig`)
 * ```
 *
 * @throws {@link CadesPluginError} `UNSUPPORTED_KEY` before the plugin is called; `CERT_*`, `USER_CANCELLED`, `SIGN_FAILED`,
 * `VERIFY_FAILED` from the plugin
 */
export async function signDetached(file: Blob, cert: CertificateData, options?: SignOptions): Promise<SignedCms> {
    const { base64, der } = await createDetachedSignature(file, cert, options)
    return toSignedCms(base64, der)
}
