import { Lookup, LookupValueOf } from '@utils/Lookup'
import { CadesPluginError, CADES_ERROR_CODES } from './errors'

/**
 * Key algorithm OID → hash algorithm for `HashedData` (`CADESCOM_HASH_ALGORITHM_*`).
 * Only GOST R 34.10-2012 (the interstate GOST 34.10-2018 is the same algorithm with the same OIDs) —
 * why not GOST 2001, RSA and ECDSA, see README, «Supported keys».
 *
 * @remarks
 * A key algorithm missing here cannot sign: its certificates are listed and marked, signing fails with `UNSUPPORTED_KEY` before the plugin is called
 * (encryption does not depend on this table). For a new GOST add a line «key OID → hash constant of the plugin»;
 * the plugin and CryptoPro CSP must support the new algorithm too.
 */
const HASH_BY_KEY_OID = Lookup.create({
    '1.2.643.7.1.1.1.1': 101, // GOST R 34.10-2012 256 → CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256
    '1.2.643.7.1.1.1.2': 102 // GOST R 34.10-2012 512 → CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512
})

/** `CADESCOM_HASH_ALGORITHM_*` of a key that can sign */
export type HashAlgorithm = LookupValueOf<typeof HASH_BY_KEY_OID>

/**
 * Hash algorithm for signing by hash with a key of the given algorithm.
 *
 * @remarks
 * The only place where the hash is chosen by the key — when GOST changes (a new key or hash algorithm), change `HASH_BY_KEY_OID`.
 * `SignHash` takes the algorithm from `HashedData`; without it the plugin hashes with GOST R 34.11-94
 * and a GOST 2012 key fails with `0x80070057`.
 *
 * @param keyOid - `Certificate.PublicKey().Algorithm.Value`
 * @throws {@link CadesPluginError} `UNSUPPORTED_KEY` for a key missing in `HASH_BY_KEY_OID`
 */
export function resolveHashAlgorithm(keyOid: string): HashAlgorithm {
    if (!Lookup.hasKey(HASH_BY_KEY_OID, keyOid)) {
        throw new CadesPluginError(
            CADES_ERROR_CODES.UNSUPPORTED_KEY,
            `Key algorithm ${keyOid} is not supported for signing, only GOST R 34.10-2012`
        )
    }
    return HASH_BY_KEY_OID[keyOid]
}

/** Whether a key of this algorithm can sign (has a hash in `HASH_BY_KEY_OID`). */
export const canSignWithKey = (keyOid: string) => Lookup.hasKey(HASH_BY_KEY_OID, keyOid)
