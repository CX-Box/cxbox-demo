import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'
import { Base64Text, base64ToBytes, toBase64Text } from '@utils/cadesPlugin/base64Data'
import { resultDamaged } from '@utils/cadesPlugin/cryptoResult'

interface Tlv {
    start: number
    valueStart: number
    end: number
}

const ID_SIGNED_DATA = [0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x02]
const ID_DATA = [0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x01]

const invalid = (reason: string) => new CadesPluginError(`Cannot attach the content to the signature: ${reason}`, CadesPluginError.UNKNOWN)

function readTlv(der: Uint8Array, offset: number, limit: number = der.length): Tlv {
    if (offset + 2 > limit) {
        throw invalid(`truncated at ${offset}`)
    }
    if ((der[offset] & 0x1f) === 0x1f) {
        throw invalid(`multi-byte tag at ${offset}`)
    }
    let length = der[offset + 1]
    let header = 2
    if (length === 0x80) {
        throw invalid(`indefinite length at ${offset}`)
    }
    if (length & 0x80) {
        const count = length & 0x7f
        if (count === 0 || count > 4 || offset + 2 + count > limit) {
            throw invalid(`bad length at ${offset}`)
        }
        length = 0
        for (let i = 0; i < count; i++) {
            length = length * 256 + der[offset + 2 + i]
        }
        header += count
    }
    const node = { start: offset, valueStart: offset + header, end: offset + header + length }
    if (node.end > limit) {
        throw invalid(`length out of bounds at ${offset}`)
    }
    return node
}

function children(der: Uint8Array, node: Tlv | undefined): Tlv[] {
    if (!node) {
        throw invalid('missing node')
    }
    const result: Tlv[] = []
    for (let offset = node.valueStart; offset < node.end; ) {
        const child = readTlv(der, offset, node.end)
        result.push(child)
        offset = child.end
    }
    return result
}

const hasTag = (der: Uint8Array, node: Tlv | undefined, tag: number): node is Tlv => !!node && der[node.start] === tag

const equals = (der: Uint8Array, node: Tlv, expected: number[]) =>
    node.end - node.start === expected.length && expected.every((byte, i) => der[node.start + i] === byte)

function header(tag: number, length: number): Uint8Array {
    if (length < 0x80) {
        return new Uint8Array([tag, length])
    }
    const bytes: number[] = []
    for (let rest = length; rest > 0; rest = Math.floor(rest / 256)) {
        bytes.unshift(rest & 0xff)
    }
    return new Uint8Array([tag, 0x80 | bytes.length, ...bytes])
}

const lengthOf = (parts: Array<Uint8Array | Blob>) => parts.reduce((sum, part) => sum + (part instanceof Blob ? part.size : part.length), 0)

/**
 * Turns a detached CAdES signature into an attached one: puts the content into `encapContentInfo.eContent`.
 *
 * The plugin cannot make an attached signature of data larger than one message to it, so the signature is made
 * by the hash and the content is put in here. The signature stays valid: the signer signs the signed attributes
 * with `messageDigest` of the content, not the whole structure (RFC 5652, 5.4), and `version` does not depend on `eContent`.
 * The content is not read into memory to assemble the signature: the assembled DER refers to the Blob,
 * and its base64 is written part by part.
 * The assembled signature itself is not verified by the plugin (it does not take data this large in one message):
 * the detached signature is verified before, and the assembled structure is read back here — the lengths,
 * the place of the content and its first and last bytes — so a mistake of the assembly is an error, not a damaged file.
 *
 * @param detachedSignature - base64 of a detached signature in DER, as `SignHash` returns it
 * @param content - the signed data
 * @param isInterrupted - checked while the result is turned into base64
 * @returns base64 of the attached signature
 * @throws CadesPluginError when the signature is not a detached SignedData of `id-data` in DER;
 * `RESULT_DAMAGED` when the assembled signature is not read back as expected;
 * Error "Interrupted" when `isInterrupted` returns `true`
 */
