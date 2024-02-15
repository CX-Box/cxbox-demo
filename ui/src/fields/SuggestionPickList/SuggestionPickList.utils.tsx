import { SuggestionPickListDataItem } from '../../interfaces/data'
import { SuggestionPickListWidgetMeta } from '../../interfaces/widget'

export function createDataItemFrom(pickMap: Record<string, string>, data: SuggestionPickListDataItem) {
    return Object.entries(pickMap).reduce((acc: Record<string, any>, [proposalNewKey, proposalOldKey]) => {
        acc[proposalNewKey] = data[proposalOldKey]

        return acc
    }, {})
}

export function createContentList(fieldWidget: SuggestionPickListWidgetMeta, option: SuggestionPickListDataItem) {
    return fieldWidget?.fields?.map(field => {
        const label = field.title ? `${field.title}: ` : ''
        const value = option[field.key]

        return `${label}${value}`
    })
}
