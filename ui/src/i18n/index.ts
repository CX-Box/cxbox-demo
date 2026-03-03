import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { AnyLanguage } from './constants'
import { localResources as resources } from './assets'

export function initLocale(lang: AnyLanguage) {
    i18n.use(initReactI18next).init({
        resources,
        lng: lang,
        keySeparator: false,
        interpolation: {
            escapeValue: false
        }
    })
}
