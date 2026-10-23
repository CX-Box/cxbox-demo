import { randomBytes } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { signAttachedNative } from './attached/native'
import { CRYPTOPRO_CONFIG } from './config'
import { encrypt } from './encrypt'
import { hashBlob } from './hashBlob'
import { encryptAndSign, sign } from './operations'
import { getCadesPlugin, getPluginVersion } from './plugin'
import { signDetached } from './signDetached'
import { getCertificates } from './certificates'
import { createFakePlugin, FakePluginOptions, SIGNATURE_BASE64, storeCertificate, testCertificate } from './testing/fakePlugin'

vi.mock('./plugin', async importOriginal => ({
    ...(await importOriginal<typeof import('./plugin')>()),
    getCadesPlugin: vi.fn(),
    getPluginVersion: vi.fn()
}))

const CHUNK = 6
const config = { ...CRYPTOPRO_CONFIG }
let plugin: ReturnType<typeof createFakePlugin>

function usePlugin(options?: FakePluginOptions) {
    plugin = createFakePlugin(options)
    vi.mocked(getCadesPlugin).mockResolvedValue({ cadesplugin: plugin.cadesplugin, version: '2.0.15820' })
    return plugin
}

/** Calls without the Create(…) noise, starting from the first one with this prefix */
const callsOf = (prefix: string) => plugin.calls.filter(call => call.startsWith(prefix))

beforeEach(() => {
    Object.assign(CRYPTOPRO_CONFIG, { chunkSize: CHUNK, nativeAttachedMaxSize: 100 })
    vi.mocked(getPluginVersion).mockReset().mockResolvedValue('2.0.15820')
    usePlugin()
})

afterEach(() => {
    Object.assign(CRYPTOPRO_CONFIG, config)
})

describe('hashBlob', () => {
    it('sets DataEncoding, then Algorithm, then hashes the chunks in order', async () => {
        const bytes = randomBytes(CHUNK * 2 + 1)
        await hashBlob(new Blob([bytes]), 102)

        const order = plugin.calls.filter(call => /^HashedData\.|^Hash$/.test(call))
        expect(order).toEqual(['HashedData.DataEncoding(1)', 'HashedData.Algorithm(102)', 'Hash', 'Hash', 'Hash'])
        expect(plugin.hashedChunks.join('')).toBe(bytes.toString('base64'))
    })

    it('awaits every Hash before the next chunk and before returning', async () => {
        usePlugin({ hashDelay: 5 })
        await hashBlob(new Blob([randomBytes(CHUNK * 3)]), 101)

        const hashEvents = plugin.calls.filter(call => call.startsWith('Hash '))
        expect(hashEvents.map(call => call.split(' ')[1])).toEqual(['start', 'end', 'start', 'end', 'start', 'end'])
    })

    it('fails when a chunk is not hashed instead of signing incomplete data', async () => {
        usePlugin({ failOn: { call: 'Hash', message: 'Hash failed' } })
        await expect(hashBlob(new Blob([randomBytes(CHUNK * 2)]), 101)).rejects.toEqual(expect.objectContaining({ message: 'Hash failed' }))
    })

    it('stops waiting for a chunk the plugin does not answer: PLUGIN_NOT_RESPONDING', async () => {
        Object.assign(CRYPTOPRO_CONFIG, { chunkTimeout: 20 })
        usePlugin({ hashDelay: 1000 })
        await expect(hashBlob(new Blob([randomBytes(CHUNK)]), 101)).rejects.toEqual(
            expect.objectContaining({ code: 'PLUGIN_NOT_RESPONDING', message: expect.stringContaining('Hash') })
        )
    })
})

