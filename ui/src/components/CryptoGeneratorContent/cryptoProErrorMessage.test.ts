import { describe, expect, it } from 'vitest'
import { CadesPluginError, CertificateData } from '@features/cryptoPro'
import { FileTooLargeError } from '@features/file'
import { cryptoProErrorMessage, cryptoProNotification } from './cryptoProErrorMessage'

describe('cryptoProErrorMessage', () => {
    it('FILE_TOO_LARGE: the file size and the limit in decimal MB from the cause, the size rounded up, the limit also in MiB rounded down', () => {
        expect(cryptoProErrorMessage('FILE_TOO_LARGE', undefined, new FileTooLargeError(30_000_001, 30_000_000))).toEqual({
            key: 'The file is too large for an attached signature',
            hintKey: 'Use a detached signature: the file is larger than the limit',
            params: { size: 30.1, maxSize: 30, maxSizeMiB: 28.6 }
        })
        expect(cryptoProErrorMessage('FILE_TOO_LARGE', undefined, new FileTooLargeError(31_457_280, 30_000_000)).params).toEqual({
            size: 31.5,
            maxSize: 30,
            maxSizeMiB: 28.6
        })
    })

    it('the title says what happened, the advice goes to a separate hint; codes without advice have no hint', () => {
        expect(cryptoProErrorMessage('CERT_UNTRUSTED')).toEqual({
            key: 'Certificate chain validation failed',
            hintKey: 'The certificates of the CA that issued your certificate may not be installed on the computer',
            params: {}
        })
        expect(cryptoProErrorMessage('SIGN_FAILED')).toEqual({ key: 'Failed to create the signature', params: {} })
    })
})

describe('cryptoProNotification', () => {
    const cert = (to: string, fields: Partial<CertificateData> = {}) =>
        ({
            from: new Date('2020-01-01'),
            to: new Date(to),
            hasPrivateKey: true,
            isValid: true,
            canSign: true,
            ...fields
        } as CertificateData)
    const valid = cert('2999-01-01')
    const expiredOn = (date: string) => cert(date)

    it('a cancel by the user is info, other errors are errors; the plugin text and the hint come separately', () => {
        const pluginMessage = 'The operation was cancelled by the user. (0x8010006E)'
        expect(cryptoProNotification(new CadesPluginError('USER_CANCELLED', undefined, { pluginMessage }), {})).toMatchObject({
            type: 'info',
            pluginMessage
        })
        expect(cryptoProNotification(new CadesPluginError('SIGN_FAILED'), {})).toMatchObject({
            type: 'error',
            pluginMessage: undefined
        })
        expect(cryptoProNotification(new CadesPluginError('CERT_UNTRUSTED', undefined, { pluginMessage }), {})).toMatchObject({
            key: 'Certificate chain validation failed',
            hintKey: 'The certificates of the CA that issued your certificate may not be installed on the computer',
            pluginMessage
        })
    })

    it('an error and a stop by the user stay until closed (duration 0); a cancel in the PIN dialog goes away by itself', () => {
        expect(cryptoProNotification(new CadesPluginError('OPERATION_ABORTED'), {})).toMatchObject({
            type: 'info',
            key: 'The operation was stopped',
            duration: 0
        })
        expect(cryptoProNotification(new CadesPluginError('SIGN_FAILED'), {})).toMatchObject({ duration: 0 })
        expect(cryptoProNotification(new CadesPluginError('USER_CANCELLED'), {}).duration).toBeUndefined()
    })

    it('takes the date from the certificate that has the problem: the signer or the recipient', () => {
        const err = new CadesPluginError('CERT_EXPIRED')
        const bySigner = cryptoProNotification(err, { signCert: expiredOn('2021-03-04'), encCert: valid })
        const byRecipient = cryptoProNotification(err, { signCert: valid, encCert: expiredOn('2022-05-06') })
        expect(bySigner.params.date).toBe(cryptoProErrorMessage('CERT_EXPIRED', expiredOn('2021-03-04')).params.date)
        expect(byRecipient.params.date).toBe(cryptoProErrorMessage('CERT_EXPIRED', expiredOn('2022-05-06')).params.date)
        expect(bySigner.params.date).not.toBe(byRecipient.params.date)
    })

    it('without a certificate that has the problem — the text without a date', () => {
        const notification = cryptoProNotification(new CadesPluginError('CERT_EXPIRED'), { signCert: valid })
        expect(notification).toMatchObject(cryptoProErrorMessage('CERT_EXPIRED'))
    })
})
