import { Lookup, LookupValueOf } from '@utils/Lookup'

export const SUPPORTED_LANGUAGE = Lookup.create(['ru', 'en', 'fr'])

export type SupportedLanguage = LookupValueOf<typeof SUPPORTED_LANGUAGE>

export type AnyLanguage = SupportedLanguage | string

export const defaultLocale = SUPPORTED_LANGUAGE.en
