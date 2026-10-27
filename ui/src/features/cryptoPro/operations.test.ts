import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { signAttached } from './attached'
import { CRYPTOPRO_CONFIG } from './config'
import { encrypt } from './encrypt'
import { encryptAndSign, sign, signAndEncrypt } from './operations'
import { signDetached } from './signDetached'
import { CertificateData, SignedCms } from './types'

vi.mock('./attached', async importOriginal => ({ ...(await importOriginal<typeof import('./attached')>()), signAttached: vi.fn() }))
vi.mock('./signDetached', () => ({ signDetached: vi.fn() }))
vi.mock('./encrypt', () => ({ encrypt: vi.fn() }))

const file = new Blob(['file'])
const signer = { name: 'signer' } as CertificateData
const recipient = { name: 'recipient' } as CertificateData
const detached: SignedCms = { signature: new Blob(['detached.sig']), der: new Blob(['detached.der']) }
const attached: SignedCms = { signature: new Blob(['attached.sig']), der: new Blob(['attached.der']), method: 'native' }
const encrypted = new Blob(['file.enc'])

beforeEach(() => {
    vi.mocked(signDetached).mockReset().mockResolvedValue(detached)
    vi.mocked(signAttached).mockReset().mockResolvedValue(attached)
    vi.mocked(encrypt).mockReset().mockResolvedValue({ encrypted })
})

describe('sign', () => {
    it('signs detached by default, without the package in the sign options', async () => {
        expect(await sign(file, signer, { cadesType: 'CADES_T' })).toEqual({ signature: detached.signature, method: undefined })
        expect(signDetached).toHaveBeenCalledWith(file, signer, { cadesType: 'CADES_T' })
    })

    it('signs attached for the attached package', async () => {
        expect(await sign(file, signer, { signaturePackage: 'attached' })).toEqual({ signature: attached.signature, method: 'native' })
        expect(signAttached).toHaveBeenCalledWith(file, signer, {})
    })

    it('does not expose the internal DER of the signature', async () => {
        expect(await sign(file, signer)).not.toHaveProperty('der')
    })
})

describe('signAndEncrypt', () => {
    it('detached: signs the file and encrypts the file', async () => {
        expect(await signAndEncrypt(file, signer, recipient)).toEqual({ signature: detached.signature, method: undefined, encrypted })
        expect(encrypt).toHaveBeenCalledWith(file, recipient, { signal: undefined })
    })

    it('attached: encrypts the signature itself (its DER), which contains the file', async () => {
        expect(await signAndEncrypt(file, signer, recipient, { signaturePackage: 'attached' })).toEqual({
            signature: attached.signature,
            method: 'native',
            encrypted
        })
        expect(encrypt).toHaveBeenCalledWith(attached.der, recipient, { signal: undefined })
    })
})

describe('encryptAndSign', () => {
    it.each(['detached', 'attached'] as const)('%s: encrypts the file and signs the .enc as uploaded', async signaturePackage => {
        const result = await encryptAndSign(file, signer, recipient, { signaturePackage })

        expect(encrypt).toHaveBeenCalledWith(file, recipient, { signal: undefined })
        const signFile = signaturePackage === 'attached' ? signAttached : signDetached
        expect(signFile).toHaveBeenCalledWith(encrypted, signer, {})
        const { signature, method } = signaturePackage === 'attached' ? attached : detached
        expect(result).toEqual({ signature, method, encrypted })
    })

    it('does not sign when encryption fails', async () => {
        vi.mocked(encrypt).mockRejectedValue(new Error('encrypt failed'))
        await expect(encryptAndSign(file, signer, recipient)).rejects.toThrow('encrypt failed')
        expect(signDetached).not.toHaveBeenCalled()
    })
})

describe('attached size limit: the file the user chose, before any work', () => {
    const config = { ...CRYPTOPRO_CONFIG }
    const ofSize = (size: number) => new Blob([new Uint8Array(size)])
    const operations = {
        sign: (f: Blob) => sign(f, signer, { signaturePackage: 'attached' }),
        signAndEncrypt: (f: Blob) => signAndEncrypt(f, signer, recipient, { signaturePackage: 'attached' }),
        encryptAndSign: (f: Blob) => encryptAndSign(f, signer, recipient, { signaturePackage: 'attached' })
    }

    beforeEach(() => {
        Object.assign(CRYPTOPRO_CONFIG, { nativeAttachedMaxSize: 100, attachedAssembly: false })
    })

    afterEach(() => {
        Object.assign(CRYPTOPRO_CONFIG, config)
    })

    it.each(Object.entries(operations))('%s: a file over the limit — FILE_TOO_LARGE, nothing is signed or encrypted', async (_, run) => {
        await expect(run(ofSize(101))).rejects.toEqual(expect.objectContaining({ code: 'FILE_TOO_LARGE' }))
        expect(signAttached).not.toHaveBeenCalled()
        expect(encrypt).not.toHaveBeenCalled()
    })

    it.each(Object.entries(operations))('%s: a file up to the limit is processed', async (_, run) => {
        await run(ofSize(100))
        expect(signAttached).toHaveBeenCalled()
    })

    it('encryptAndSign signs the .enc whatever its size: the limit is for the source file', async () => {
        vi.mocked(encrypt).mockResolvedValue({ encrypted: ofSize(134) })
        await operations.encryptAndSign(ofSize(100))
        expect(signAttached).toHaveBeenCalledWith(expect.objectContaining({ size: 134 }), signer, {})
    })

    it('no limit for detached and with the assembly', async () => {
        await sign(ofSize(1000), signer, { signaturePackage: 'detached' })
        Object.assign(CRYPTOPRO_CONFIG, { attachedAssembly: true })
        await sign(ofSize(1000), signer, { signaturePackage: 'attached' })
        expect(signDetached).toHaveBeenCalled()
        expect(signAttached).toHaveBeenCalled()
    })
})

