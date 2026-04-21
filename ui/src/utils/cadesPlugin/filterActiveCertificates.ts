import { CertificateData } from '@interfaces/sign'
import moment from 'moment/moment'

export function filterActiveCertificates(certificates: CertificateData[] | undefined) {
    if (!certificates) {
        return []
    }

    return certificates.filter(cert => {
        const validTo = moment(cert.to)
        const now = moment()

        return now.isBefore(validTo)
    })
}
