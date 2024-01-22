import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './assets'

export function initLocale(lang: 'ru' | 'en' | string) {
    i18n.use(initReactI18next).init({
        resources: resources,
        lng: lang,
        keySeparator: false,
        interpolation: {
            escapeValue: false
        }
    })
}
