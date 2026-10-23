import moment from 'moment'
import { Lookup } from '@utils/Lookup'
import {
    CADES_ERROR_I18N_KEYS,
    CADES_ERROR_I18N_KEYS_NO_DATE,
    CadesErrorCode,
    CadesPluginError,
    CERTIFICATE_PROBLEMS,
    CertificateData,
    getCertificateProblem,
    getCertificateProblemDate,
    CADES_ERROR_CODES
} from '@features/cryptoPro'
import { FileTooLargeError, MiB } from '@features/file'
import { DateFormat } from '@interfaces/date'

/** A message for the user as i18n key and parameters: `t(message.key, message.params)` */
export interface CryptoProErrorMessage {
    key: string
    params: Record<string, string>
}

/**
 * i18n key and parameters of a CryptoPro error for `t(key, params)`.
 * Date problems take the date from `cert`; without it — a text without a date.
 * `FILE_TOO_LARGE` takes the limit in MB (as Windows Explorer counts: 1 MB = 1024 × 1024 bytes) from `cause`.
 */
export function cryptoProErrorMessage(code: CadesErrorCode, cert?: CertificateData, cause?: unknown): CryptoProErrorMessage {
    if (code === CADES_ERROR_CODES.FILE_TOO_LARGE && cause instanceof FileTooLargeError) {
        return { key: CADES_ERROR_I18N_KEYS[code], params: { maxSize: String(Math.round(cause.maxSize / MiB)) } }
    }
    const date = cert && Lookup.has(CERTIFICATE_PROBLEMS, code) ? getCertificateProblemDate(cert, code) : undefined
    const noDateKey = CADES_ERROR_I18N_KEYS_NO_DATE[code]
    if (!date && noDateKey) {
        return { key: noDateKey, params: {} }
    }
    return { key: CADES_ERROR_I18N_KEYS[code], params: date ? { date: moment(date).format(DateFormat.outputDateFormat) } : {} }
}

/** The certificates of the operation that failed */
export interface CryptoProOperation {
    signCert?: CertificateData
    encCert?: CertificateData
}

/** The selected certificate whose own problem is the error: the date of `CERT_EXPIRED` / `CERT_NOT_YET_VALID` comes from it */
function certificateWithProblem(code: CadesErrorCode, { signCert, encCert }: CryptoProOperation) {
    if (signCert && getCertificateProblem(signCert, { purpose: 'sign' }) === code) {
        return signCert
    }
    return encCert && getCertificateProblem(encCert, { purpose: 'encrypt' }) === code ? encCert : undefined
}

/**
 * Notification of a CryptoPro error: `info` for a cancel by the user, `error` otherwise.
 * The message is for the user; the description keeps the plugin text with HRESULT for support.
 */
export function cryptoProNotification(err: CadesPluginError, operation: CryptoProOperation) {
    const { code } = err
    return {
        type: code === CADES_ERROR_CODES.USER_CANCELLED ? 'info' : 'error',
        ...cryptoProErrorMessage(code, certificateWithProblem(code, operation), err.cause),
        description: err.pluginMessage
    } as const
}
