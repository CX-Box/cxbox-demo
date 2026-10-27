import { describe, expect, it, vi } from 'vitest'
import { CadesPluginError, CertificateData } from '@features/cryptoPro'
import { validateEncryptionCertificate } from './cryptoFile'

vi.mock('api', () => ({ CxBoxApiInstance: {} }))

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
