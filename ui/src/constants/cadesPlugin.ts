import { Lookup, LookupValueOf } from '@utils/Lookup'

export const SIGNATURE_TYPES = Lookup.create(['CADES_BES', 'CADES_T'])

export type SignatureType = LookupValueOf<typeof SIGNATURE_TYPES>

export const DEFAULT_SIGNATURE_TYPE = SIGNATURE_TYPES.CADES_BES

export const SIGNATURE_PACKAGE = Lookup.create(['detached', 'attached'])

export type SignaturePackage = LookupValueOf<typeof SIGNATURE_PACKAGE>

export const DEFAULT_SIGNATURE_PACKAGE = SIGNATURE_PACKAGE.detached

export const TSA_URL = process.env.REACT_APP_CRYPTOPRO_TSA_URL || 'http://testca2012.cryptopro.ru/tspservice'

export const CRYPTOPRO_LINKS = {
    INSTRUCTION_URL: process.env.REACT_APP_CRYPTOPRO_INSTRUCTION_LINK || 'https://doc.cxbox.org/features/sign/sign/'
}