describe('signDetached', () => {
    it('signs and verifies the same hash with the explicit signature type; .sig is the plugin text as is', async () => {
        const result = await signDetached(new Blob([randomBytes(10)]), testCertificate(), { cadesType: 'CADES_BES' })

        expect(callsOf('HashedData.Algorithm')).toEqual(['HashedData.Algorithm(101)'])
        // the same HashedData is signed and verified: a second one would be HashedData#2
        expect(callsOf('SignHash')).toEqual(['SignHash(HashedData#1, CPSigner#1, 1)'])
        expect(callsOf('VerifyHash')).toEqual([`VerifyHash(HashedData#1, ${SIGNATURE_BASE64}, 1)`])
        expect(plugin.calls.indexOf('SignHash(HashedData#1, CPSigner#1, 1)')).toBeGreaterThan(plugin.calls.lastIndexOf('Hash'))
        expect(await result.signature.text()).toBe(SIGNATURE_BASE64)
        expect(Buffer.from(await result.der.arrayBuffer())).toEqual(Buffer.from(SIGNATURE_BASE64.replace(/\s/g, ''), 'base64'))
    })

    it('chooses the hash of the key: GOST 2012-512 → 102', async () => {
        await signDetached(new Blob([randomBytes(10)]), testCertificate({ keyAlgorithmOid: '1.2.643.7.1.1.1.2' }))
        expect(callsOf('HashedData.Algorithm')).toEqual(['HashedData.Algorithm(102)'])
    })

    it('rejects an unsupported key before the plugin is called', async () => {
        await expect(
            signDetached(new Blob([randomBytes(10)]), testCertificate({ keyAlgorithmOid: '1.2.840.113549.1.1.1', canSign: false }))
        ).rejects.toEqual(expect.objectContaining({ code: 'UNSUPPORTED_KEY' }))
        expect(plugin.calls).toEqual([])
    })

    it('sets the TSA address only for CAdES-T', async () => {
        await signDetached(new Blob([randomBytes(10)]), testCertificate(), { cadesType: 'CADES_BES' })
        expect(callsOf('Signer.TSAAddress')).toEqual([])

        usePlugin()
        await signDetached(new Blob([randomBytes(10)]), testCertificate(), { cadesType: 'CADES_T', tsaUrl: 'http://tsa.test' })
        expect(callsOf('Signer.TSAAddress')).toEqual(['Signer.TSAAddress(http://tsa.test)'])
        expect(callsOf('SignHash')).toEqual(['SignHash(HashedData#1, CPSigner#1, 5)'])
    })

    it('signs the document name into the signature, "Document Name" without it', async () => {
        await signDetached(new Blob([randomBytes(10)]), testCertificate(), { documentName: 'contract.pdf' })
        expect(callsOf('Attribute.Value')).toEqual(['Attribute.Value(obj)', 'Attribute.Value(contract.pdf)'])

        usePlugin()
        await signDetached(new Blob([randomBytes(10)]), testCertificate())
        expect(callsOf('Attribute.Value')).toEqual(['Attribute.Value(obj)', 'Attribute.Value(Document Name)'])
    })

    it('rejects an unknown signature type from the meta before the plugin signs', async () => {
        await expect(signDetached(new Blob([randomBytes(10)]), testCertificate(), { cadesType: 'CADES_XYZ' as never })).rejects.toEqual(
            expect.objectContaining({ code: 'SIGN_FAILED', message: expect.stringMatching(/Unknown signature type/) })
        )
        expect(callsOf('SignHash')).toEqual([])
    })

    it('rejects CAdES-T without a time stamp service before the plugin is called', async () => {
        await expect(signDetached(new Blob([randomBytes(10)]), testCertificate(), { cadesType: 'CADES_T', tsaUrl: '' })).rejects.toEqual(
            expect.objectContaining({ code: 'TSA_NOT_CONFIGURED', message: expect.stringMatching(/REACT_APP_CRYPTOPRO_TSA_URL/) })
        )
        expect(plugin.calls).toEqual([])
    })

    it.each(['', 'not base64!', 'AQID'])('rejects SignHash result "%s" with SIGN_FAILED and does not verify it', async signature => {
        usePlugin({ signature })
        await expect(signDetached(new Blob([randomBytes(10)]), testCertificate())).rejects.toEqual(
            expect.objectContaining({ code: 'SIGN_FAILED' })
        )
        expect(callsOf('VerifyHash')).toEqual([])
    })

    it.each([
        ['SignHash', 'Действие было отменено пользователем. (0x8010006E)', 'USER_CANCELLED'],
        ['SignHash', 'Параметр задан неверно. (0x80070057)', 'SIGN_FAILED'],
        ['VerifyHash', 'Функция отзыва… (0x800B010E)', 'VERIFY_FAILED']
    ])('%s fails with "%s" → %s', async (call, message, code) => {
        usePlugin({ failOn: { call, message } })
        await expect(signDetached(new Blob([randomBytes(10)]), testCertificate())).rejects.toEqual(expect.objectContaining({ code }))
    })
})

describe('signAttachedNative', () => {
    it('sets ContentEncoding before Content, signs the whole file attached and verifies it', async () => {
        const bytes = randomBytes(50)
        const result = await signAttachedNative(new Blob([bytes]), testCertificate(), { cadesType: 'CADES_BES' })

        expect(callsOf('SignedData.')).toEqual(['SignedData.ContentEncoding(1)', `SignedData.Content(${bytes.toString('base64')})`])
        expect(callsOf('SignCades')).toEqual(['SignCades(CPSigner#1, 1, false)'])
        expect(callsOf('VerifyCades')).toEqual([`VerifyCades(${SIGNATURE_BASE64}, 1, false)`])
        expect(result.method).toBe('native')
    })
})

