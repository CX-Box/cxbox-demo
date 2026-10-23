import { checkAttachedSize, signAttached } from './attached'
import { DEFAULT_SIGNATURE_PACKAGE, SIGNATURE_PACKAGE, SignaturePackage } from './constants'
import { encrypt } from './encrypt'
import { signDetached } from './signDetached'
import { CertificateData, EncryptResult, SignedCms, SignOptions, SignResult } from './types'

export interface OperationOptions extends SignOptions {
    /** @defaultValue `detached` */
    signaturePackage?: SignaturePackage
}

/** The `.sig` and `.enc` files of a combined operation */
export interface SignedAndEncrypted extends SignResult, EncryptResult {}

/** The attached size limit is for the file the user chose: checked before any work, whatever is signed later (the file or its .enc) */
function checkFileSize(file: Blob, options: OperationOptions): void {
    if (options.signaturePackage === SIGNATURE_PACKAGE.attached) {
        checkAttachedSize(file.size)
    }
}

/** Signature with its DER, by the package from the options */
function signCms(file: Blob, signer: CertificateData, options: OperationOptions): Promise<SignedCms> {
    const { signaturePackage = DEFAULT_SIGNATURE_PACKAGE, ...signOptions } = options
    const signFile = signaturePackage === SIGNATURE_PACKAGE.attached ? signAttached : signDetached
    return signFile(file, signer, signOptions)
}

/**
 * Signs a file: detached by hash or attached.
 *
 * @example
 * ```ts
 * const { signature, method } = await sign(file, cert, { signaturePackage: 'attached' })
 * ```
 *
 * @throws {@link CadesPluginError} `FILE_TOO_LARGE` for an attached signature of a file over the limit, before any work
 */
export async function sign(file: Blob, signer: CertificateData, options: OperationOptions = {}): Promise<SignResult> {
    checkFileSize(file, options)
    const { signature, method } = await signCms(file, signer, options)
    return { signature, method }
}

/**
 * Signs a file and encrypts it for the recipient.
 *
 * @remarks
 * Detached: the signature is of the file, the file is encrypted. Attached: the signature contains the file,
 * so the signature itself (its DER) is encrypted.
 *
 * @example
 * ```ts
 * const { signature, encrypted } = await signAndEncrypt(file, signer, recipient, { signaturePackage: 'detached' })
 * ```
 *
 * @throws {@link CadesPluginError} as {@link sign} and {@link encrypt}
 */
export async function signAndEncrypt(
    file: Blob,
    signer: CertificateData,
    recipient: CertificateData,
    options: OperationOptions = {}
): Promise<SignedAndEncrypted> {
    checkFileSize(file, options)
    const { signature, method, der } = await signCms(file, signer, options)
    const attached = options.signaturePackage === SIGNATURE_PACKAGE.attached
    const { encrypted } = await encrypt(attached ? der : file, recipient)
    return { signature, method, encrypted }
}

/**
 * Encrypts a file for the recipient and signs the result.
 *
 * @remarks
 * The bytes of the `.enc` file as it is uploaded (base64 text) are signed, so the signature verifies against that file.
 * The attached size limit applies to the source file, as for {@link sign}, and is checked before encryption.
 *
 * @example
 * ```ts
 * const { encrypted, signature } = await encryptAndSign(file, signer, recipient)
 * ```
 *
 * @throws {@link CadesPluginError} as {@link encrypt} and {@link sign}
 */
export async function encryptAndSign(
    file: Blob,
    signer: CertificateData,
    recipient: CertificateData,
    options: OperationOptions = {}
): Promise<SignedAndEncrypted> {
    checkFileSize(file, options)
    const { encrypted } = await encrypt(file, recipient)
    const { signature, method } = await signCms(encrypted, signer, options)
    return { encrypted, signature, method }
}
