import { describe, expect, it } from 'vitest'
import en from '../../i18n/assets/local/en.json'
import fr from '../../i18n/assets/local/fr.json'
import ru from '../../i18n/assets/local/ru.json'
import { CADES_ERROR_I18N_HINT_KEYS, CADES_ERROR_I18N_KEYS, CADES_ERROR_I18N_KEYS_NO_DATE } from './errors'

const keys = [
    ...Object.values(CADES_ERROR_I18N_KEYS),
    ...Object.values(CADES_ERROR_I18N_KEYS_NO_DATE),
    ...Object.values(CADES_ERROR_I18N_HINT_KEYS)
]

// a notification title of a CryptoPro error fits one or two lines; the advice goes to the hint
const MAX_TITLE_LENGTH = 70

describe('error messages', () => {
    it.each([
        ['en', en],
        ['ru', ru],
        ['fr', fr]
    ])('every error code has a %s translation', (_, dictionary) => {
        const translation = (dictionary as { translation: Record<string, string> }).translation
        expect(keys.filter(key => !translation[key])).toEqual([])
    })

    it.each([
        ['en', en],
        ['ru', ru],
        ['fr', fr]
    ])('%s titles are short', (_, dictionary) => {
        const translation = (dictionary as { translation: Record<string, string> }).translation
        const titles = [...Object.values(CADES_ERROR_I18N_KEYS), ...Object.values(CADES_ERROR_I18N_KEYS_NO_DATE)]
        expect(titles.map(key => translation[key]).filter(title => title.length > MAX_TITLE_LENGTH)).toEqual([])
    })
})
