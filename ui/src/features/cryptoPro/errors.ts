import { FileTooLargeError } from '@features/file'
import { Lookup, LookupValueOf } from '@utils/Lookup'

/**
 * Error codes of this module (not of CryptoPro): the UI shows a message by code.
 * Plugin errors are mapped to them by {@link wrapPluginError}; the plugin's own code (HRESULT) stays in {@link CadesPluginError.pluginCode}.
 *
 * @example
 * ```ts
 * if (isCadesPluginError(error) && error.code === CADES_ERROR_CODES.USER_CANCELLED) { ... }
 * ```
 */
export const CADES_ERROR_CODES = Lookup.create([
    'PLUGIN_NOT_AVAILABLE',
    'PLUGIN_OUTDATED',
    'PLUGIN_NOT_RESPONDING',
    'CERT_EXPIRED',
    'CERT_NOT_YET_VALID',
    'CERT_NO_PRIVATE_KEY',
    'CERT_UNTRUSTED',
    'UNSUPPORTED_KEY',
    'USER_CANCELLED',
    'OPERATION_ABORTED',
    'FILE_TOO_LARGE',
    'ASSEMBLY_NOT_AVAILABLE',
    'INVALID_CMS',
    'TSA_NOT_CONFIGURED',
    'SIGN_FAILED',
    'VERIFY_FAILED',
    'ENCRYPT_FAILED',
    'UNKNOWN'
])

export type CadesErrorCode = LookupValueOf<typeof CADES_ERROR_CODES>

/**
 * The codes of {@link CADES_ERROR_CODES} that the certificate properties show ({@link getCertificateProblem}),
 * to mark a certificate in the list; the plugin can return the same codes by HRESULT.
 */
export const CERTIFICATE_PROBLEMS = Lookup.create([
    CADES_ERROR_CODES.CERT_NOT_YET_VALID,
    CADES_ERROR_CODES.CERT_EXPIRED,
    CADES_ERROR_CODES.CERT_NO_PRIVATE_KEY,
    CADES_ERROR_CODES.CERT_UNTRUSTED,
    CADES_ERROR_CODES.UNSUPPORTED_KEY
])

/** Why a certificate cannot be used; `undefined` where it is returned — it can */
export type CertificateProblem = LookupValueOf<typeof CERTIFICATE_PROBLEMS>

/**
 * i18n key (the English text, as everywhere in the application) of the short title of the user message for each code,
 * the advice is {@link CADES_ERROR_I18N_HINT_KEYS}; the translations are in `i18n/assets/local/*.json`.
 * `CERT_EXPIRED` and `CERT_NOT_YET_VALID` take the `date` parameter; the `FILE_TOO_LARGE` advice — `size`, `maxSize`
 * and `maxSizeMiB`, computed from the error `cause` ({@link FileTooLargeError}).
 * When the date is unknown (the error came from the plugin, e.g. a certificate in the chain), use {@link CADES_ERROR_I18N_KEYS_NO_DATE}.
 *
 * @example
 * ```ts
 * t(CADES_ERROR_I18N_KEYS[error.code], { date })
 * ```
 */
export const CADES_ERROR_I18N_KEYS: Record<CadesErrorCode, string> = {
    PLUGIN_NOT_AVAILABLE: 'CryptoPro plugin is not available',
    PLUGIN_OUTDATED: 'CryptoPro plugin is outdated',
    PLUGIN_NOT_RESPONDING: 'CryptoPro plugin is not responding',
    CERT_EXPIRED: 'Certificate expired',
    CERT_NOT_YET_VALID: 'Certificate not yet valid',
    CERT_NO_PRIVATE_KEY: 'No private key for certificate',
    CERT_UNTRUSTED: 'Certificate chain validation failed',
    UNSUPPORTED_KEY: 'Certificate key algorithm is not supported',
    USER_CANCELLED: 'The operation was cancelled by the user',
    OPERATION_ABORTED: 'The operation was stopped',
    FILE_TOO_LARGE: 'The file is too large for an attached signature',
    ASSEMBLY_NOT_AVAILABLE: 'Attached signature of large files is not included in the application',
    INVALID_CMS: 'The signature has an unexpected structure',
    TSA_NOT_CONFIGURED: 'The time stamp service for CAdES-T signatures is not configured',
    SIGN_FAILED: 'Failed to create the signature',
    VERIFY_FAILED: 'Signature verification failed',
    ENCRYPT_FAILED: 'Failed to encrypt the file',
    UNKNOWN: 'CryptoPro error'
}

/**
 * i18n keys of the advice for a code: the {@link CADES_ERROR_I18N_KEYS} text is a short title of what happened
 * (a notification title of one or two lines), what to do goes here. Takes the same parameters as the title.
 */
export const CADES_ERROR_I18N_HINT_KEYS: Partial<Record<CadesErrorCode, string>> = {
    PLUGIN_NOT_AVAILABLE: 'Check that the CryptoPro plugin and the browser extension are installed and enabled',
    PLUGIN_OUTDATED: 'Update the CryptoPro plugin to continue',
    PLUGIN_NOT_RESPONDING: 'Reload the page and repeat the operation',
    CERT_NO_PRIVATE_KEY: 'Signing with this certificate is impossible',
    CERT_UNTRUSTED: 'The certificates of the CA that issued your certificate may not be installed on the computer',
    UNSUPPORTED_KEY: 'Use a certificate with a GOST R 34.10-2012 key',
    OPERATION_ABORTED: 'Close the CryptoPro PIN dialog of the stopped operation, restart the extension if the plugin does not respond',
    FILE_TOO_LARGE: 'Use a detached signature: the file is larger than the limit',
    TSA_NOT_CONFIGURED: 'The time stamp service is needed for CAdES-T signatures, contact the administrator'
}

