import { randomBytes } from 'node:crypto'
import * as asn1js from 'asn1js'
import { describe, expect, it } from 'vitest'
import { attachContent, encodeLength } from './attachContent'
import { ID_DATA } from './oids'
import { parseSignedData, testCms } from './testing/testCms'

const detached = testCms()

const bytesOf = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer())

const invalidCms = (message?: RegExp) =>
    expect.objectContaining({ code: 'INVALID_CMS', ...(message && { message: expect.stringMatching(message) }) })

/**
 * Strict DER walk ContentInfo → [0] → SignedData → encapContentInfo → [0] → OCTET STRING: each length fits its parent exactly.
 * asn1js does not check this (a wrong outer length still parses) and by default limits the content length to 16 MiB (`maxContentLength`).
 */
function eContentRange(bytes: Uint8Array) {
    function tlv(offset: number) {
        const first = bytes[offset + 1]
        let start = offset + 2
        let length = first
        if (first & 0x80) {
            expect(first, 'indefinite length').not.toBe(0x80)
            length = 0
            for (let i = 0; i < (first & 0x7f); i++) {
                length = length * 256 + bytes[start + i]
            }
            start += first & 0x7f
        }
        return { tag: bytes[offset], start, end: start + length }
    }
    const contentInfo = tlv(0)
    expect(contentInfo.end, 'ContentInfo length = file length').toBe(bytes.length)
    const explicit = tlv(tlv(contentInfo.start).end)
    expect(explicit.end).toBe(contentInfo.end)
    const signedData = tlv(explicit.start)
    expect(signedData.end).toBe(explicit.end)
    const encap = tlv(tlv(tlv(signedData.start).end).end)
    const eContent = tlv(tlv(encap.start).end)
    expect(eContent.tag).toBe(0xa0)
    expect(eContent.end).toBe(encap.end)
    const octets = tlv(eContent.start)
    expect(octets.tag).toBe(0x04)
    expect(octets.end).toBe(eContent.end)
    return octets
}

describe('encodeLength', () => {
    it.each([
        [0, [0x00]],
        [127, [0x7f]],
        [128, [0x81, 0x80]],
        [255, [0x81, 0xff]],
        [256, [0x82, 0x01, 0x00]],
        [65535, [0x82, 0xff, 0xff]],
        [65536, [0x83, 0x01, 0x00, 0x00]],
        [2 ** 24, [0x84, 0x01, 0x00, 0x00, 0x00]],
        [2 ** 31, [0x84, 0x80, 0x00, 0x00, 0x00]],
        [2 ** 32, [0x85, 0x01, 0x00, 0x00, 0x00, 0x00]],
        [2 ** 32 + 5, [0x85, 0x01, 0x00, 0x00, 0x00, 0x05]]
    ])('%i → %j', (length, expected) => {
        expect(encodeLength(length)).toEqual(expected)
    })

    it.each([-1, 1.5, NaN, 2 ** 53])('rejects %s with RangeError', length => {
        expect(() => encodeLength(length)).toThrow(RangeError)
    })
})

