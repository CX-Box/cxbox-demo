import { createHash, randomBytes } from 'node:crypto'
import * as asn1js from 'asn1js'
import * as pkijs from 'pkijs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDetachedSignature } from '../signDetached'
import { CertificateData } from '../types'
import { checkDetachedCms, signAttachedAssembled, VERIFIABLE_SIZE } from './assembled'
import { ID_DATA, ID_MESSAGE_DIGEST, ID_SIGNED_DATA } from './oids'
import { parseSignedData, realDetachedCms, signedAttributes, testCms, toHex, verifyAttached } from './testing/testCms'

vi.mock('../signDetached', () => ({ createDetachedSignature: vi.fn() }))

const hashBytes = randomBytes(32)
const hash = toHex(hashBytes)

const invalidCms = (message: RegExp) => expect.objectContaining({ code: 'INVALID_CMS', message: expect.stringMatching(message) })

describe('checkDetachedCms', () => {
    it('accepts a detached signature of this hash', async () => {
        await expect(checkDetachedCms(testCms({ hash: hashBytes }), hash)).resolves.toBeUndefined()
    })

    it('compares the hash ignoring case', async () => {
        await expect(checkDetachedCms(testCms({ hash: hashBytes }), hash.toLowerCase())).resolves.toBeUndefined()
    })

    it('rejects a signature of another hash', async () => {
        await expect(checkDetachedCms(testCms(), hash)).rejects.toEqual(invalidCms(/messageDigest/))
    })

    it('rejects an attached signature', async () => {
        await expect(checkDetachedCms(testCms({ hash: hashBytes, content: randomBytes(10) }), hash)).rejects.toEqual(
            invalidCms(/not a detached signature/)
        )
    })

    it('rejects several signers', async () => {
        await expect(checkDetachedCms(testCms({ hash: hashBytes, signers: 2 }), hash)).rejects.toEqual(invalidCms(/2 signers/))
    })

    it('rejects a ContentInfo other than SignedData', async () => {
        await expect(checkDetachedCms(testCms({ hash: hashBytes, contentType: ID_DATA }), hash)).rejects.toEqual(invalidCms(/content type/))
    })

    it('rejects not a DER', async () => {
        await expect(checkDetachedCms(new Uint8Array([0x30, 0x05, 0x01]), hash)).rejects.toEqual(
            // the parse error itself, not one of the structure checks below it
            invalidCms(/cannot be attached: (?!content type|not a detached|\d+ signers|messageDigest|contentType|data after)/)
        )
    })

    it('rejects data after the signature', async () => {
        await expect(checkDetachedCms(new Uint8Array([...testCms({ hash: hashBytes }), 0]), hash)).rejects.toEqual(
            invalidCms(/data after ContentInfo/)
        )
    })

    it.each([
        ['two messageDigest attributes', () => [...signedAttributes(hashBytes), signedAttributes(hashBytes)[1]]],
        [
            'a messageDigest with two values',
            () => [
                signedAttributes(hashBytes)[0],
                new pkijs.Attribute({
                    type: ID_MESSAGE_DIGEST,
                    values: [new asn1js.OctetString({ valueHex: hashBytes }), new asn1js.OctetString({ valueHex: hashBytes })]
                })
            ]
        ],
        ['no messageDigest', () => [signedAttributes(hashBytes)[0]]]
    ])('rejects %s (RFC 5652 §5.3: exactly one)', async (_, attributes) => {
        await expect(checkDetachedCms(testCms({ attributes: attributes() }), hash)).rejects.toEqual(
            invalidCms(/messageDigest must be one signed attribute with one value/)
        )
    })

    it('rejects a contentType attribute other than id-data (RFC 5652 §5.6: must match eContentType)', async () => {
        await expect(checkDetachedCms(testCms({ attributes: signedAttributes(hashBytes, ID_SIGNED_DATA) }), hash)).rejects.toEqual(
            invalidCms(/contentType attribute is not id-data/)
        )
    })

    it('rejects an empty hash even with an empty messageDigest', async () => {
        await expect(checkDetachedCms(testCms({ hash: new Uint8Array(0) }), '')).rejects.toEqual(invalidCms(/messageDigest/))
    })
})

describe('signAttachedAssembled', () => {
    const cert = {} as CertificateData

    beforeEach(() => {
        vi.mocked(createDetachedSignature).mockReset()
    })

    it('inserts the file into the detached signature; the text is the base64 of the DER', async () => {
        const content = randomBytes(5000)
        const detached = testCms({ hash: createHash('sha256').update(content).digest() })
        vi.mocked(createDetachedSignature).mockResolvedValue({
            base64: Buffer.from(detached).toString('base64'),
            der: detached,
            hash: createHash('sha256').update(content).digest('hex')
        })

        const result = await signAttachedAssembled(new Blob([content]), cert, { cadesType: 'CADES_BES' })

        expect(createDetachedSignature).toHaveBeenCalledWith(expect.any(Blob), cert, { cadesType: 'CADES_BES' })
        expect(result.method).toBe('assembled')
        const der = new Uint8Array(await result.der.arrayBuffer())
        expect(Buffer.from(parseSignedData(der).encapContentInfo.eContent!.getValue())).toEqual(content)
        expect(await result.signature.text()).toBe(Buffer.from(der).toString('base64'))
    })

    it('does not assemble a signature whose hash differs from the file hash', async () => {
        const detached = testCms()
        vi.mocked(createDetachedSignature).mockResolvedValue({ base64: '', der: detached, hash })

        await expect(signAttachedAssembled(new Blob([randomBytes(10)]), cert)).rejects.toEqual(invalidCms(/messageDigest/))
    })

    it.each([
        [VERIFIABLE_SIZE, false],
        [VERIFIABLE_SIZE + 1, true]
    ])('file of %i B: warns that CryptoPro tools may not verify it — %s; signs anyway', async (size, warns) => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        vi.mocked(createDetachedSignature).mockRejectedValue(new Error('stop after the size check'))

        await expect(signAttachedAssembled({ size } as Blob, cert)).rejects.toThrow('stop after the size check')

        expect(createDetachedSignature).toHaveBeenCalled()
        expect(warn).toHaveBeenCalledTimes(warns ? 1 : 0)
        warn.mockRestore()
    })
})

describe('assembled signature of a small file with a real key', () => {
    const cert = {} as CertificateData

    async function assemble(content: Uint8Array) {
        const detached = await realDetachedCms(content)
        vi.mocked(createDetachedSignature).mockResolvedValue({ base64: '', der: detached.der, hash: detached.hash })
        const result = await signAttachedAssembled(new Blob([content]), cert)
        return new Uint8Array(await result.der.arrayBuffer())
    }

    it('is verified as an attached signature by an independent implementation (pkijs + WebCrypto)', async () => {
        const content = randomBytes(5000)
        const der = await assemble(content)

        expect(Buffer.from(parseSignedData(der).encapContentInfo.eContent!.getValue())).toEqual(content)
        expect(await verifyAttached(der)).toBe(true)
    })

    it('fails verification when a byte of the file inside is changed', async () => {
        const content = randomBytes(5000)
        const der = await assemble(content)
        const index = Buffer.from(der).indexOf(content)
        expect(index).toBeGreaterThan(-1)
        der[index + 100] ^= 1

        expect(await verifyAttached(der)).toBe(false)
    })
})
