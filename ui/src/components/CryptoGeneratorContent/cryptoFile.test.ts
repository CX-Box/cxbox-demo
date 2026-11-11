import { describe, expect, it, vi } from 'vitest'
import { CadesPluginError, CertificateData } from '@features/cryptoPro'
import { getCryptoRecord, validateEncryptionCertificate } from './cryptoFile'

vi.mock('api', () => ({ CxBoxApiInstance: {} }))

// CXBOX-1348
describe('getCryptoRecord', () => {
    const saved = { id: '1', vstamp: 1, fileId: null, fileName: null, notes: 'n' }

    it('takes the document uploaded to the record that is not saved yet', () => {
        expect(getCryptoRecord(saved, { fileId: 'f1', fileName: 'meeting.pdf' })).toEqual({
            ...saved,
            fileId: 'f1',
            fileName: 'meeting.pdf'
        })
    })

    it('a pending change overrides the saved document', () => {
        expect(getCryptoRecord({ ...saved, fileId: 'old' }, { fileId: 'new' })?.fileId).toBe('new')
    })

    it('without pending changes is the saved record', () => {
        expect(getCryptoRecord(saved, undefined)).toBe(saved)
        expect(getCryptoRecord(undefined, undefined)).toBeUndefined()
    })
})

describe('validateEncryptionCertificate', () => {
    const cert = (fields: Partial<CertificateData> = {}) =>
        ({
            from: new Date('2020-01-01'),
            to: new Date('2999-01-01'),
            hasPrivateKey: true,
            isValid: true,
            canSign: true,
            ...fields
        } as CertificateData)

    const codeOf = (run: () => void) => {
        try {
            run()
        } catch (error) {
            return error instanceof CadesPluginError ? error.code : error
        }
        return undefined
    }

    it('refuses an expired certificate and one with a broken chain, as signing does', () => {
        expect(
            codeOf(() => validateEncryptionCertificate({ generatorType: 'encrypt', encCert: cert({ to: new Date('2021-01-01') }) }))
        ).toBe('CERT_EXPIRED')
        expect(codeOf(() => validateEncryptionCertificate({ generatorType: 'signAndEncrypt', encCert: cert({ isValid: false }) }))).toBe(
            'CERT_UNTRUSTED'
        )
    })

    it('a recipient certificate without a private key encrypts', () => {
        expect(
            codeOf(() => validateEncryptionCertificate({ generatorType: 'encryptAndSign', encCert: cert({ hasPrivateKey: false }) }))
        ).toBe(undefined)
    })

    it('signing without encryption is not checked here: the plugin decides', () => {
        expect(codeOf(() => validateEncryptionCertificate({ generatorType: 'sign', encCert: cert({ isValid: false }) }))).toBe(undefined)
    })
})
