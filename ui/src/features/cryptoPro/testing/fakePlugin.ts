import { CertificateData } from '../types'

// Test double of the async CryptoPro plugin: records every call in order, so tests check the call protocol
// (what is set before what, what is awaited, which data goes in), not cryptography

/** Line breaks every 76 characters, as the plugin returns base64 */
export const withLineBreaks = (base64: string) => base64.replace(/.{76}/g, '$&\r\n')

/** A CMS-looking DER (SEQUENCE) as the plugin returns a signature */
export const SIGNATURE_BASE64 = withLineBreaks(Buffer.from([0x30, 0x81, 0x80, ...new Uint8Array(128).fill(7)]).toString('base64'))

export interface FakePluginOptions {
    /** Result of SignHash / SignCades @defaultValue {@link SIGNATURE_BASE64} */
    signature?: string
    /** StreamEncrypt result for a chunk @defaultValue base64 of the chunk bytes with line breaks */
    streamEncrypt?: (chunk: string, isLast: boolean) => string
    /** Rejects the call with this name, e.g. `SignHash`, as the plugin does: with a plain object, not an `Error` */
    failOn?: { call: string; message: string }
    /** Delay of each Hash call, ms — to see that every Hash is awaited */
    hashDelay?: number
    /** Certificates of the store, see {@link storeCertificate} */
    certificates?: object[]
}

/** What a store certificate returns; `fail` names a property or method that rejects, as the plugin does */
export interface StoreCertificateFields {
    name?: string
    to?: Date
    isValid?: boolean
    hasPrivateKey?: boolean
    fail?: 'ValidToDate' | 'IsValid' | 'PrivateKey'
}

const rejected = (what: string) => Promise.reject({ message: `${what} failed. (0x80090016)`, requestid: 1, type: 'error' })

/** A certificate of the fake store with the async API of the plugin */
export function storeCertificate({
    name = 'Test',
    to = new Date(Date.now() + 86400000),
    isValid = true,
    hasPrivateKey = true,
    fail
}: StoreCertificateFields = {}) {
    const value = <T>(what: StoreCertificateFields['fail'], result: T) => (fail === what ? rejected(what!) : Promise.resolve(result))
    return {
        // Dates come as ISO strings, as from plugin 2.0.15820 (typed VarDate)
        get ValidToDate() {
            return value('ValidToDate', to.toISOString())
        },
        ValidFromDate: Promise.resolve(new Date(Date.now() - 86400000).toISOString()),
        IsValid: () => value('IsValid', { Result: Promise.resolve(isValid) }),
        HasPrivateKey: () => Promise.resolve(hasPrivateKey),
        get PrivateKey() {
            return value('PrivateKey', {
                ProviderName: Promise.resolve('Crypto-Pro GOST R 34.10-2012 CSP'),
                UniqueContainerName: Promise.resolve('c')
            })
        },
        PublicKey: () =>
            Promise.resolve({
                Algorithm: Promise.resolve({
                    Value: Promise.resolve('1.2.643.7.1.1.1.1'),
                    FriendlyName: Promise.resolve('ГОСТ Р 34.10-2012 256 бит')
                }),
                EncodedKey: Promise.resolve({ Value: () => Promise.resolve('AQID') })
            }),
        GetInfo: (type: number) => Promise.resolve([name, 'Test CA', 'a@b.c', 'ca@b.c'][type]),
        Thumbprint: Promise.resolve(`T-${name}`)
    }
}