/** i18n keys for date problems without a known date. */
export const CADES_ERROR_I18N_KEYS_NO_DATE: Partial<Record<CadesErrorCode, string>> = {
    CERT_EXPIRED: 'The certificate or a certificate in its chain has expired',
    CERT_NOT_YET_VALID: 'The certificate is not yet valid'
}

/**
 * HRESULT of the plugin → error code that names the cause; checked with plugin 2.0.15820 (README, «Errors»).
 *
 * @remarks
 * Only codes with one meaning at any step: the user message must not claim more than the code says.
 * Generic codes (e.g. `0x80070057` E_INVALIDARG) and codes whose message would depend on the step
 * (`0x800B010E` revocation check failed) are not listed — they get the code of the failed step.
 */
const HRESULT_CODES: Record<string, CadesErrorCode> = {
    '0x80090014': CADES_ERROR_CODES.UNSUPPORTED_KEY, // NTE_BAD_PROV_TYPE: key in CNG (Microsoft Software Key Storage Provider)
    '0x800B0101': CADES_ERROR_CODES.CERT_EXPIRED, // CERT_E_EXPIRED: the certificate or one in its chain
    '0x800B0109': CADES_ERROR_CODES.CERT_UNTRUSTED, // CERT_E_UNTRUSTEDROOT
    '0x8010006E': CADES_ERROR_CODES.USER_CANCELLED // SCARD_W_CANCELLED_BY_USER: PIN dialog cancelled
}

/**
 * Error of a CryptoPro operation with a code for the UI and the plugin HRESULT, if any.
 *
 * @remarks
 * Replaces the former `utils/cadesPlugin/CadesPluginError`: `code` is now a string from {@link CADES_ERROR_CODES}
 * and goes first in the constructor.
 */
export class CadesPluginError extends Error {
    /** HRESULT from the plugin message, e.g. `0x80090014`; `undefined` if the plugin text has no code or the error is ours */
    readonly pluginCode?: string

    /**
     * Text of the original error as the plugin (or the browser) gave it, with HRESULT if any — for the user as details;
     * `undefined` for errors found by our checks, whose cause the `code` already names.
     */
    readonly pluginMessage?: string

    /**
     * @param code - what went wrong, for the user message ({@link CADES_ERROR_I18N_KEYS})
     * @param message - technical details for the console
     * @param options - `pluginCode`, `pluginMessage` and the original error as `cause`
     */
    constructor(
        readonly code: CadesErrorCode,
        message?: string,
        options?: { pluginCode?: string; pluginMessage?: string; cause?: unknown }
    ) {
        super(message ?? code, { cause: options?.cause })
        this.name = 'CadesPluginError'
        this.pluginCode = options?.pluginCode
        this.pluginMessage = options?.pluginMessage
    }
}

/** Whether the error came from a CryptoPro operation and has a {@link CadesPluginError.code}. */
export const isCadesPluginError = (error: unknown): error is CadesPluginError => error instanceof CadesPluginError

/**
 * HRESULT from a plugin message like `Параметр задан неверно. (0x80070057)`, upper case hex.
 * The async plugin gives the code only inside the message text.
 */
export function extractHResult(message: string): string | undefined {
    const match = /\(0x([0-9a-f]{8})\)/i.exec(message)
    return match ? `0x${match[1].toUpperCase()}` : undefined
}

/**
 * Text of a plugin exception with the HRESULT.
 *
 * @remarks
 * The async plugin rejects with a plain object `{ message, requestid, type }`, not an `Error` (measured with 2.0.15820),
 * so the message is taken from any object; `cadesplugin.getLastError` is preferred when available.
 */
function errorText(error: unknown): string {
    if (typeof window !== 'undefined' && typeof error === 'object' && error !== null && window.cadesplugin?.getLastError) {
        try {
            return window.cadesplugin.getLastError(error as Error)
        } catch {
            // getLastError itself failed — fall back to the message
        }
    }
    const message = typeof error === 'object' && error !== null ? (error as { message?: unknown }).message : undefined
    return typeof message === 'string' ? message : String(error)
}

/**
 * Turns any error of an operation into {@link CadesPluginError}.
 *
 * @remarks
 * Unambiguous HRESULTs map to the code of the cause, anything else gets `fallback` — the code of the failed step;
 * the original text stays in `pluginMessage`. {@link FileTooLargeError} becomes `FILE_TOO_LARGE`.
 */
export function wrapPluginError(error: unknown, fallback: CadesErrorCode = CADES_ERROR_CODES.UNKNOWN): CadesPluginError {
    if (error instanceof CadesPluginError) {
        return error
    }
    if (error instanceof FileTooLargeError) {
        return new CadesPluginError(CADES_ERROR_CODES.FILE_TOO_LARGE, error.message, { cause: error })
    }
    const text = errorText(error)
    const pluginCode = extractHResult(text)
    return new CadesPluginError((pluginCode && HRESULT_CODES[pluginCode]) || fallback, text, {
        pluginCode,
        pluginMessage: text,
        cause: error
    })
}
