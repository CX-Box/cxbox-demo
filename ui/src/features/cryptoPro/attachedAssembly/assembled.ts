import * as asn1js from 'asn1js'
import * as pkijs from 'pkijs'
import { blobToBase64TextBlob, MiB } from '@features/file'
import { CadesPluginError, CADES_ERROR_CODES } from '../errors'
import { createDetachedSignature } from '../signDetached'
import { CertificateData, SignOptions, SignedCms } from '../types'
import { attachContent } from './attachContent'
import { ID_CONTENT_TYPE, ID_DATA, ID_MESSAGE_DIGEST, ID_SIGNED_DATA } from './oids'

/** Largest file whose assembled signature CryptoPro tools verified in measurements (`csptest`: 100 MB yes, 200 MB no) */
export const VERIFIABLE_SIZE = 100 * MiB

/** Not `Uint8Array.prototype.toHex` (ES2026): only Chrome 140+, Firefox 133+, Safari 18.2+, narrower than browserslist, and no polyfill */
const toHex = (bytes: Uint8Array) => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')

/**
 * Checks that the detached CMS from `SignHash` is what {@link attachContent} expects and signs exactly this file:
 * SignedData of data without `eContent`, one signer whose signed attributes have exactly one contentType = id-data
 * (RFC 5652 §5.6: it must match eContentType) and exactly one `messageDigest` equal to the file hash (§5.3).
 *
 * @internal exported for tests
 */
export async function checkDetachedCms(der: Uint8Array, hash: string): Promise<void> {
    const invalid = (reason: string) =>
        new CadesPluginError(CADES_ERROR_CODES.INVALID_CMS, `Detached signature cannot be attached: ${reason}`)
    const asn1 = asn1js.fromBER(der)
    if (asn1.offset === -1) {
        throw invalid(asn1.result.error)
    }
    if (asn1.offset !== der.length) {
        throw invalid('data after ContentInfo')
    }
    let signedData: pkijs.SignedData
    try {
        const contentInfo = new pkijs.ContentInfo({ schema: asn1.result })
        if (contentInfo.contentType !== ID_SIGNED_DATA) {
            throw invalid(`content type ${contentInfo.contentType}`)
        }
        signedData = new pkijs.SignedData({ schema: contentInfo.content })
    } catch (error) {
        throw error instanceof CadesPluginError ? error : invalid(String(error))
    }
    if (signedData.encapContentInfo.eContentType !== ID_DATA || signedData.encapContentInfo.eContent) {
        throw invalid('not a detached signature of data')
    }
    if (signedData.signerInfos.length !== 1) {
        throw invalid(`${signedData.signerInfos.length} signers`)
    }
    const attributes = signedData.signerInfos[0].signedAttrs?.attributes ?? []
    /** The value of a signed attribute that must occur once with one value */
    const single = (type: string, name: string) => {
        const found = attributes.filter(attribute => attribute.type === type)
        if (found.length !== 1 || found[0].values.length !== 1) {
            throw invalid(`${name} must be one signed attribute with one value`)
        }
        return found[0].values[0]
    }
    const contentType = single(ID_CONTENT_TYPE, 'contentType')
    if (!(contentType instanceof asn1js.ObjectIdentifier) || contentType.valueBlock.toString() !== ID_DATA) {
        throw invalid('the contentType attribute is not id-data')
    }
    const digest = single(ID_MESSAGE_DIGEST, 'messageDigest')
    if (!hash || !(digest instanceof asn1js.OctetString) || toHex(digest.valueBlock.valueHexView).toUpperCase() !== hash.toUpperCase()) {
        throw invalid('messageDigest does not match the file hash')
    }
}

/**
 * Attached signature of a file of any size, assembled from a detached signature by hash.
 *
 * @remarks
 * The plugin signs the hash (`SignHash`), our code inserts the file into the CMS ({@link attachContent}).
 * The plugin cannot verify such a signature of a large file (`VerifyCades` takes it whole): only the detached part is verified
 * by `VerifyHash`; check the result outside the browser (e.g. `csptest -sfsign -verify`) or at the recipient.
 * Why this is a valid CMS and what to agree on before using it — README, «Why» (assembled attached signature).
 *
 * Above {@link VERIFIABLE_SIZE} CryptoPro tools may fail to verify it: a warning is logged, the signature is still made.
 *
 * @throws {@link CadesPluginError} as {@link signDetached}, and `INVALID_CMS`
 */
export async function signAttachedAssembled(file: Blob, cert: CertificateData, options: SignOptions = {}): Promise<SignedCms> {
    if (file.size > VERIFIABLE_SIZE) {
        console.warn(
            `Attached signature of a ${file.size} B file is assembled: CryptoPro tools may fail to verify attached signatures ` +
                `of files over ${VERIFIABLE_SIZE} B (csptest 0x80093104 at 200 MB); prefer a detached signature`
        )
    }
    const { der, hash } = await createDetachedSignature(file, cert, options)
    await checkDetachedCms(der, hash)
    const attached = attachContent(der, file)
    return { signature: await blobToBase64TextBlob(attached), der: attached, method: 'assembled' }
}
