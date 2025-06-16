import { FieldMeta } from './common'

export interface DictionaryFieldMeta extends FieldMeta {
    type: 'dictionary'
    multiple?: boolean
    dictionaryName?: string
}

export function isFieldDictionary(meta: FieldMeta): meta is DictionaryFieldMeta {
    return meta.type === 'dictionary'
}