export async function attachContent(detachedSignature: string, content: Blob, isInterrupted?: () => boolean): Promise<Base64Text> {
    const der = base64ToBytes(detachedSignature)

    const contentInfo = readTlv(der, 0)
    const [contentType, explicit] = children(der, contentInfo)
    if (!contentType || !hasTag(der, explicit, 0xa0) || !equals(der, contentType, ID_SIGNED_DATA)) {
        throw invalid('not a SignedData')
    }
    const signedData = children(der, explicit)[0]
    if (!hasTag(der, signedData, 0x30)) {
        throw invalid('no SignedData')
    }
    const encapContentInfo = children(der, signedData)[2]
    if (!hasTag(der, encapContentInfo, 0x30)) {
        throw invalid('no encapContentInfo')
    }
    const [eContentType, eContent] = children(der, encapContentInfo)
    if (!eContentType || !equals(der, eContentType, ID_DATA)) {
        throw invalid('the content type is not id-data')
    }
    if (eContent) {
        throw invalid('the signature already has content')
    }

    const octetString = [header(0x04, content.size), content]
    const eContentPart = [header(0xa0, lengthOf(octetString)), ...octetString]
    const encapBody = [der.subarray(eContentType.start, eContentType.end), ...eContentPart]
    const signedDataBody = [
        der.subarray(signedData.valueStart, encapContentInfo.start),
        header(0x30, lengthOf(encapBody)),
        ...encapBody,
        der.subarray(encapContentInfo.end, signedData.end)
    ]
    const explicitBody = [header(0x30, lengthOf(signedDataBody)), ...signedDataBody]
    const contentInfoBody = [der.subarray(contentType.start, contentType.end), header(0xa0, lengthOf(explicitBody)), ...explicitBody]

    const attached = new Blob([header(0x30, lengthOf(contentInfoBody)), ...contentInfoBody])
    await checkAttached(attached, content, der.subarray(encapContentInfo.end, signedData.end))
    return toBase64Text(attached, isInterrupted)
}

const SAMPLE = 64

const sameBytes = async (blob: Blob, expected: Uint8Array) => {
    const actual = new Uint8Array(await blob.arrayBuffer())
    return actual.length === expected.length && actual.every((byte, i) => byte === expected[i])
}

/**
 * Reads the assembled signature back with the reader of the input, independently of how it was written:
 * every length matches the size, `eContent` holds exactly the content, the rest of SignedData is the one of the detached signature
 */
async function checkAttached(attached: Blob, content: Blob, rest: Uint8Array) {
    try {
        const size = attached.size
        // everything before the content: the headers and the beginning of SignedData
        const head = new Uint8Array(await attached.slice(0, size - content.size - rest.length).arrayBuffer())
        const contentInfo = readTlv(head, 0, size)
        const contentType = readTlv(head, contentInfo.valueStart, size)
        const explicit = readTlv(head, contentType.end, size)
        const signedData = readTlv(head, explicit.valueStart, size)
        const version = readTlv(head, signedData.valueStart, size)
        const digestAlgorithms = readTlv(head, version.end, size)
        const encapContentInfo = readTlv(head, digestAlgorithms.end, size)
        const eContentType = readTlv(head, encapContentInfo.valueStart, size)
        const eContent = readTlv(head, eContentType.end, size)
        const octetString = readTlv(head, eContent.valueStart, size)

        if (
            contentInfo.end !== size ||
            explicit.end !== size ||
            signedData.end !== size ||
            head[octetString.start] !== 0x04 ||
            octetString.valueStart !== head.length ||
            octetString.end - octetString.valueStart !== content.size ||
            octetString.end !== eContent.end ||
            eContent.end !== encapContentInfo.end ||
            size - encapContentInfo.end !== rest.length
        ) {
            throw new Error('the lengths do not match')
        }
        const start = octetString.valueStart
        const sample = Math.min(SAMPLE, content.size)
        const checks = await Promise.all([
            sameBytes(attached.slice(start, start + sample), new Uint8Array(await content.slice(0, sample).arrayBuffer())),
            sameBytes(
                attached.slice(octetString.end - sample, octetString.end),
                new Uint8Array(await content.slice(content.size - sample).arrayBuffer())
            ),
            sameBytes(attached.slice(encapContentInfo.end), rest)
        ])
        if (checks.includes(false)) {
            throw new Error('the bytes do not match')
        }
    } catch (err) {
        throw resultDamaged(`the assembled attached signature: ${err instanceof Error ? err.message : String(err)}`)
    }
}
