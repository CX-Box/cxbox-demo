import { Lookup } from '@utils/Lookup'

export class CadesPluginError extends Error {
    code?: number
    static readonly codes = Lookup.create({
        UNKNOWN: 0,
        INITIALIZATION_FAILED: 1,
        CERT_INVALID: 2,
        SIGNATURE_VERIFICATION_FAILED: 3,
        FILE_TOO_LARGE: 4,
        PLUGIN_NOT_RESPONDING: 7
    })

    static readonly UNKNOWN = CadesPluginError.codes.UNKNOWN
    static readonly INITIALIZATION_FAILED = CadesPluginError.codes.INITIALIZATION_FAILED
    static readonly SIGNATURE_VERIFICATION_FAILED = CadesPluginError.codes.SIGNATURE_VERIFICATION_FAILED
    static readonly CERT_INVALID = CadesPluginError.codes.CERT_INVALID
    /** The file is larger than `MAX_CRYPTO_FILE_SIZE`, or than `ATTACHED_MAX_FILE_SIZE` for an attached signature */
    static readonly FILE_TOO_LARGE = CadesPluginError.codes.FILE_TOO_LARGE
    /** The plugin did not answer a part of a large file in `PLUGIN_PART_TIMEOUT` */
    static readonly PLUGIN_NOT_RESPONDING = CadesPluginError.codes.PLUGIN_NOT_RESPONDING

    constructor(message: string, code?: number, options?: ErrorOptions) {
        super(message, options)
        this.name = 'CadesPluginError'
        this.code = code

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CadesPluginError)
        }
    }
}
