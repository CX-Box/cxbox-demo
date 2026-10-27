import { envString } from '@utils/env'
import { Lookup, LookupValueOf } from '@utils/Lookup'
import { CRYPTOPRO_CONFIG } from './config'

/** CAdES signature types available in widget meta (`options.cryptoGenerator[].signatureType`). */
export const SIGNATURE_TYPES = Lookup.create(['CADES_BES', 'CADES_T'])

export type SignatureType = LookupValueOf<typeof SIGNATURE_TYPES>

export const DEFAULT_SIGNATURE_TYPE = SIGNATURE_TYPES.CADES_BES

/** Detached — the signature without the file; attached — the file inside the signature. */
export const SIGNATURE_PACKAGE = Lookup.create(['detached', 'attached'])

export type SignaturePackage = LookupValueOf<typeof SIGNATURE_PACKAGE>

export const DEFAULT_SIGNATURE_PACKAGE = SIGNATURE_PACKAGE.detached

/** Time stamp service for CAdES-T, `REACT_APP_CRYPTOPRO_TSA_URL`; `undefined` if not set. */
export const TSA_URL = CRYPTOPRO_CONFIG.tsaUrl

/** Links shown to the user when the plugin or a certificate is missing, `REACT_APP_CRYPTOPRO_INSTRUCTION_LINK`. */
export const CRYPTOPRO_LINKS = {
    INSTRUCTION_URL: envString('REACT_APP_CRYPTOPRO_INSTRUCTION_LINK') ?? 'https://doc.cxbox.org/features/sign/sign/'
}

/** Value of the documentName signed attribute, as before. */
export const DEFAULT_DOCUMENT_NAME = 'Document Name'
