import { DataItem } from '@cxbox-ui/core'
import { AppWidgetTableMeta } from '@interfaces/widget'

export const getItemPropertyValue = (item: DataItem, meta: AppWidgetTableMeta, key: 'value' | 'icon' | 'description' | 'title' | 'tag') => {
    const statsKey = meta.options?.stats?.[`${key}FieldKey`]
    const field = meta.fields.find(field => field.key === statsKey)
    if (typeof statsKey === 'string' && field === undefined) {
        console.error(
            `widget fields does not contain "${statsKey}" that was referenced in options.stats.{value/title/icon/description/tag}FieldKey`
        )
        return
    }
    if (key === 'tag') {
        // The tag has no default field name, and 0 is a value of the tag.
        return field && item[field.key]
    }
    const result = field && item[field.key] ? item[field.key] : item[key]
    if (key === 'value' && result === undefined) {
        console.error(
            `widget with name ${meta.name} must define field with value for statistics. It must have "key" = "value" in fields block or its key must be explicitly ref in options.stats.valueFieldKey property`
        )
    }
    return result
}

export const getItemColor = (item: DataItem, meta: AppWidgetTableMeta) => {
    // The color of the tag field colors the tag only, not the card.
    const fields = meta.fields.filter(field => field.key !== meta.options?.stats?.tagFieldKey)
    const colorKey = fields.find(field => field.bgColorKey !== undefined)?.bgColorKey
    return colorKey ? (item[colorKey] as string) : fields.find(field => field.bgColor !== undefined)?.bgColor
}
