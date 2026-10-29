import { DEFAULT_CHUNK_SIZE, MB } from '@features/file'
import { envBoolean, envString } from '@utils/env'

/**
 * CryptoPro settings. Only the time stamp service and the assembly flag come from environment variables (`ui/.env*`);
 * the rest are constants.
 */
export const CRYPTOPRO_CONFIG = {
    /** Bytes per chunk for hashing and encryption; a multiple of 3. 3 MiB, as in plugin-samples-fileapi_stream */
    chunkSize: DEFAULT_CHUNK_SIZE,
    /**
     * Bytes of the file the user chose; up to this size an attached signature is made by `SignCades`, which takes the whole file.
     * The plugin documentation limits such data to 10–60 MB depending on the computer; the browser needs about 3.5 × the file size.
     * One limit for every attached operation, with a margin: `encryptAndSign` gives `SignCades` the .enc, which is base64 text,
     * so the plugin gets ≈ 1.78 × the file (testing: 35 MiB hung the plugin, 34 MiB was signed).
     * Not used when `attachedAssembly` is on.
     */
    nativeAttachedMaxSize: 30 * MB,
    /**
     * `REACT_APP_CRYPTOPRO_ATTACHED_ASSEMBLY=true` — every attached signature, of any size, is assembled from a detached one
     * (the file is inserted into the CMS by our code), so that it is made the same way for all files.
     * The plugin cannot verify such a signature of a large file.
     * @defaultValue false — `SignCades` up to `nativeAttachedMaxSize`, larger files get `FILE_TOO_LARGE`
     */
    attachedAssembly: envBoolean('REACT_APP_CRYPTOPRO_ATTACHED_ASSEMBLY'),
    /**
     * `REACT_APP_CRYPTOPRO_TSA_URL` — time stamp service, required for CAdES-T.
     * @defaultValue not set — signing with `CADES_T` fails before the plugin is called
     */
    tsaUrl: envString('REACT_APP_CRYPTOPRO_TSA_URL'),
    /** Minimal plugin version for encryption in chunks: `StreamEncrypt` returns concatenable parts since 2.0.15260 */
    minPluginVersion: '2.0.15260',
    /**
     * Milliseconds to wait for the plugin to take one chunk (`Hash`, `StreamEncrypt`), then `PLUGIN_NOT_RESPONDING`.
     * These calls show no dialogs, so a long wait means the extension lost the answer.
     */
    chunkTimeout: 60_000
}
