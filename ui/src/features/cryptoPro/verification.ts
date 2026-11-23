import { CRYPTOPRO_CONFIG } from './config'
import { SIGNATURE_VERIFICATION_MODES } from './constants'
import { CADES_ERROR_CODES, wrapPluginError } from './errors'

export function handleVerificationError(error: unknown, method: 'VerifyHash' | 'VerifyCades'): void {
    const verificationError = wrapPluginError(error, CADES_ERROR_CODES.VERIFY_FAILED)
    if (CRYPTOPRO_CONFIG.signatureVerificationMode !== SIGNATURE_VERIFICATION_MODES.soft) {
        throw verificationError
    }

    console.warn(`[CryptoPro] ${method} verification failed in soft mode; returning the created signature`, {
        code: verificationError.code,
        pluginCode: verificationError.pluginCode,
        message: verificationError.message
    })
}
