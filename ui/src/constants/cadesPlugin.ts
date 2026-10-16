import { Lookup, LookupValueOf } from '@utils/Lookup'

export const SIGNATURE_TYPES = Lookup.create(['CADES_BES', 'CADES_T'])

export type SignatureType = LookupValueOf<typeof SIGNATURE_TYPES>

export const DEFAULT_SIGNATURE_TYPE = SIGNATURE_TYPES.CADES_BES

export const SIGNATURE_PACKAGE = Lookup.create(['detached', 'attached'])

export type SignaturePackage = LookupValueOf<typeof SIGNATURE_PACKAGE>

export const DEFAULT_SIGNATURE_PACKAGE = SIGNATURE_PACKAGE.detached

export const TSA_URL = process.env.REACT_APP_CRYPTOPRO_TSA_URL || 'http://testca2012.cryptopro.ru/tspservice'

const MB = 1024 * 1024

/** A large file goes to the plugin in parts of this size, bytes. A multiple of 3, so the base64 of a part has no padding */
export const HASH_PART_SIZE = 3 * MB

/**
 * The largest base64 string passed to the plugin in one call, characters.
 * Chrome-based browsers break a message to the extension longer than ~64 MB with "Lost connection to extension".
 * The message is longer than the base64 itself: line breaks and JSON escaping add up to ~6%, so the limit keeps a margin
 */
export const PLUGIN_MESSAGE_LIMIT = 56 * MB

/** How long one part of a large file may take in the plugin, milliseconds: then the operation fails instead of waiting forever */
export const PLUGIN_PART_TIMEOUT = 60 * 1000

const positiveNumber = (value: string | undefined) => {
    const number = Number(value)
    return Number.isFinite(number) && number > 0 ? number : undefined
}

/** The largest file that can be signed or encrypted, bytes: `REACT_APP_CRYPTOPRO_MAX_FILE_SIZE`, 200 MB when it is not a positive number */
export const MAX_CRYPTO_FILE_SIZE = positiveNumber(process.env.REACT_APP_CRYPTOPRO_MAX_FILE_SIZE) ?? 200 * MB

/**
 * The largest file for an attached signature and encryption, bytes: `REACT_APP_CRYPTOPRO_RECIPIENT_MAX_FILE_SIZE`,
 * no limit when it is not set. For recipients whose tools do not open large files whole:
 * CryptoPro `csptest` does not verify an attached signature or decrypt a message larger than ~100 MB.
 * A detached signature is not limited by it
 */
export const RECIPIENT_MAX_FILE_SIZE = positiveNumber(process.env.REACT_APP_CRYPTOPRO_RECIPIENT_MAX_FILE_SIZE)

export const CRYPTOPRO_LINKS = {
    INSTRUCTION_URL: process.env.REACT_APP_CRYPTOPRO_INSTRUCTION_LINK || 'https://doc.cxbox.org/features/sign/sign/'
}
