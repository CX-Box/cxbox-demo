import { WidgetMeta } from './common'

export interface SuggestionPickListWidgetMeta extends WidgetMeta {
    type: 'SuggestionPickList'
    fields: Array<{
        title: string
        key: string
    }>
}

export function isWidgetSuggestionPickList(meta: WidgetMeta): meta is SuggestionPickListWidgetMeta {
    return meta.type === 'SuggestionPickList'
}
