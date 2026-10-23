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
        expect(encrypt).toHaveBeenCalledWith(file, recipient)
    })

    it('attached: encrypts the signature itself (its DER), which contains the file', async () => {
        expect(await signAndEncrypt(file, signer, recipient, { signaturePackage: 'attached' })).toEqual({
            signature: attached.signature,
            method: 'native',
            encrypted
        })
        expect(encrypt).toHaveBeenCalledWith(attached.der, recipient)
    })
})

describe('encryptAndSign', () => {
    it.each(['detached', 'attached'] as const)('%s: encrypts the file and signs the .enc as uploaded', async signaturePackage => {
        const result = await encryptAndSign(file, signer, recipient, { signaturePackage })

        expect(encrypt).toHaveBeenCalledWith(file, recipient)
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
