import { Lookup } from '@utils/Lookup'
import { DEFAULT_SIGNATURE_TYPE, SIGNATURE_TYPES, TSA_URL } from './constants'
import { CadesPluginError, CADES_ERROR_CODES } from './errors'
import { SignOptions } from './types'

/**
 * `CADESCOM_CADES_*` constant for the signature type from widget meta; checked before the file is read.
 *
 * @throws {@link CadesPluginError} `SIGN_FAILED` for an unknown type — otherwise the plugin silently uses CAdES-X Long Type 1;
 * `TSA_NOT_CONFIGURED` for `CADES_T` without a time stamp service
 */
export function resolveCadesType(
    cadesplugin: CADESPluginAsync,
    options: SignOptions = {}
): CADES_Common.ValuesOf<CAdESCOM.CADESCOM_CADES_TYPE> {
    const { cadesType = DEFAULT_SIGNATURE_TYPE, tsaUrl = TSA_URL } = options
    if (!Lookup.hasKey(SIGNATURE_TYPES, cadesType)) {
        throw new CadesPluginError(
            CADES_ERROR_CODES.SIGN_FAILED,
            `Unknown signature type "${cadesType}", expected ${Lookup.keys(SIGNATURE_TYPES).join(', ')}`
        )
    }
    if (cadesType === SIGNATURE_TYPES.CADES_T && !tsaUrl) {
        throw new CadesPluginError(
            CADES_ERROR_CODES.TSA_NOT_CONFIGURED,
            'CAdES-T needs a time stamp service: REACT_APP_CRYPTOPRO_TSA_URL is not set'
        )
    }
    return cadesplugin[`CADESCOM_${cadesType}`]
}
