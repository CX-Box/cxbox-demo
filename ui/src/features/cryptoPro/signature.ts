import { base64ToBytes } from '@features/file'
import { SEQUENCE } from './derTags'
import { CadesPluginError, CADES_ERROR_CODES } from './errors'
import { SignedCms } from './types'

/**
 * DER of a signature returned by the plugin (`SignHash`, `SignCades`).
 *
 * @remarks
 * The plugin may return an empty string without an exception (e.g. RSA with SHA-2), so the content is checked,
 * not the absence of errors: a CMS starts with a SEQUENCE.
 *
 * @throws {@link CadesPluginError} `SIGN_FAILED` for an empty or malformed signature, including text that is not base64
 */
export function signatureDer(base64: string): Uint8Array {
    const malformed = (cause?: unknown) =>
        new CadesPluginError(CADES_ERROR_CODES.SIGN_FAILED, 'The plugin returned an empty or malformed signature', { cause })
    let der: Uint8Array
    try {
        der = base64ToBytes(base64)
    } catch (error) {
        throw malformed(error)
    }
    if (der[0] !== SEQUENCE) {
        throw malformed()
    }
    return der
}

/**
 * {@link SignedCms} of a signature returned by the plugin: its base64 text (the `.sig` file) and its DER.
 *
 * @remarks
 * The text is kept as the plugin returned it, with `\r\n` every 76 characters, as `.sig` files were before;
 * CryptoPro tools read it with and without line breaks. The DER is decoded with the line breaks removed ({@link base64ToBytes}).
 */
export const toSignedCms = (base64: string, der: Uint8Array, method?: SignedCms['method']): SignedCms => ({
    signature: new Blob([base64], { type: 'application/octet-stream' }),
    der: new Blob([der], { type: 'application/octet-stream' }),
    method
})