describe('attached size limit through the whole chain (SignCades, the assembly is off)', () => {
    const recipient = testCertificate({ hasPrivateKey: false })
    const options = { signaturePackage: 'attached' as const }

    it('rejects a file over the limit before the plugin', async () => {
        await expect(sign(new Blob([randomBytes(101)]), testCertificate(), options)).rejects.toEqual(
            expect.objectContaining({ code: 'FILE_TOO_LARGE' })
        )
        expect(plugin.calls).toEqual([])
    })

    it('encryptAndSign: a file up to the limit is signed even though its .enc is over it', async () => {
        const { encrypted } = await encryptAndSign(new Blob([randomBytes(100)]), testCertificate(), recipient, options)

        expect(encrypted.size).toBeGreaterThan(CRYPTOPRO_CONFIG.nativeAttachedMaxSize)
        expect(callsOf('SignCades')).toHaveLength(1)
    })
})

describe('getCertificates', () => {
    let warn: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        warn.mockRestore()
    })

    it('reads names and e-mails by GetInfo 0–3 and closes the store', async () => {
        usePlugin({ certificates: [storeCertificate({ name: 'A' }), storeCertificate({ name: 'B', hasPrivateKey: false })] })

        const certificates = await getCertificates()

        expect(certificates.map(c => [c.name, c.provider, c.email, c.providerEmail, c.hasPrivateKey])).toEqual([
            ['A', 'Test CA', 'a@b.c', 'ca@b.c', true],
            ['B', 'Test CA', 'a@b.c', 'ca@b.c', false]
        ])
        expect(certificates[0]).toMatchObject({ cryptoProvider: 'Crypto-Pro GOST R 34.10-2012 CSP', privateKeyLink: 'c', canSign: true })
        expect(callsOf('Store.')).toEqual(['Store.Open(100, My, 2)', 'Store.Close'])
    })

    it('skips a certificate that cannot be read, the others are listed', async () => {
        usePlugin({
            certificates: [
                storeCertificate({ name: 'A' }),
                storeCertificate({ name: 'B', fail: 'ValidToDate' }),
                storeCertificate({ name: 'C' })
            ]
        })

        expect((await getCertificates()).map(c => c.name)).toEqual(['A', 'C'])
        expect(warn).toHaveBeenCalledWith(expect.stringMatching(/Certificate 2 .* skipped.*0x80090016/))
        expect(callsOf('Store.Close')).toHaveLength(1)
    })

    it('a failed chain check is an untrusted chain, an unreadable key link is no private key', async () => {
        usePlugin({ certificates: [storeCertificate({ name: 'A', fail: 'IsValid' }), storeCertificate({ name: 'B', fail: 'PrivateKey' })] })

        const [a, b] = await getCertificates()

        expect(a).toMatchObject({ name: 'A', isValid: false, hasPrivateKey: true })
        expect(b).toMatchObject({ name: 'B', isValid: true, hasPrivateKey: false })
        expect(b.privateKeyLink).toBeUndefined()
        expect(warn).toHaveBeenCalledTimes(2)
    })

    it('skips expired certificates by default after reading only the end date', async () => {
        usePlugin({
            certificates: [storeCertificate({ name: 'old', to: new Date(Date.now() - 1000), fail: 'PrivateKey' }), storeCertificate()]
        })

        expect((await getCertificates()).map(c => c.name)).toEqual(['Test'])
        expect(warn).not.toHaveBeenCalled()
    })

    it('lists a certificate at its end date and checks its chain', async () => {
        const now = new Date('2026-10-20T12:00:00Z')
        vi.useFakeTimers({ toFake: ['Date'], now })
        try {
            usePlugin({ certificates: [storeCertificate({ name: 'last day', to: now, fail: 'IsValid' })] })

            const [last] = await getCertificates()

            expect(last).toMatchObject({ name: 'last day', isValid: false, to: now })
            expect(last.to).toBeInstanceOf(Date)
            expect(last.from).toBeInstanceOf(Date)
            expect(warn).toHaveBeenCalledWith(expect.stringMatching(/chain check failed/))
        } finally {
            vi.useRealTimers()
        }
    })

    it('lists expired certificates on request without checking their chain', async () => {
        usePlugin({ certificates: [storeCertificate({ name: 'old', to: new Date(Date.now() - 1000), fail: 'IsValid' })] })

        const [old] = await getCertificates({ expired: true })

        expect(old).toMatchObject({ name: 'old', isValid: false })
        expect(warn).not.toHaveBeenCalled()
    })
})

