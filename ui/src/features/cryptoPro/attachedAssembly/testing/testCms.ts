import { randomBytes, webcrypto } from 'node:crypto'
import * as asn1js from 'asn1js'
import * as pkijs from 'pkijs'
import { ID_CONTENT_TYPE, ID_DATA, ID_MESSAGE_DIGEST, ID_SIGNED_DATA } from '../oids'

// Test data only: a CMS of the same shape as SignHash returns — with a random signature value and without certificates,
// or a real one (realDetachedCms)

const GOST_2012_256_DIGEST = '1.2.643.7.1.1.2.2'
const GOST_2012_256_KEY = '1.2.643.7.1.1.1.1'

/** Signed attributes as SignHash makes them: contentType id-data and messageDigest */
export const signedAttributes = (hash: Uint8Array, contentType = ID_DATA) => [
    new pkijs.Attribute({ type: ID_CONTENT_TYPE, values: [new asn1js.ObjectIdentifier({ value: contentType })] }),
    new pkijs.Attribute({ type: ID_MESSAGE_DIGEST, values: [new asn1js.OctetString({ valueHex: hash })] })
]

function signerInfo(attributes: pkijs.Attribute[], serial: number) {
    return new pkijs.SignerInfo({
        version: 1,
        sid: new pkijs.IssuerAndSerialNumber({
            issuer: new pkijs.RelativeDistinguishedNames({
                typesAndValues: [new pkijs.AttributeTypeAndValue({ type: '2.5.4.3', value: new asn1js.Utf8String({ value: 'Test CA' }) })]
            }),
            serialNumber: new asn1js.Integer({ value: serial })
        }),
        digestAlgorithm: new pkijs.AlgorithmIdentifier({ algorithmId: GOST_2012_256_DIGEST }),
        signedAttrs: new pkijs.SignedAndUnsignedAttributes({ type: 0, attributes }),
        signatureAlgorithm: new pkijs.AlgorithmIdentifier({ algorithmId: GOST_2012_256_KEY }),
        signature: new asn1js.OctetString({ valueHex: randomBytes(64) })
    })
}

export interface TestCmsOptions {
    /** messageDigest of every signer; random by default */
    hash?: Uint8Array
    /** @defaultValue 1 */
    signers?: number
    /** eContent: makes the CMS attached */
    content?: Uint8Array
    /** @defaultValue SignedData */
    contentType?: string
    /** Signed attributes of every signer. @defaultValue {@link signedAttributes} of `hash` */
    attributes?: pkijs.Attribute[]
}

/** DER of a CMS SignedData; without `content` — a detached signature as `SignHash` returns */
export function testCms({
    hash = randomBytes(32),
    signers = 1,
    content,
    contentType = ID_SIGNED_DATA,
    attributes = signedAttributes(hash)
}: TestCmsOptions = {}): Uint8Array {
    const signedData = new pkijs.SignedData({
        version: 1,
        digestAlgorithms: [new pkijs.AlgorithmIdentifier({ algorithmId: GOST_2012_256_DIGEST })],
        encapContentInfo: new pkijs.EncapsulatedContentInfo({
            eContentType: ID_DATA,
            ...(content && { eContent: new asn1js.OctetString({ valueHex: content }) })
        }),
        signerInfos: Array.from({ length: signers }, (_, i) => signerInfo(attributes, i + 1))
    })
    const contentInfo = new pkijs.ContentInfo({ contentType, content: signedData.toSchema(true) })
    return new Uint8Array(contentInfo.toSchema().toBER(false))
}

const subtle = webcrypto.subtle as SubtleCrypto
pkijs.setEngine('test', new pkijs.CryptoEngine({ name: 'test', crypto: webcrypto as Crypto }))

const commonName = (value: string) => new pkijs.AttributeTypeAndValue({ type: '2.5.4.3', value: new asn1js.Utf8String({ value }) })

/**
 * A real detached signature of `content` (ECDSA P-256, SHA-256, self-signed certificate inside), shaped as `SignHash` returns:
 * signed attributes with messageDigest, no eContent. For checks by an independent implementation (pkijs + WebCrypto),
 * not for GOST: the assembly does not depend on the algorithm.
 */
export async function realDetachedCms(content: Uint8Array): Promise<{ der: Uint8Array; hash: string }> {
    const keys = (await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])) as CryptoKeyPair
    const cert = new pkijs.Certificate()
    cert.version = 2
    cert.serialNumber = new asn1js.Integer({ value: 1 })
    cert.issuer.typesAndValues.push(commonName('Test'))
    cert.subject.typesAndValues.push(commonName('Test'))
    cert.notBefore.value = new Date(Date.now() - 86400000)
    cert.notAfter.value = new Date(Date.now() + 86400000)
    await cert.subjectPublicKeyInfo.importKey(keys.publicKey)
    await cert.sign(keys.privateKey, 'SHA-256')

    const hash = new Uint8Array(await subtle.digest('SHA-256', content))
    const signedData = new pkijs.SignedData({
        version: 1,
        encapContentInfo: new pkijs.EncapsulatedContentInfo({ eContentType: ID_DATA }),
        signerInfos: [
            new pkijs.SignerInfo({
                version: 1,
                sid: new pkijs.IssuerAndSerialNumber({ issuer: cert.issuer, serialNumber: cert.serialNumber }),
                signedAttrs: new pkijs.SignedAndUnsignedAttributes({
                    type: 0,
                    attributes: [
                        new pkijs.Attribute({ type: ID_CONTENT_TYPE, values: [new asn1js.ObjectIdentifier({ value: ID_DATA })] }),
                        new pkijs.Attribute({ type: ID_MESSAGE_DIGEST, values: [new asn1js.OctetString({ valueHex: hash })] })
                    ]
                })
            })
        ],
        certificates: [cert]
    })
    await signedData.sign(keys.privateKey, 0, 'SHA-256')
    const contentInfo = new pkijs.ContentInfo({ contentType: ID_SIGNED_DATA, content: signedData.toSchema(true) })
    return { der: new Uint8Array(contentInfo.toSchema().toBER(false)), hash: toHex(hash) }
}

/** Verifies an attached signature as a recipient would: the signature value and messageDigest against eContent */
export async function verifyAttached(der: Uint8Array): Promise<boolean> {
    return parseSignedData(der)
        .verify({ signer: 0, checkChain: false })
        .catch(() => false)
}

/** Parses DER of a CMS SignedData; fails on trailing bytes */
export function parseSignedData(der: Uint8Array) {
    const asn1 = asn1js.fromBER(der.slice().buffer)
    if (asn1.offset === -1 || asn1.offset !== der.length) {
        throw new Error(`Not a single DER value: ${asn1.result.error}`)
    }
    const contentInfo = new pkijs.ContentInfo({ schema: asn1.result })
    return new pkijs.SignedData({ schema: contentInfo.content })
}

export const toHex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex').toUpperCase()
