/**
 * Signing and encryption of files with CryptoPro ECP Browser plug-in.
 * Supported keys, settings, limits and the plugin behaviour the code relies on — `README.md` of this directory.
 *
 * @module features/cryptoPro
 */
export {
    CADES_ERROR_CODES,
    CADES_ERROR_I18N_KEYS,
    CADES_ERROR_I18N_KEYS_NO_DATE,
    CERTIFICATE_PROBLEMS,
    CadesPluginError,
    isCadesPluginError
} from './errors'
export type { CadesErrorCode, CertificateProblem } from './errors'
export {
    SIGNATURE_TYPES,
    DEFAULT_SIGNATURE_TYPE,
    SIGNATURE_PACKAGE,
    DEFAULT_SIGNATURE_PACKAGE,
    TSA_URL,
    CRYPTOPRO_LINKS,
    DEFAULT_DOCUMENT_NAME
} from './constants'
export type { SignatureType, SignaturePackage } from './constants'
export type { CertificateAsync, CertificateData, CertificatePurpose, EncryptResult, SignOptions, SignResult } from './types'
export { ensureCadesPluginInstalled, getPluginVersion } from './plugin'
export { getCertificates, getCertificateProblem, getCertificateProblemDate } from './certificates'
export type { GetCertificatesOptions } from './certificates'
export { encrypt } from './encrypt'
export { sign, signAndEncrypt, encryptAndSign } from './operations'
export type { OperationOptions, SignedAndEncrypted } from './operations'
