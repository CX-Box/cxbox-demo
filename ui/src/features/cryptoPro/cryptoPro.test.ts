import { describe, expect, it } from 'vitest'
import { FileTooLargeError } from '@features/file'
import { getCertificateProblem, getCertificateProblemDate } from './certificates'
import { CadesPluginError, isCadesPluginError, extractHResult, wrapPluginError } from './errors'
import { canSignWithKey, resolveHashAlgorithm } from './hashAlgorithm'
import { compareVersions, isPluginVersionAtLeast } from './plugin'
import { CertificateData } from './types'

describe('resolveHashAlgorithm', () => {
    it('GOST 2012-256 → 101, 2012-512 → 102', () => {
        expect(resolveHashAlgorithm('1.2.643.7.1.1.1.1')).toBe(101)
        expect(resolveHashAlgorithm('1.2.643.7.1.1.1.2')).toBe(102)
    })

    it.each([
        ['GOST 2001', '1.2.643.2.2.19'],
        ['RSA', '1.2.840.113549.1.1.1'],
        ['ECDSA', '1.2.840.10045.2.1'],
        ['empty', '']
    ])('%s → UNSUPPORTED_KEY', (_, oid) => {
        expect(() => resolveHashAlgorithm(oid)).toThrow(expect.objectContaining({ code: 'UNSUPPORTED_KEY' }))
        expect(canSignWithKey(oid)).toBe(false)
    })
})

describe('extractHResult', () => {
    it('takes the code from the plugin text in upper case', () => {
        expect(extractHResult('Параметр задан неверно. (0x80070057)')).toBe('0x80070057')
        expect(extractHResult('Действие было отменено пользователем. (0x8010006e)')).toBe('0x8010006E')
    })

    it('returns undefined for a text without a code', () => {
        expect(extractHResult("Can't find object by id")).toBeUndefined()
    })
})

describe('wrapPluginError', () => {
    it('reads the HRESULT from a plain object, as the async plugin rejects', () => {
        const error = wrapPluginError({ message: 'Плохой ключ. (0x80090003)', requestid: 7, type: 'error' }, 'ENCRYPT_FAILED')
        expect(error.message).toBe('Плохой ключ. (0x80090003)')
        expect(error.pluginCode).toBe('0x80090003')
        expect(wrapPluginError({ message: 'Действие было отменено пользователем. (0x8010006E)' }).code).toBe('USER_CANCELLED')
    })

    it.each([
        ['Указан неправильный тип поставщика. (0x80090014)', 'UNSUPPORTED_KEY'],
        ['Истек/не наступил срок действия. (0x800B0101)', 'CERT_EXPIRED'],
        ['Цепочка сертификатов… (0x800B0109)', 'CERT_UNTRUSTED'],
        ['Действие было отменено пользователем. (0x8010006E)', 'USER_CANCELLED']
    ])('%s → %s, HRESULT in pluginCode, the text in pluginMessage', (message, code) => {
        const error = wrapPluginError(new Error(message), 'ENCRYPT_FAILED')
        expect(isCadesPluginError(error)).toBe(true)
        expect(error.code).toBe(code)
        expect(error.pluginCode).toBe(extractHResult(message))
        expect(error.pluginMessage).toBe(message)
    })

    it.each([
        ['Параметр задан неверно. (0x80070057)', 'ENCRYPT_FAILED'],
        ['Функция отзыва… (0x800B010E)', 'SIGN_FAILED'],
        ['Недопустимые данные. (0x8007000D)', 'VERIFY_FAILED']
    ] as const)('generic or step-dependent %s gets the code of the failed step %s', (message, step) => {
        const error = wrapPluginError(new Error(message), step)
        expect(error.code).toBe(step)
        expect(error.pluginMessage).toBe(message)
    })

    it('keeps a plugin text without a code for the user; UNKNOWN by default', () => {
        const error = wrapPluginError({ message: "Can't find object by id" })
        expect(error.code).toBe('UNKNOWN')
        expect(error.pluginCode).toBeUndefined()
        expect(error.pluginMessage).toBe("Can't find object by id")
    })

    it('does not wrap CadesPluginError twice', () => {
        const own = new CadesPluginError('INVALID_CMS', 'x')
        expect(wrapPluginError(own)).toBe(own)
    })

    it('turns FileTooLargeError into FILE_TOO_LARGE with the cause', () => {
        const error = wrapPluginError(new FileTooLargeError(11, 10))
        expect(error.code).toBe('FILE_TOO_LARGE')
        expect(error.cause).toBeInstanceOf(FileTooLargeError)
        expect(error.pluginMessage).toBeUndefined()
    })
})

