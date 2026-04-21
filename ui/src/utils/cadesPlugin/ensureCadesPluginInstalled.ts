import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'
import { validateCadesPlugin } from '@utils/cadesPlugin/validateCadesPlugin'

export async function ensureCadesPluginInstalled() {
    try {
        await window.cadesplugin

        validateCadesPlugin(window.cadesplugin)

        await window.cadesplugin.CreateObjectAsync('CAdESCOM.Store')
    } catch (err) {
        if (err instanceof CadesPluginError) {
            throw err
        }

        const errorMessage = err instanceof Error ? window.cadesplugin.getLastError?.(err) ?? String(err) : String(err)
        throw new CadesPluginError(errorMessage, CadesPluginError.INITIALIZATION_FAILED)
    }
}
