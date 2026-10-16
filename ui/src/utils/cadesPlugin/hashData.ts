import { t } from 'i18next'
import { CertificateAsync } from '@interfaces/sign'
import { getCadesPlugin } from '@utils/cadesPlugin/getCadesPlugin'
import { CryptoInput, CryptoPartsOptions, passPluginParts } from '@utils/cadesPlugin/base64Data'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'
import { checkPluginMethods } from '@utils/cadesPlugin/pluginCalls'
import { getLargestWholeSignedFileSize, toMegabytes } from '@utils/cadesPlugin/checkPluginDataSize'

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
 * Hash algorithm for the key of a certificate.
 *
 * @returns the name of the `cadesplugin` constant, `undefined` for a key that is not GOST
 */
export const getHashAlgorithmByKeyOid = (oid: string): HashAlgorithmName | undefined => HASH_ALGORITHM_BY_KEY_OID[oid]

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
 * Checks that large data can be signed with the certificate by its hash, before the data is passed to the plugin:
 * the key is GOST and the plugin has the methods for signing a hash.
 *
 * @param largestWholeFileSize - the largest file signed without the hash, bytes: the error names it
 * @returns the hash algorithm for `hashData`
 * @throws CadesPluginError `UNSUPPORTED_KEY_ALGORITHM` for a key that is not GOST, `PLUGIN_OUTDATED` for an old plugin
 */
export async function getHashSigningAlgorithm(
    certificate: CertificateAsync,
    largestWholeFileSize: number = getLargestWholeSignedFileSize(false)
): Promise<HashAlgorithmName> {
    const key = await getKeyAlgorithm(certificate)
    const algorithm = getHashAlgorithmByKeyOid(key.oid)

    // not GOST: the plugin picks the hash algorithm itself only when it gets the data
    if (!algorithm) {
        throw new CadesPluginError(
            t('Unsupported key algorithm', { algorithm: key.name || key.oid, max: toMegabytes(largestWholeFileSize, Math.floor) }),
            CadesPluginError.UNSUPPORTED_KEY_ALGORITHM
        )
    }

    const cadesplugin = getCadesPlugin()
    checkPluginMethods(await cadesplugin.CreateObjectAsync('CAdESCOM.HashedData'), 'propset_DataEncoding', 'Hash')
    checkPluginMethods(await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData'), 'SignHash', 'VerifyHash')

    return algorithm
}

/**
 * Hashes data in the plugin part by part, so a file of any size never goes to the plugin in one message.
 *
 * @param data - a file, base64 of the data, or {@link Base64Text}
 * @param algorithm - the name of the hash algorithm constant, see `getHashSigningAlgorithm`
 * @returns the `HashedData` object for `SignHash` and `VerifyHash`
 * @throws Error "Interrupted" when `isInterrupted` returns `true`; CadesPluginError with the number of the part when the plugin fails,
 * `PLUGIN_OUTDATED` when the plugin cannot hash in parts
 */
export async function hashData(data: CryptoInput, algorithm: HashAlgorithmName, options: CryptoPartsOptions = {}) {
    const cadesplugin = getCadesPlugin()
    const hashedData = await cadesplugin.CreateObjectAsync('CAdESCOM.HashedData')
    checkPluginMethods(hashedData, 'propset_DataEncoding', 'Hash')
    // both must be set before the first Hash(): the default encoding re-encodes the data to UCS-2
    await hashedData.propset_Algorithm(cadesplugin[algorithm])
    await hashedData.propset_DataEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY)

    await passPluginParts(data, part => hashedData.Hash(part), options)

    return hashedData
}
