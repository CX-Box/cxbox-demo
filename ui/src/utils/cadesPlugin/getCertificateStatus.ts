import { CertificateData } from '@interfaces/sign'
import { validateCertificate } from '@utils/cadesPlugin/validateCertificate'
import { t } from 'i18next'

export function getCertificateStatus(cert: CertificateData): string {
    try {
        validateCertificate(cert)
        return t('Valid')
    } catch (err) {
        return err instanceof Error ? err.message : String(err)
    }
}
