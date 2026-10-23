import { blobToBase64 } from '@features/file'
import { resolveCadesType } from '../cadesType'
import { createSigner } from '../createSigner'
import { wrapPluginError, CADES_ERROR_CODES } from '../errors'
import { resolveHashAlgorithm } from '../hashAlgorithm'
import { getCadesPlugin } from '../plugin'
import { signatureDer, toSignedCms } from '../signature'
import { CertificateData, SignOptions, SignedCms } from '../types'

/**
 * Attached signature by `SignCades`: the plugin gets the whole file as one base64 string.
 *
 * @remarks
 * The plugin documentation limits such data to 10–60 MB depending on the computer; the limit is checked by the operations
 * for the user's file before any work ({@link checkAttachedSize}), not here: `encryptAndSign` signs the larger `.enc`.
 * The key algorithm is checked, as for signing by hash: for keys other than GOST 2012 `SignCades` silently chooses
 * SHA-1 (RSA) or fails (CNG).
 *
 * @throws {@link CadesPluginError} `UNSUPPORTED_KEY` before the file is read;
 * `CERT_*`, `USER_CANCELLED`, `SIGN_FAILED`, `VERIFY_FAILED` from the plugin
 */
export async function signAttachedNative(file: Blob, cert: CertificateData, options: SignOptions = {}): Promise<SignedCms> {
    resolveHashAlgorithm(cert.keyAlgorithmOid)
    const { cadesplugin } = await getCadesPlugin()
    const cadesType = resolveCadesType(cadesplugin, options)

    let base64: string
    try {
        const signedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
        await signedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY)
        await signedData.propset_Content(await blobToBase64(file))
        base64 = await signedData.SignCades(await createSigner(cert.itself, options), cadesType, false)
    } catch (error) {
        throw wrapPluginError(error, CADES_ERROR_CODES.SIGN_FAILED)
    }

    const der = signatureDer(base64)

    try {
        const verifier = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
        await verifier.VerifyCades(base64, cadesType, false)
    } catch (error) {
        throw wrapPluginError(error, CADES_ERROR_CODES.VERIFY_FAILED)
    }

    return toSignedCms(base64, der, 'native')
}
