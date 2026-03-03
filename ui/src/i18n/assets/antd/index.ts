import { Locale } from 'antd/es/locale-provider'
import { SupportedLanguage } from '../../constants'
import enUs from 'antd/es/locale-provider/en_US'
import ruRu from 'antd/es/locale-provider/ru_RU'
import frFr from 'antd/es/locale-provider/fr_FR'

export default { en: enUs, ru: ruRu, fr: frFr } as Record<SupportedLanguage, Locale>
