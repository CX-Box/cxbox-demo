import { FileTooLargeError } from '@features/file'
import { CRYPTOPRO_CONFIG } from '../config'
import { loadAttachedAssembly } from '../attachedAssembly'
import { wrapPluginError, CADES_ERROR_CODES } from '../errors'
import { loadOptionalModule } from '../optionalModule'
import { CertificateData, SignOptions, SignedCms } from '../types'
import { signAttachedNative } from './native'

/**
 * Attached CAdES signature: the file is inside the signature.
 *
 * @remarks
 * With `REACT_APP_CRYPTOPRO_ATTACHED_ASSEMBLY=true` every file, of any size, is assembled from a detached signature by hash
 * (`method: 'assembled'`), so that all attached signatures are made the same way. Otherwise — `SignCades` of the whole file
 * (`method: 'native'`) up to `CRYPTOPRO_CONFIG.nativeAttachedMaxSize` (40 MiB), larger files get `FILE_TOO_LARGE` before the file is read.
 * The assembly is an optional module loaded lazily; if it is removed from the application — `ASSEMBLY_NOT_AVAILABLE`.
 *
 * @example
 * ```ts
 * const { signature, method } = await signAttached(file, cert)
 * ```
 *
 * @throws {@link CadesPluginError} `FILE_TOO_LARGE`, `ASSEMBLY_NOT_AVAILABLE`, `SIGN_FAILED` if the module chunk is not loaded,
 * and the errors of {@link signDetached} / `SignCades`
 */
export async function signAttached(file: Blob, cert: CertificateData, options?: SignOptions): Promise<SignedCms> {
    const { nativeAttachedMaxSize, attachedAssembly } = CRYPTOPRO_CONFIG
    if (attachedAssembly) {
        const { signAttachedAssembled } = await loadOptionalModule(loadAttachedAssembly, 'attachedAssembly', {
            missing: CADES_ERROR_CODES.ASSEMBLY_NOT_AVAILABLE,
            failed: CADES_ERROR_CODES.SIGN_FAILED
        })
        return signAttachedAssembled(file, cert, options)
    }
    if (file.size <= nativeAttachedMaxSize) {
        return signAttachedNative(file, cert, options)
    }
    throw wrapPluginError(new FileTooLargeError(file.size, nativeAttachedMaxSize))
}
