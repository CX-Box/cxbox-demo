import { validateCadesPlugin } from '@utils/cadesPlugin/validateCadesPlugin'

export const getCadesPlugin = () => {
    validateCadesPlugin(window.cadesplugin)

    return window.cadesplugin
}