describe('attached size limit by default: 30 000 000 bytes for every attached operation', () => {
    const ofSize = (size: number) => new Blob([new Uint8Array(size)])
    const operations = {
        sign: (f: Blob) => sign(f, signer, { signaturePackage: 'attached' }),
        signAndEncrypt: (f: Blob) => signAndEncrypt(f, signer, recipient, { signaturePackage: 'attached' }),
        encryptAndSign: (f: Blob) => encryptAndSign(f, signer, recipient, { signaturePackage: 'attached' })
    }
    const config = { ...CRYPTOPRO_CONFIG }

    beforeEach(() => {
        Object.assign(CRYPTOPRO_CONFIG, { attachedAssembly: false })
    })

    afterEach(() => {
        Object.assign(CRYPTOPRO_CONFIG, config)
    })

    it.each(Object.entries(operations))(
        '%s: 30 000 001 bytes — FILE_TOO_LARGE before the plugin, 30 000 000 — processed',
        async (_, run) => {
            await expect(run(ofSize(30_000_001))).rejects.toEqual(expect.objectContaining({ code: 'FILE_TOO_LARGE' }))
            expect(signAttached).not.toHaveBeenCalled()
            expect(encrypt).not.toHaveBeenCalled()
            await run(ofSize(30_000_000))
            expect(signAttached).toHaveBeenCalled()
        }
    )
})

describe('abort: the operation stops waiting, the plugin is not called after it', () => {
    const deferred = <T>() => {
        let resolve!: (value: T) => void
        const promise = new Promise<T>(res => {
            resolve = res
        })
        return { promise, resolve }
    }

    it('encryptAndSign aborted during encryption: OPERATION_ABORTED, the .enc is not signed', async () => {
        const controller = new AbortController()
        const encryption = deferred<{ encrypted: Blob }>()
        vi.mocked(encrypt).mockReturnValue(encryption.promise)
        const running = encryptAndSign(file, signer, recipient, { signaturePackage: 'attached', signal: controller.signal })
        controller.abort()
        await expect(running).rejects.toEqual(expect.objectContaining({ code: 'OPERATION_ABORTED' }))
        encryption.resolve({ encrypted })
        await new Promise(resolve => setTimeout(resolve, 0))
        expect(signAttached).not.toHaveBeenCalled()
    })

    it('signAndEncrypt aborted during signing: OPERATION_ABORTED, nothing is encrypted', async () => {
        const controller = new AbortController()
        const signing = deferred<SignedCms>()
        vi.mocked(signAttached).mockReturnValue(signing.promise)
        const running = signAndEncrypt(file, signer, recipient, { signaturePackage: 'attached', signal: controller.signal })
        controller.abort()
        await expect(running).rejects.toEqual(expect.objectContaining({ code: 'OPERATION_ABORTED' }))
        signing.resolve(attached)
        await new Promise(resolve => setTimeout(resolve, 0))
        expect(encrypt).not.toHaveBeenCalled()
    })

    it('sign aborted while the plugin signs: OPERATION_ABORTED; the signal is not passed to the plugin calls', async () => {
        const controller = new AbortController()
        const signing = deferred<SignedCms>()
        vi.mocked(signAttached).mockReturnValue(signing.promise)
        const running = sign(file, signer, { signaturePackage: 'attached', signal: controller.signal })
        expect(signAttached).toHaveBeenCalledWith(file, signer, {})
        controller.abort()
        await expect(running).rejects.toEqual(expect.objectContaining({ code: 'OPERATION_ABORTED' }))
    })

    it('without an abort the result is as without a signal', async () => {
        const { signal } = new AbortController()
        expect(await sign(file, signer, { signaturePackage: 'attached', signal })).toEqual({
            signature: attached.signature,
            method: 'native'
        })
    })
})

describe('abort before the start: nothing reaches the plugin', () => {
    it.each([
        ['sign', (signal: AbortSignal) => sign(file, signer, { signaturePackage: 'attached', signal })],
        ['signAndEncrypt', (signal: AbortSignal) => signAndEncrypt(file, signer, recipient, { signaturePackage: 'attached', signal })],
        ['encryptAndSign', (signal: AbortSignal) => encryptAndSign(file, signer, recipient, { signaturePackage: 'attached', signal })]
    ])('%s with an aborted signal: OPERATION_ABORTED, no signing or encryption', async (_, run) => {
        const controller = new AbortController()
        controller.abort()
        await expect(run(controller.signal)).rejects.toEqual(expect.objectContaining({ code: 'OPERATION_ABORTED' }))
        expect(signAttached).not.toHaveBeenCalled()
        expect(encrypt).not.toHaveBeenCalled()
    })

    it('the signal goes to encryption, which stops between its chunks', async () => {
        const { signal } = new AbortController()
        await signAndEncrypt(file, signer, recipient, { signaturePackage: 'attached', signal })
        await encryptAndSign(file, signer, recipient, { signaturePackage: 'attached', signal })
        expect(vi.mocked(encrypt).mock.calls.map(call => call[2])).toEqual([{ signal }, { signal }])
    })
})
