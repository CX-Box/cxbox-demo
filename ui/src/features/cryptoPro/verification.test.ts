import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { signAttachedNative } from './attached/native'
import { CRYPTOPRO_CONFIG } from './config'
import { encryptAndSign, sign, signAndEncrypt } from './operations'
import { getCadesPlugin, getPluginVersion } from './plugin'
import { signDetached } from './signDetached'
import { createFakePlugin, FakePluginOptions, SIGNATURE_BASE64, testCertificate } from './testing/fakePlugin'

vi.mock('./plugin', async importOriginal => ({
    ...(await importOriginal<typeof import('./plugin')>()),
    getCadesPlugin: vi.fn(),
    getPluginVersion: vi.fn()
}))

const config = { ...CRYPTOPRO_CONFIG }
const file = new Blob(['Document to sign'])
const cert = testCertificate()

function usePlugin(options?: FakePluginOptions) {
    const plugin = createFakePlugin(options)
    vi.mocked(getCadesPlugin).mockResolvedValue({ cadesplugin: plugin.cadesplugin, version: '2.0.15820' })
    return plugin
}

beforeEach(() => {
    Object.assign(CRYPTOPRO_CONFIG, { signatureVerificationMode: 'strict', attachedAssembly: false })
    vi.mocked(getPluginVersion).mockResolvedValue('2.0.15820')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    usePlugin()
})

afterEach(() => {
    Object.assign(CRYPTOPRO_CONFIG, config)
    vi.restoreAllMocks()
})

describe.each([
    { name: 'detached', create: 'SignHash', verify: 'VerifyHash', run: signDetached },
    { name: 'native attached', create: 'SignCades', verify: 'VerifyCades', run: signAttachedNative }
])('$name verification', ({ create, verify, run }) => {
    describe.each(['strict', 'soft'] as const)('%s mode', mode => {
        beforeEach(() => {
            CRYPTOPRO_CONFIG.signatureVerificationMode = mode
        })

        it.each(['CADES_BES', 'CADES_T'] as const)('verifies %s with the signing type and returns the original bytes', async cadesType => {
            const plugin = usePlugin()
            const result = await run(file, cert, { cadesType, tsaUrl: 'http://tsa.test' })
            const type = cadesType === 'CADES_T' ? 5 : 1
            expect(plugin.calls.filter(call => call.startsWith(`${verify}(`))).toEqual([
                verify === 'VerifyHash'
                    ? `VerifyHash(HashedData#1, ${SIGNATURE_BASE64}, ${type})`
                    : `VerifyCades(${SIGNATURE_BASE64}, ${type}, false)`
            ])
            expect(plugin.calls.filter(call => call.startsWith(`${create}(`))).toHaveLength(1)
            expect(plugin.calls.findIndex(call => call.startsWith(`${create}(`))).toBeLessThan(
                plugin.calls.findIndex(call => call.startsWith(`${verify}(`))
            )
            expect(await result.signature.text()).toBe(SIGNATURE_BASE64)
            expect(Buffer.from(await result.der.arrayBuffer())).toEqual(Buffer.from(SIGNATURE_BASE64, 'base64'))
            expect(console.warn).not.toHaveBeenCalled()
        })

        it.each([
            ['0x80070490', 'VERIFY_FAILED'],
            ['0x800B010E', 'VERIFY_FAILED'],
            ['0x800B0101', 'CERT_EXPIRED'],
            ['0x800B0109', 'CERT_UNTRUSTED'],
            ['0x8010006E', 'USER_CANCELLED']
        ])('handles verification error %s without relying on its mapped code %s', async (pluginCode, code) => {
            const message = `Verification failed (${pluginCode})`
            const plugin = usePlugin({ failOn: { call: verify, message } })
            const pending = run(file, cert)
            if (mode === 'strict') {
                await expect(pending).rejects.toMatchObject({ code, pluginCode, pluginMessage: message })
                expect(console.warn).not.toHaveBeenCalled()
            } else {
                const result = await pending
                expect(await result.signature.text()).toBe(SIGNATURE_BASE64)
                expect(Buffer.from(await result.der.arrayBuffer())).toEqual(Buffer.from(SIGNATURE_BASE64, 'base64'))
                expect(console.warn).toHaveBeenCalledExactlyOnceWith(
                    `[CryptoPro] ${verify} verification failed in soft mode; returning the created signature`,
                    { code, pluginCode, message }
                )
            }
            expect(plugin.calls.filter(call => call.startsWith(`${verify}(`))).toHaveLength(1)
        })

        it('handles failure to create the verifier after the signature is created', async () => {
            const plugin = usePlugin({
                failOnCreate: { name: 'CAdESCOM.CadesSignedData', occurrence: 2, message: 'Cannot create verifier (0x80070490)' }
            })
            const pending = run(file, cert)
            if (mode === 'strict') {
                await expect(pending).rejects.toMatchObject({ code: 'VERIFY_FAILED', pluginCode: '0x80070490' })
            } else {
                expect(await (await pending).signature.text()).toBe(SIGNATURE_BASE64)
                expect(console.warn).toHaveBeenCalledTimes(1)
            }
            expect(plugin.calls.filter(call => call.startsWith(`${create}(`))).toHaveLength(1)
            expect(plugin.calls.some(call => call.startsWith(`${verify}(`))).toBe(false)
        })
    })

    describe('soft mode boundaries', () => {
        beforeEach(() => {
            CRYPTOPRO_CONFIG.signatureVerificationMode = 'soft'
        })

        it.each([
            ['0x80070490', 'SIGN_FAILED'],
            ['0x8010006E', 'USER_CANCELLED']
        ])('still rejects a signing failure %s as %s', async (pluginCode, code) => {
            const plugin = usePlugin({ failOn: { call: create, message: `Signing failed (${pluginCode})` } })
            await expect(run(file, cert)).rejects.toMatchObject({ code, pluginCode })
            expect(plugin.calls.some(call => call.startsWith(`${verify}(`))).toBe(false)
            expect(console.warn).not.toHaveBeenCalled()
        })

        it.each(['', 'not base64!', 'AQID'])('still rejects an invalid signing result: %s', async signature => {
            const plugin = usePlugin({ signature })
            await expect(run(file, cert)).rejects.toMatchObject({ code: 'SIGN_FAILED' })
            expect(plugin.calls.some(call => call.startsWith(`${verify}(`))).toBe(false)
            expect(console.warn).not.toHaveBeenCalled()
        })
    })
})