export function createFakePlugin(options: FakePluginOptions = {}) {
    const calls: string[] = []
    const hashedChunks: string[] = []
    // objects created by the plugin are recorded by their id (HashedData#1), other objects as obj
    const ids = new WeakMap<object, string>()
    const created: Record<string, number> = {}
    const argument = (arg: unknown) => (typeof arg === 'object' && arg !== null ? ids.get(arg) ?? 'obj' : String(arg))
    const record = (call: string, ...args: unknown[]) => {
        calls.push(args.length ? `${call}(${args.map(argument).join(', ')})` : call)
        if (options.failOn?.call === call) {
            // eslint-disable-next-line no-throw-literal -- the real plugin rejects with exactly such an object
            throw { message: options.failOn.message, requestid: 1, type: 'error' }
        }
    }
    const method =
        (name: string, result?: (...args: any[]) => unknown) =>
        async (...args: unknown[]) => {
            record(name, ...args)
            return result?.(...args)
        }

    const objects: Record<string, () => object> = {
        'CAdESCOM.Store': () => ({
            Open: method('Store.Open'),
            Close: method('Store.Close'),
            get Certificates() {
                const certificates = options.certificates ?? []
                return Promise.resolve({ Count: Promise.resolve(certificates.length), Item: async (i: number) => certificates[i - 1] })
            }
        }),
        'CAdESCOM.HashedData': () => ({
            propset_DataEncoding: method('HashedData.DataEncoding'),
            propset_Algorithm: method('HashedData.Algorithm'),
            Hash: async (chunk: string) => {
                calls.push(`Hash start ${chunk.length}`)
                // a real timer only when asked: setTimeout(0) costs ~15 ms on Windows and makes many-chunk tests slow
                await (options.hashDelay ? new Promise(resolve => setTimeout(resolve, options.hashDelay)) : Promise.resolve())
                record('Hash')
                hashedChunks.push(chunk)
                calls.push(`Hash end ${chunk.length}`)
            },
            get Value() {
                record('HashedData.Value')
                return Promise.resolve('AB12CD')
            }
        }),
        'CAdESCOM.CadesSignedData': () => ({
            propset_ContentEncoding: method('SignedData.ContentEncoding'),
            propset_Content: method('SignedData.Content', () => undefined),
            SignHash: method('SignHash', () => options.signature ?? SIGNATURE_BASE64),
            VerifyHash: method('VerifyHash'),
            SignCades: method('SignCades', () => options.signature ?? SIGNATURE_BASE64),
            VerifyCades: method('VerifyCades')
        }),
        'CAdESCOM.CPSigner': () => ({
            get AuthenticatedAttributes2() {
                return Promise.resolve({ Add: method('Attributes.Add') })
            },
            propset_Certificate: method('Signer.Certificate'),
            propset_Options: method('Signer.Options'),
            propset_TSAAddress: method('Signer.TSAAddress')
        }),
        'CAdESCOM.CPAttribute': () => ({
            propset_Name: method('Attribute.Name'),
            propset_Value: method('Attribute.Value')
        }),
        'CAdESCOM.CPEnvelopedData': () => ({
            propset_ContentEncoding: method('Enveloped.ContentEncoding'),
            propset_Content: method('Enveloped.Content'),
            get Recipients() {
                return Promise.resolve({ Add: method('Recipients.Add') })
            },
            StreamEncrypt: method(
                'StreamEncrypt',
                options.streamEncrypt ?? ((chunk: string) => withLineBreaks(Buffer.from(chunk, 'base64').reverse().toString('base64')))
            ),
            Encrypt: method('Encrypt', () => withLineBreaks(Buffer.from([0x30, 0x80, 0, 0]).toString('base64')))
        })
    }

    const cadesplugin = {
        CADESCOM_BASE64_TO_BINARY: 1,
        CADESCOM_ENCODE_BASE64: 0,
        CADESCOM_CADES_BES: 1,
        CADESCOM_CADES_T: 5,
        CADESCOM_CADES_X_LONG_TYPE_1: 0x5d,
        CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME: 0,
        CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_NAME: 1,
        CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN: 1,
        CADESCOM_CONTAINER_STORE: 100,
        CAPICOM_MY_STORE: 'My',
        CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED: 2,
        CreateObjectAsync: async (name: string) => {
            record('Create', name)
            const object = objects[name]()
            const shortName = name.replace('CAdESCOM.', '')
            created[shortName] = (created[shortName] ?? 0) + 1
            ids.set(object, `${shortName}#${created[shortName]}`)
            return object
        }
    }

    return { cadesplugin: cadesplugin as unknown as CADESPluginAsync, calls, hashedChunks }
}

/** A valid GOST 2012-256 certificate with a private key */
export const testCertificate = (fields: Partial<CertificateData> = {}) =>
    ({
        name: 'Test',
        from: new Date(Date.now() - 86400000),
        to: new Date(Date.now() + 86400000),
        hasPrivateKey: true,
        isValid: true,
        canSign: true,
        keyAlgorithmOid: '1.2.643.7.1.1.1.1',
        thumbprint: 'AA',
        itself: {},
        ...fields
    } as CertificateData)
