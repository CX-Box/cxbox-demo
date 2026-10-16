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
 * Chrome breaks a message to the extension longer than 64 MiB with "Lost connection to extension";
 * line breaks and JSON escaping make the message longer than the base64 itself, so the limit keeps a margin.
 * A detached signature of a larger file is made by its hash, see `hashData`
 */
export const PLUGIN_MESSAGE_LIMIT = 56 * MB

/**
 * The largest file for an attached signature, bytes: it is signed whole, and the signature, which holds the file,
 * goes back to the plugin to be verified as base64 with a line break every 64 characters, escaped in the message
 */
export const ATTACHED_MAX_FILE_SIZE = Math.floor((((PLUGIN_MESSAGE_LIMIT / 4) * 3) / 68) * 64)

/** How long one part of a large file may take in the plugin, milliseconds: then the signing fails instead of waiting forever */
export const PLUGIN_PART_TIMEOUT = 60 * 1000

const positiveNumber = (value: string | undefined) => {
    const number = Number(value)
    return Number.isFinite(number) && number > 0 ? number : undefined
}

/**
 * The largest file that can be signed, bytes: `REACT_APP_CRYPTOPRO_MAX_FILE_SIZE` in bytes (e.g. `209715200` for 200 MB),
 * 200 MB when it is not a positive number
 */
export const MAX_CRYPTO_FILE_SIZE = positiveNumber(process.env.REACT_APP_CRYPTOPRO_MAX_FILE_SIZE) ?? 200 * MB

/**
 * Whether a large file is hashed with the algorithm of the key of the certificate (`propset_Algorithm` by its OID).
 * `false` hashes as the CryptoPro sample does, with the default algorithm of the plugin (GOST R 34.11-94):
 * then a GOST 2012 certificate cannot sign a large file (`SignHash` fails with 0x80070057)
 */
export const HASH_ALGORITHM_BY_KEY = true

export const CRYPTOPRO_LINKS = {
    INSTRUCTION_URL: process.env.REACT_APP_CRYPTOPRO_INSTRUCTION_LINK || 'https://doc.cxbox.org/features/sign/sign/'
}
