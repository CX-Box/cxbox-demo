import { describe, expect, it } from 'vitest'
import { CadesPluginError, CertificateData } from '@features/cryptoPro'
import { FileTooLargeError, MiB } from '@features/file'
import { cryptoProErrorMessage, cryptoProNotification } from './cryptoProErrorMessage'

describe('cryptoProErrorMessage', () => {
    it('FILE_TOO_LARGE: the limit in MB from the cause', () => {
        expect(cryptoProErrorMessage('FILE_TOO_LARGE', undefined, new FileTooLargeError(40 * MiB + 1, 40 * MiB))).toEqual({
            key: 'The file is too large for an attached signature',
            params: { maxSize: '40' }
        })
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

    it('a cancel by the user is info, other errors are errors; the description is the plugin text', () => {
        const pluginMessage = 'The operation was cancelled by the user. (0x8010006E)'
        expect(cryptoProNotification(new CadesPluginError('USER_CANCELLED', undefined, { pluginMessage }), {})).toMatchObject({
            type: 'info',
            description: pluginMessage
        })
        expect(cryptoProNotification(new CadesPluginError('SIGN_FAILED'), {})).toMatchObject({
            type: 'error',
            description: undefined
        })
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
