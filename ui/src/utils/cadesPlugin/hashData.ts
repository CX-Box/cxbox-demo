import { CertificateAsync } from '@interfaces/sign'
import { getCadesPlugin } from '@utils/cadesPlugin/getCadesPlugin'
import { CryptoPartsOptions, passPluginParts } from '@utils/cadesPlugin/base64Data'
import { HASH_ALGORITHM_BY_KEY } from '@constants/cadesPlugin'

type HashAlgorithmName =
    | 'CADESCOM_HASH_ALGORITHM_CP_GOST_3411'
    | 'CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256'
    | 'CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512'

/** Hash algorithm by the OID of the public key algorithm: the same table as on the CryptoPro demo page */
const HASH_ALGORITHM_BY_KEY_OID: Record<string, HashAlgorithmName> = {
    '1.2.643.7.1.1.1.1': 'CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256',
    '1.2.643.7.1.1.1.2': 'CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512',
    '1.2.643.2.2.19': 'CADESCOM_HASH_ALGORITHM_CP_GOST_3411'
}

/**
 * Public key algorithm of a certificate
 *
 * @returns `oid`, e.g. `1.2.643.7.1.1.1.1` for GOST R 34.10-2012 256, and `name` to show, e.g. `RSA`
 */
export async function getKeyAlgorithm(certificate: CertificateAsync): Promise<{ oid: string; name: string }> {
    const publicKey = await certificate.PublicKey()
    const algorithm = await publicKey.Algorithm
    return { oid: await algorithm.Value, name: await algorithm.FriendlyName }
}

/**
 * Hash algorithm for signing a large file with the certificate.
 *
 * @returns the name of the `cadesplugin` constant for a GOST key; `undefined` when `HASH_ALGORITHM_BY_KEY` is `false`
 * or the key is not GOST — the plugin then hashes with its default algorithm
 */
export async function getHashAlgorithm(certificate: CertificateAsync): Promise<HashAlgorithmName | undefined> {
    if (!HASH_ALGORITHM_BY_KEY) {
        return undefined
    }
    return HASH_ALGORITHM_BY_KEY_OID[(await getKeyAlgorithm(certificate)).oid]
}

/**
 * Hashes data in the plugin part by part, so a file of any size never goes to the plugin in one message.
 *
 * @param data - a file, or base64 of the data; not empty
 * @param algorithm - the name of the hash algorithm constant, see `getHashAlgorithm`; `undefined` — the default of the plugin
 * @returns the `HashedData` object for `SignHash` and `VerifyHash`
 * @throws CadesPluginError with the number of the part when the plugin fails or does not answer, see `passPluginParts`
 */
export async function hashData(data: Blob | string, algorithm: HashAlgorithmName | undefined, options: CryptoPartsOptions = {}) {
    const cadesplugin = getCadesPlugin()
    const hashedData = await cadesplugin.CreateObjectAsync('CAdESCOM.HashedData')
    // both must be set before the first Hash(): the default encoding re-encodes the data to UCS-2
    if (algorithm) {
        await hashedData.propset_Algorithm(cadesplugin[algorithm])
    }
    await hashedData.propset_DataEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY)

    await passPluginParts(data, part => hashedData.Hash(part), options)

    return hashedData
}
