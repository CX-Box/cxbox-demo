import { Lookup } from '@utils/Lookup'

export class CadesPluginError extends Error {
    code?: number
    static readonly codes = Lookup.create({
        UNKNOWN: 0,
        INITIALIZATION_FAILED: 1,
        CERT_INVALID: 2,
        SIGNATURE_VERIFICATION_FAILED: 3
    })

    static readonly UNKNOWN = CadesPluginError.codes.UNKNOWN
    static readonly INITIALIZATION_FAILED = CadesPluginError.codes.INITIALIZATION_FAILED
    static readonly SIGNATURE_VERIFICATION_FAILED = CadesPluginError.codes.SIGNATURE_VERIFICATION_FAILED
    static readonly CERT_INVALID = CadesPluginError.codes.CERT_INVALID

    constructor(message: string, code?: number, options?: ErrorOptions) {
        super(message, options)
        this.name = 'CadesPluginError'
        this.code = code

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CadesPluginError)
        }
    }
}