const NOW = new Date('2026-10-20T12:00:00Z')

const cert = (fields: Partial<CertificateData> = {}) =>
    ({
        name: 'Test',
        from: new Date('2026-01-01'),
        to: new Date('2027-01-01'),
        hasPrivateKey: true,
        isValid: true,
        canSign: true,
        ...fields
    } as CertificateData)

describe('getCertificateProblem', () => {
    it('returns undefined for a valid certificate', () => {
        expect(getCertificateProblem(cert(), { now: NOW })).toBeUndefined()
    })

    it('checks dates first, then the key, then the private key, then the chain', () => {
        expect(getCertificateProblem(cert({ from: new Date('2026-11-01') }), { now: NOW })).toBe('CERT_NOT_YET_VALID')
        expect(getCertificateProblem(cert({ to: new Date('2026-06-20'), canSign: false }), { now: NOW })).toBe('CERT_EXPIRED')
        expect(getCertificateProblem(cert({ canSign: false, hasPrivateKey: false }), { now: NOW })).toBe('UNSUPPORTED_KEY')
        expect(getCertificateProblem(cert({ hasPrivateKey: false }), { now: NOW })).toBe('CERT_NO_PRIVATE_KEY')
        expect(getCertificateProblem(cert({ isValid: false }), { now: NOW })).toBe('CERT_UNTRUSTED')
    })

    it('does not require a private key from an encryption recipient', () => {
        expect(getCertificateProblem(cert({ hasPrivateKey: false }), { now: NOW, purpose: 'encrypt' })).toBeUndefined()
    })

    it('leaves the key algorithm of an encryption recipient to the plugin, but not of a signer', () => {
        const rsa = cert({ canSign: false })
        expect(getCertificateProblem(rsa, { now: NOW, purpose: 'encrypt' })).toBeUndefined()
        expect(getCertificateProblem(rsa, { now: NOW, purpose: 'sign' })).toBe('UNSUPPORTED_KEY')
    })

    it('counts the end date as valid: expired only after it', () => {
        expect(getCertificateProblem(cert({ to: NOW }), { now: NOW })).toBeUndefined()
        expect(getCertificateProblem(cert({ to: new Date(NOW.getTime() - 1) }), { now: NOW })).toBe('CERT_EXPIRED')
    })

    it('checks dates of an encryption recipient', () => {
        expect(getCertificateProblem(cert({ to: new Date('2026-06-20') }), { now: NOW, purpose: 'encrypt' })).toBe('CERT_EXPIRED')
    })
})

describe('getCertificateProblemDate', () => {
    it('gives the start for NOT_YET_VALID, the end for EXPIRED, otherwise undefined', () => {
        const c = cert()
        expect(getCertificateProblemDate(c, 'CERT_NOT_YET_VALID')).toEqual(c.from)
        expect(getCertificateProblemDate(c, 'CERT_EXPIRED')).toEqual(c.to)
        expect(getCertificateProblemDate(c, 'UNSUPPORTED_KEY')).toBeUndefined()
    })
})

describe('isPluginVersionAtLeast', () => {
    it('compares numbers', () => {
        expect(isPluginVersionAtLeast('2.0.15820', '2.0.15260')).toBe(true)
        expect(isPluginVersionAtLeast('2.0.15260', '2.0.15260')).toBe(true)
        expect(isPluginVersionAtLeast('2.0.14000', '2.0.15260')).toBe(false)
    })

    it.each(['abc', '', '2.0.15820 beta'])('treats a non-numeric version "%s" as outdated', version => {
        expect(isPluginVersionAtLeast(version, '2.0.15260')).toBe(false)
    })
})

describe('compareVersions', () => {
    it('compares by numbers, not by strings', () => {
        expect(compareVersions('2.0.15820', '2.0.15260')).toBeGreaterThan(0)
        expect(compareVersions('2.0.9999', '2.0.15260')).toBeLessThan(0)
        expect(compareVersions('2.0.15260', '2.0.15260')).toBe(0)
        expect(compareVersions('2.1', '2.0.99999')).toBeGreaterThan(0)
    })
})