describe('attachContent', () => {
    it('inserts the content as eContent and keeps the signer as it was', async () => {
        const content = randomBytes(1000)
        const before = parseSignedData(detached)
        const after = parseSignedData(await bytesOf(attachContent(detached, new Blob([content]))))
        expect(before.encapContentInfo.eContent).toBeUndefined()
        expect(Buffer.from(after.encapContentInfo.eContent!.getValue())).toEqual(content)
        expect(after.encapContentInfo.eContentType).toBe(ID_DATA)
        expect(Buffer.from(after.signerInfos[0].toSchema().toBER())).toEqual(Buffer.from(before.signerInfos[0].toSchema().toBER()))
    })

    it.each([0, 1, 127, 128, 255, 256, 65535, 65536, 70000])('content of %i B: pkijs reads it as a primitive OCTET STRING', async size => {
        const content = randomBytes(size)
        const eContent = parseSignedData(await bytesOf(attachContent(detached, new Blob([content])))).encapContentInfo.eContent!
        expect(Buffer.from(eContent.getValue())).toEqual(content)
        expect(eContent.idBlock.isConstructed).toBe(false)
    })

    // Every size where the number of length octets changes for eContent / encapContentInfo / SignedData / ContentInfo
    it.each([
        [0, 300],
        [65536 - 300, 65536 + 20]
    ])('content from %i to %i B: every length fits its parent', async (from, to) => {
        const content = randomBytes(to)
        for (let size = from; size <= to; size++) {
            const { start, end } = eContentRange(await bytesOf(attachContent(detached, new Blob([content.subarray(0, size)]))))
            expect(end - start, `content of ${size} B`).toBe(size)
        }
    })

    it.each([16777200, 16777216, 20000000])('content of %i B: lengths agree, content and tail are in place', async size => {
        const content = randomBytes(size)
        const attached = await bytesOf(attachContent(detached, new Blob([content])))
        const { start, end } = eContentRange(attached)
        expect(end - start).toBe(size)
        expect(Buffer.from(attached.subarray(start, end)).equals(content)).toBe(true)
        // certificates and signerInfos are copied as they are
        expect(Buffer.from(attached.subarray(end)).equals(Buffer.from(detached.subarray(detached.length - (attached.length - end))))).toBe(
            true
        )
    })

    it('rejects an attached signature', async () => {
        const attached = await bytesOf(attachContent(detached, new Blob([randomBytes(10)])))
        expect(() => attachContent(attached, new Blob([]))).toThrow(invalidCms(/already contains content/))
    })

    it('rejects a content type other than id-data', () => {
        const other = testCms()
        // id-data …07 01 → id-signedData …07 02 in eContentType: its first occurrence, the next one is the contentType attribute
        const oid = Buffer.from([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x01])
        other[Buffer.from(other).indexOf(oid) + oid.length - 1] = 0x02
        expect(() => attachContent(other, new Blob([]))).toThrow(invalidCms(/not id-data/))
    })

    it('turns an indefinite length (BER) of ContentInfo into DER', async () => {
        const value = detached.subarray(2 + (detached[1] & 0x80 ? detached[1] & 0x7f : 0))
        const ber = new Uint8Array([0x30, 0x80, ...value, 0x00, 0x00])
        const content = randomBytes(300)
        const { start, end } = eContentRange(await bytesOf(attachContent(ber, new Blob([content]))))
        expect(end - start).toBe(content.length)
    })

    it('rejects an indefinite length without its end', () => {
        const ber = new Uint8Array(detached)
        ber[1] = 0x80
        expect(() => attachContent(ber, new Blob([]))).toThrow(invalidCms())
    })

    it('rejects a ContentInfo other than SignedData', () => {
        expect(() => attachContent(testCms({ contentType: ID_DATA }), new Blob([]))).toThrow(
            invalidCms(/not a ContentInfo with SignedData/)
        )
    })

    it('rejects extra values in ContentInfo and in its [0]', () => {
        const [contentType, explicit] = (asn1js.fromBER(detached.slice().buffer).result as asn1js.Sequence).valueBlock.value
        const signedData = (explicit as asn1js.Constructed).valueBlock.value[0]
        const encode = (block: asn1js.BaseBlock) => new Uint8Array(block.toBER(false))
        const extraInContentInfo = encode(new asn1js.Sequence({ value: [contentType, explicit, new asn1js.Null()] }))
        const extraInExplicit = encode(
            new asn1js.Sequence({
                value: [
                    contentType,
                    new asn1js.Constructed({ idBlock: { tagClass: 3, tagNumber: 0 }, value: [signedData, new asn1js.Null()] })
                ]
            })
        )

        expect(() => attachContent(extraInContentInfo, new Blob([]))).toThrow(invalidCms(/not a ContentInfo with SignedData/))
        expect(() => attachContent(extraInExplicit, new Blob([]))).toThrow(invalidCms(/content \[0\] has 2 values/))
    })

    it('rejects a truncated signature', () => {
        expect(() => attachContent(detached.subarray(0, detached.length - 1), new Blob([]))).toThrow(invalidCms())
    })

    it('rejects data after ContentInfo', () => {
        const longer = new Uint8Array(detached.length + 1)
        longer.set(detached)
        expect(() => attachContent(longer, new Blob([]))).toThrow(invalidCms(/after ContentInfo/))
    })

    it('rejects not a CMS', () => {
        expect(() => attachContent(new Uint8Array([0x04, 0x00]), new Blob([]))).toThrow(invalidCms())
        expect(() => attachContent(new Uint8Array(0), new Blob([]))).toThrow(invalidCms(/missing/))
    })
})
