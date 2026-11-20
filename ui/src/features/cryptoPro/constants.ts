import { Lookup, LookupValueOf } from '@utils/Lookup'

export const SIGNATURE_VERIFICATION_MODES = Lookup.create(['strict', 'soft'])

export type SignatureVerificationMode = LookupValueOf<typeof SIGNATURE_VERIFICATION_MODES>

export const DEFAULT_SIGNATURE_VERIFICATION_MODE = SIGNATURE_VERIFICATION_MODES.strict

/** CAdES signature types available in widget meta (`options.cryptoGenerator[].signatureType`). */
export const SIGNATURE_TYPES = Lookup.create(['CADES_BES', 'CADES_T'])

export type SignatureType = LookupValueOf<typeof SIGNATURE_TYPES>

export const DEFAULT_SIGNATURE_TYPE = SIGNATURE_TYPES.CADES_BES

/** Detached — the signature without the file; attached — the file inside the signature. */
export const SIGNATURE_PACKAGE = Lookup.create(['detached', 'attached'])

export type SignaturePackage = LookupValueOf<typeof SIGNATURE_PACKAGE>

export const DEFAULT_SIGNATURE_PACKAGE = SIGNATURE_PACKAGE.detached

export const DEFAULT_INSTRUCTION_URL = 'https://doc.cxbox.org/features/sign/sign/'

/** Value of the documentName signed attribute, as before. */
export const DEFAULT_DOCUMENT_NAME = 'Document Name'
