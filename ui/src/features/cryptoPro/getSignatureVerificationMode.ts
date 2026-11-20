import { Lookup } from '@utils/Lookup'
import { DEFAULT_SIGNATURE_VERIFICATION_MODE, SIGNATURE_VERIFICATION_MODES, SignatureVerificationMode } from './constants'

export function getSignatureVerificationMode(value: string | undefined): SignatureVerificationMode {
    if (value === undefined) {
        return DEFAULT_SIGNATURE_VERIFICATION_MODE
    }
    if (Lookup.has(SIGNATURE_VERIFICATION_MODES, value)) {
        return value
    }
    console.error(
        `REACT_APP_CRYPTOPRO_SIGNATURE_VERIFICATION_MODE=${value} is invalid: expected strict or soft. Using ${DEFAULT_SIGNATURE_VERIFICATION_MODE}`
    )
    return DEFAULT_SIGNATURE_VERIFICATION_MODE
}
