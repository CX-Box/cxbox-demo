import { forEachBase64Chunk } from '@features/file'
import { CRYPTOPRO_CONFIG } from './config'
import { HashAlgorithm } from './hashAlgorithm'
import { getCadesPlugin } from './plugin'

/**
 * Hashes a Blob in chunks with the plugin `HashedData`, as plugin-samples-fileapi_stream does.
 *
 * @remarks
 * `DataEncoding` is set first (changing it resets the object), then `Algorithm`, both before the first `Hash`.
 * Every `Hash` is awaited: without it a failed chunk silently drops out of the hash and incomplete data gets signed.
 * A new object per file — reusing `HashedData` for another file is not documented.
 *
 * @returns the `HashedData` object to pass to `SignHash` / `VerifyHash`; plugin errors are not wrapped
 */
export async function hashBlob(blob: Blob, algorithm: HashAlgorithm): Promise<CAdESCOM.CPHashedDataAsync> {
    const { cadesplugin } = await getCadesPlugin()
    const hashedData = await cadesplugin.CreateObjectAsync('CAdESCOM.HashedData')
    await hashedData.propset_DataEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY)
    await hashedData.propset_Algorithm(algorithm)
    await forEachBase64Chunk(blob, CRYPTOPRO_CONFIG.chunkSize, chunk => hashedData.Hash(chunk))
    return hashedData
}
