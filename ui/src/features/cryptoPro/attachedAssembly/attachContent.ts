import * as asn1js from 'asn1js'
import { EXPLICIT_0, OCTET_STRING, SEQUENCE } from '../derTags'
import { CadesPluginError, CADES_ERROR_CODES } from '../errors'
import { ID_DATA, ID_SIGNED_DATA } from './oids'

/** Bit of the first length octet: the long form, the low bits are the number of length octets that follow */
const LONG_FORM = 0x80

/**
 * DER length octets for any file size: arithmetic instead of bit operations, which are 32-bit in JS and would break from 2 GiB.
 * A negative, fractional or unsafe length is a programming error and throws instead of producing a broken signature.
 *
 * @internal exported for tests
 */
export function encodeLength(length: number): number[] {
    if (!Number.isSafeInteger(length) || length < 0) {
        throw new RangeError(`Invalid DER length ${length}`)
    }
    if (length < LONG_FORM) {
        return [length]
    }
    const octets: number[] = []
    for (let rest = length; rest > 0; rest = Math.floor(rest / 256)) {
        octets.unshift(rest % 256)
    }
    return [LONG_FORM + octets.length, ...octets]
}

type Part = Uint8Array | Blob

const size = (part: Part) => (part instanceof Blob ? part.size : part.byteLength)

/** DER TLV of the parts: the length is the sum of their sizes, a Blob is not read */
const der = (tag: number, parts: Part[]): Part[] => [
    new Uint8Array([tag, ...encodeLength(parts.reduce((sum, part) => sum + size(part), 0))]),
    ...parts
]

/** Bytes of the parsed TLV as they were in the input — copied without re-encoding, so the signature stays valid */
const raw = (block: asn1js.AsnType) => block.valueBeforeDecodeView

const invalid = (reason: string) => new CadesPluginError(CADES_ERROR_CODES.INVALID_CMS, `Invalid signature structure: ${reason}`)

/** Children of a constructed block with the given first octet (tag) */
function children(block: asn1js.AsnType | undefined, tag: number, what: string): asn1js.AsnType[] {
    if (!block) {
        throw invalid(`${what} is missing`)
    }
    if (!(block instanceof asn1js.Constructed) || raw(block)[0] !== tag) {
        throw invalid(`${what} has tag 0x${raw(block)[0]?.toString(16)} instead of 0x${tag.toString(16)}`)
    }
    return block.valueBlock.value
}

/**
 * Turns a detached CMS signature into an attached one by inserting the content into `encapContentInfo`.
 *
 * @remarks
 * RFC 5652: with signed attributes the signature covers the attributes holding the content hash, not the content,
 * so attached = detached + `eContent`; the signature value does not change. The signature is parsed by asn1js and rebuilt
 * from the raw bytes of its parts, with `[0] EXPLICIT OCTET STRING` added; the enclosing lengths are counted from the parts.
 * The rebuilt headers are DER even for a BER input. The content stays a part of the resulting Blob and is not read here.
 *
 * @param detached - CMS SignedData with `eContentType` id-data and without `eContent`
 * @throws {@link CadesPluginError} `INVALID_CMS` for another structure or an existing `eContent`
 */
export function attachContent(detached: Uint8Array, content: Blob): Blob {
    const { offset, result } = asn1js.fromBER(detached)
    if (offset === -1) {
        throw invalid(detached.length ? result.error : 'ContentInfo is missing')
    }
    if (offset !== detached.length) {
        throw invalid('data after ContentInfo')
    }
    const contentInfo = children(result, SEQUENCE, 'ContentInfo')
    const [contentType, explicit] = contentInfo
    if (
        contentInfo.length !== 2 ||
        !(contentType instanceof asn1js.ObjectIdentifier) ||
        contentType.valueBlock.toString() !== ID_SIGNED_DATA
    ) {
        throw invalid('not a ContentInfo with SignedData')
    }
    const explicitContent = children(explicit, EXPLICIT_0, 'content [0]')
    if (explicitContent.length !== 1) {
        throw invalid(`content [0] has ${explicitContent.length} values`)
    }
    const [version, digestAlgorithms, encap, ...tail] = children(explicitContent[0], SEQUENCE, 'SignedData')
    const [eContentType, ...eContent] = children(encap, SEQUENCE, 'encapContentInfo')
    if (!(eContentType instanceof asn1js.ObjectIdentifier) || eContentType.valueBlock.toString() !== ID_DATA) {
        throw invalid('eContentType is not id-data')
    }
    if (eContent.length) {
        throw invalid('the signature already contains content')
    }

    const encapContentInfo = der(SEQUENCE, [raw(eContentType), ...der(EXPLICIT_0, der(OCTET_STRING, [content]))])
    const signedData = der(SEQUENCE, [raw(version), raw(digestAlgorithms), ...encapContentInfo, ...tail.map(raw)])
    return new Blob(der(SEQUENCE, [raw(contentType), ...der(EXPLICIT_0, signedData)]), { type: 'application/octet-stream' })
}
