import { throwIfAborted, untilAborted } from './abort'
import { checkAttachedSize, signAttached } from './attached'
import { DEFAULT_SIGNATURE_PACKAGE, SIGNATURE_PACKAGE, SignaturePackage } from './constants'
import { encrypt } from './encrypt'
import { signDetached } from './signDetached'
import { CertificateData, EncryptResult, SignedCms, SignOptions, SignResult } from './types'

export interface OperationOptions extends SignOptions {
    /** @defaultValue `detached` */
    signaturePackage?: SignaturePackage
    /**
     * Abort — stop waiting: the operation rejects with `OPERATION_ABORTED` at once and calls the plugin no more;
     * the plugin call already running cannot be cancelled and its result is ignored.
     */
    signal?: AbortSignal
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
    const { signaturePackage = DEFAULT_SIGNATURE_PACKAGE, signal, ...signOptions } = options
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
export function sign(file: Blob, signer: CertificateData, options: OperationOptions = {}): Promise<SignResult> {
    return untilAborted(
        (async () => {
            throwIfAborted(options.signal)
            checkFileSize(file, options)
            const { signature, method } = await signCms(file, signer, options)
            return { signature, method }
        })(),
        options.signal
    )
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
export function signAndEncrypt(
    file: Blob,
    signer: CertificateData,
    recipient: CertificateData,
    options: OperationOptions = {}
): Promise<SignedAndEncrypted> {
    return untilAborted(
        (async () => {
            throwIfAborted(options.signal)
            checkFileSize(file, options)
            const { signature, method, der } = await signCms(file, signer, options)
            throwIfAborted(options.signal)
            const attached = options.signaturePackage === SIGNATURE_PACKAGE.attached
            const { encrypted } = await encrypt(attached ? der : file, recipient, { signal: options.signal })
            return { signature, method, encrypted }
        })(),
        options.signal
    )
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
export function encryptAndSign(
    file: Blob,
    signer: CertificateData,
    recipient: CertificateData,
    options: OperationOptions = {}
): Promise<SignedAndEncrypted> {
    return untilAborted(
        (async () => {
            throwIfAborted(options.signal)
            checkFileSize(file, options)
            const { encrypted } = await encrypt(file, recipient, { signal: options.signal })
            throwIfAborted(options.signal)
            const { signature, method } = await signCms(encrypted, signer, options)
            return { encrypted, signature, method }
        })(),
        options.signal
    )
}
