import { CertificateData } from '@interfaces/sign'
import moment from 'moment'
import { t } from 'i18next'
import { DateFormat } from '@interfaces/date'

export function validateCertificate(cert: CertificateData) {
    const now = moment()
    const validFrom = moment(cert.from)
    const validTo = moment(cert.to)

    if (now.isBefore(validFrom)) {
        throw new Error(t('Certificate not yet valid', { date: validFrom.format(DateFormat.outputDateFormat) }))
    }
    if (now.isAfter(validTo)) {
        throw new Error(t('Certificate expired', { date: validTo.format(DateFormat.outputDateFormat) }))
    }

    if (!cert.hasPrivateKey) {
        throw new Error(t('No private key for certificate'))
    }

    if (!cert.isValid) {
        throw new Error(t('Certificate chain validation failed'))
    }
}
