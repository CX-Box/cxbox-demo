import { isAsyncCadesPlugin } from '@utils/cadesPlugin/isAsyncCadesPlugin'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'

type Validator = {
    (plugin?: CADESPlugin): asserts plugin is CADESPluginAsync
}

export const validateCadesPlugin: Validator = (plugin = window.cadesplugin) => {
    if (!plugin || !isAsyncCadesPlugin(plugin as CADESPlugin)) {
        throw new CadesPluginError('Failed to initialize CryptoPro plugin: plugin is not loaded.', CadesPluginError.INITIALIZATION_FAILED)
    }
}
