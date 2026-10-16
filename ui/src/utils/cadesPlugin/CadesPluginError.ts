import { Lookup } from '@utils/Lookup'

export class CadesPluginError extends Error {
    code?: number
    static readonly codes = Lookup.create({
        UNKNOWN: 0,
        INITIALIZATION_FAILED: 1,
        CERT_INVALID: 2,
        SIGNATURE_VERIFICATION_FAILED: 3,
        FILE_TOO_LARGE: 4,
        UNSUPPORTED_KEY_ALGORITHM: 5,
        PLUGIN_OUTDATED: 6,
        PLUGIN_NOT_RESPONDING: 7,
        RESULT_DAMAGED: 8
    })

    static readonly UNKNOWN = CadesPluginError.codes.UNKNOWN
    static readonly INITIALIZATION_FAILED = CadesPluginError.codes.INITIALIZATION_FAILED
    static readonly SIGNATURE_VERIFICATION_FAILED = CadesPluginError.codes.SIGNATURE_VERIFICATION_FAILED
    static readonly CERT_INVALID = CadesPluginError.codes.CERT_INVALID
    /** The file (or the data made from it) is larger than `MAX_CRYPTO_FILE_SIZE`, or than `RECIPIENT_MAX_FILE_SIZE` for an attached signature or encryption */
    static readonly FILE_TOO_LARGE = CadesPluginError.codes.FILE_TOO_LARGE
    /** A large file is signed by its hash, and the hash algorithm for the key of the certificate is unknown */
    static readonly UNSUPPORTED_KEY_ALGORITHM = CadesPluginError.codes.UNSUPPORTED_KEY_ALGORITHM
    /** The installed plugin has no method needed for large files */
    static readonly PLUGIN_OUTDATED = CadesPluginError.codes.PLUGIN_OUTDATED
    /** The plugin did not answer a part of a large file in `PLUGIN_PART_TIMEOUT`: the next calls would wait behind it */
    static readonly PLUGIN_NOT_RESPONDING = CadesPluginError.codes.PLUGIN_NOT_RESPONDING
    /** The signature, the encrypted message or the downloaded document is not what it must be: nothing is saved */
    static readonly RESULT_DAMAGED = CadesPluginError.codes.RESULT_DAMAGED

    constructor(message: string, code?: number, options?: ErrorOptions) {
        super(message, options)
        this.name = 'CadesPluginError'
        this.code = code

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CadesPluginError)
        }
    }
}
