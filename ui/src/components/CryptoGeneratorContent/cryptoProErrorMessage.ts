import moment from 'moment'
import { Lookup } from '@utils/Lookup'
import {
    CADES_ERROR_I18N_KEYS,
    CADES_ERROR_I18N_HINT_KEYS,
    CADES_ERROR_I18N_KEYS_NO_DATE,
    CadesErrorCode,
    CadesPluginError,
    CERTIFICATE_PROBLEMS,
    CertificateData,
    getCertificateProblem,
    getCertificateProblemDate,
    CADES_ERROR_CODES
} from '@features/cryptoPro'
import { FileTooLargeError, MB, MiB } from '@features/file'
import { DateFormat } from '@interfaces/date'

/**
 * A message for the user as i18n keys and parameters: the title `t(message.key, message.params)`
 * and, if the code has advice, `t(message.hintKey, message.params)`
 */
export interface CryptoProErrorMessage {
    key: string
    hintKey?: string
    params: Record<string, string | number>
}

/**
 * i18n keys and parameters of a CryptoPro error: a short title and the advice ({@link CADES_ERROR_I18N_HINT_KEYS}).
 * Date problems take the date from `cert`; without it — a text without a date.
 * `FILE_TOO_LARGE` takes the file size and the limit from `cause` in {@link MB} (1 000 000 bytes), the units of
 * `nativeAttachedMaxSize`. File managers differ (Windows Explorer counts 1 048 576 bytes per MB, Finder 1 000 000),
 * so the message shows both numbers and the limit also in MiB; the size is rounded up and the limit in MiB down,
 * so that the file never looks within the limit.
 */
export function cryptoProErrorMessage(code: CadesErrorCode, cert?: CertificateData, cause?: unknown): CryptoProErrorMessage {
    const hintKey = CADES_ERROR_I18N_HINT_KEYS[code]
    return { ...errorTitle(code, cert, cause), ...(hintKey && { hintKey }) }
}

function errorTitle(code: CadesErrorCode, cert?: CertificateData, cause?: unknown): CryptoProErrorMessage {
    if (code === CADES_ERROR_CODES.FILE_TOO_LARGE && cause instanceof FileTooLargeError) {
        return {
            key: CADES_ERROR_I18N_KEYS[code],
            params: {
                size: Math.ceil((cause.size * 10) / MB) / 10,
                maxSize: cause.maxSize / MB,
                maxSizeMiB: Math.floor((cause.maxSize * 10) / MiB) / 10
            }
        }
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
 * Notification of a CryptoPro error: `info` for a cancel or a stop by the user, `error` otherwise.
 * The title and the hint are for the user; `pluginMessage` keeps the plugin text with HRESULT for support.
 * An error and a stop stay until closed (`duration: 0`): after a stop the user may need its advice to restart the extension.
 */
export function cryptoProNotification(err: CadesPluginError, operation: CryptoProOperation) {
    const { code } = err
    const cancelled = code === CADES_ERROR_CODES.USER_CANCELLED
    return {
        type: cancelled || code === CADES_ERROR_CODES.OPERATION_ABORTED ? 'info' : 'error',
        duration: cancelled ? undefined : 0,
        ...cryptoProErrorMessage(code, certificateWithProblem(code, operation), err.cause),
        pluginMessage: err.pluginMessage
    } as const
}