describe('encrypt', () => {
    const recipient = testCertificate({ hasPrivateKey: false })
    const textOf = async (blob: Blob) => blob.text()

    it('streams the chunks with isLast only on the last one and joins the decoded parts', async () => {
        const bytes = randomBytes(CHUNK * 2 + 2)
        const { encrypted } = await encrypt(new Blob([bytes]), recipient)

        expect(callsOf('StreamEncrypt').map(call => call.endsWith('true)'))).toEqual([false, false, true])
        // the fake returns each chunk reversed: the result is the parts joined as bytes, one line of base64
        const expected = Buffer.concat([0, 1, 2].map(i => Buffer.from(bytes.subarray(i * CHUNK, (i + 1) * CHUNK)).reverse()))
        expect(await textOf(encrypted)).toBe(expected.toString('base64'))
        expect(callsOf('Encrypt')).toEqual([])
    })

    it('joins the parts as bytes, not as base64 strings: parts of any length give one valid base64', async () => {
        // parts of 7 and 5 bytes: base64 strings with their own "=" joined as text would be invalid in the middle
        const parts = [randomBytes(7), randomBytes(5)]
        let call = 0
        usePlugin({ streamEncrypt: () => parts[call++].toString('base64') })

        const { encrypted } = await encrypt(new Blob([randomBytes(CHUNK + 1)]), recipient)

        const text = await textOf(encrypted)
        expect(text).toBe(Buffer.concat(parts).toString('base64'))
        expect(text.replace(/=+$/, '')).not.toContain('=')
    })

    it('passes a recipient with a non-GOST key to the plugin: the plugin decides', async () => {
        await encrypt(
            new Blob([randomBytes(CHUNK)]),
            testCertificate({ hasPrivateKey: false, keyAlgorithmOid: '1.2.840.113549.1.1.1', canSign: false })
        )
        expect(callsOf('Recipients.Add')).toEqual(['Recipients.Add(obj)'])
    })

    it('shows a key the plugin cannot encrypt for as UNSUPPORTED_KEY', async () => {
        usePlugin({ failOn: { call: 'StreamEncrypt', message: 'Указан неправильный тип поставщика. (0x80090014)' } })
        await expect(encrypt(new Blob([randomBytes(CHUNK)]), recipient)).rejects.toEqual(
            expect.objectContaining({ code: 'UNSUPPORTED_KEY' })
        )
    })

    it('sets ContentEncoding and the recipient before the first chunk, the algorithm is left to the plugin', async () => {
        await encrypt(new Blob([randomBytes(CHUNK)]), recipient)

        const order = plugin.calls.filter(call => /^Enveloped\.|^Recipients|^StreamEncrypt/.test(call)).map(call => call.split('(')[0])
        expect(order).toEqual(['Enveloped.ContentEncoding', 'Recipients.Add', 'StreamEncrypt'])
    })

    it('skips empty intermediate parts', async () => {
        usePlugin({ streamEncrypt: (chunk, isLast) => (isLast ? Buffer.from('end').toString('base64') : '') })
        expect(await textOf((await encrypt(new Blob([randomBytes(CHUNK * 2)]), recipient)).encrypted)).toBe(
            Buffer.from('end').toString('base64')
        )
    })

    it('rejects an empty result with ENCRYPT_FAILED', async () => {
        usePlugin({ streamEncrypt: () => '' })
        await expect(encrypt(new Blob([randomBytes(CHUNK)]), recipient)).rejects.toEqual(
            expect.objectContaining({ code: 'ENCRYPT_FAILED' })
        )
    })

    it('stops waiting for a part the plugin does not answer: PLUGIN_NOT_RESPONDING', async () => {
        Object.assign(CRYPTOPRO_CONFIG, { chunkTimeout: 20 })
        usePlugin({ streamEncrypt: () => new Promise<never>(() => {}) as unknown as string })
        await expect(encrypt(new Blob([randomBytes(CHUNK)]), recipient)).rejects.toEqual(
            expect.objectContaining({ code: 'PLUGIN_NOT_RESPONDING', message: expect.stringContaining('StreamEncrypt') })
        )
    })

    it('encrypts an empty file by Encrypt, Content is set before the recipient', async () => {
        await encrypt(new Blob([]), recipient)

        const order = plugin.calls
            .filter(call => /^Enveloped\.|^Recipients|^Encrypt|^StreamEncrypt/.test(call))
            .map(call => call.split('(')[0])
        expect(order).toEqual(['Enveloped.ContentEncoding', 'Enveloped.Content', 'Recipients.Add', 'Encrypt'])
        expect(getPluginVersion).not.toHaveBeenCalled()
    })

    it('rejects a plugin older than the minimal version before encrypting', async () => {
        vi.mocked(getPluginVersion).mockResolvedValue('2.0.14000')
        await expect(encrypt(new Blob([randomBytes(CHUNK)]), recipient)).rejects.toEqual(
            expect.objectContaining({ code: 'PLUGIN_OUTDATED' })
        )
        expect(callsOf('StreamEncrypt')).toEqual([])
    })
})
