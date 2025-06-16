import { FieldMeta } from './common'

export interface SuggestionPickListFieldMeta extends FieldMeta {
    type: 'suggestionPickList'
}

export function isFieldSuggestionPickList(meta: FieldMeta): meta is SuggestionPickListFieldMeta {
    return meta.type === 'suggestionPickList'
}