describe.each(['detached', 'attached'] as const)('soft verification in %s operations', signaturePackage => {
    beforeEach(() => {
        CRYPTOPRO_CONFIG.signatureVerificationMode = 'soft'
    })

    it.each(['sign', 'signAndEncrypt', 'encryptAndSign'] as const)('%s continues after a verification failure', async operation => {
        const verify = signaturePackage === 'attached' ? 'VerifyCades' : 'VerifyHash'
        const plugin = usePlugin({ failOn: { call: verify, message: 'Verification failed (0x800B010E)' } })
        const options = { signaturePackage }
        const result = await (operation === 'sign'
            ? sign(file, cert, options)
            : operation === 'signAndEncrypt'
            ? signAndEncrypt(file, cert, cert, options)
            : encryptAndSign(file, cert, cert, options))
        expect(await result.signature.text()).toBe(SIGNATURE_BASE64)
        expect(plugin.calls.filter(call => call.startsWith(`${verify}(`))).toHaveLength(1)
        expect(console.warn).toHaveBeenCalledTimes(1)
        if (operation !== 'sign') {
            expect(plugin.calls.some(call => call.startsWith('StreamEncrypt('))).toBe(true)
            expect('encrypted' in result && result.encrypted).toBeInstanceOf(Blob)
        }
    })

    it('still rejects encryption failures after a successful signature', async () => {
        usePlugin({ failOn: { call: 'StreamEncrypt', message: 'Encryption failed' } })
        await expect(signAndEncrypt(file, cert, cert, { signaturePackage })).rejects.toMatchObject({ code: 'ENCRYPT_FAILED' })
    })

    it('still stops an aborted operation before signing', async () => {
        const plugin = usePlugin()
        const controller = new AbortController()
        controller.abort()
        await expect(sign(file, cert, { signaturePackage, signal: controller.signal })).rejects.toMatchObject({ code: 'OPERATION_ABORTED' })
        expect(plugin.calls).toEqual([])
        expect(console.warn).not.toHaveBeenCalled()
    })

    it.each(['sign', 'signAndEncrypt'] as const)('%s stays cancelled after a late verification failure', async operation => {
        let startVerification!: () => void
        const verificationStarted = new Promise<void>(resolve => {
            startVerification = resolve
        })
        let failVerification!: (reason: unknown) => void
        const verification = new Promise<void>((_, reject) => {
            failVerification = reject
        })
        const plugin = usePlugin({
            verify: () => {
                startVerification()
                return verification
            }
        })
        const controller = new AbortController()
        const options = { signaturePackage, signal: controller.signal }
        const pending = operation === 'sign' ? sign(file, cert, options) : signAndEncrypt(file, cert, cert, options)
        const returned = vi.fn()
        const settled = pending.then(returned, error => error)

        await verificationStarted
        const callsAtAbort = [...plugin.calls]
        controller.abort()
        expect(await settled).toMatchObject({ code: 'OPERATION_ABORTED' })
        failVerification({ message: 'Verification failed (0x800B010E)' })
        await new Promise(resolve => setTimeout(resolve, 0))

        expect(returned).not.toHaveBeenCalled()
        expect(plugin.calls).toEqual(callsAtAbort)
        expect(plugin.calls.some(call => call.startsWith('StreamEncrypt('))).toBe(false)
        expect(console.warn).toHaveBeenCalledTimes(1)
    })
})
