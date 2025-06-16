import { WidgetOptions, WidgetMeta } from './common'
import { ListFieldMeta } from '../fields'

interface StatsBlockWidgetOptions extends WidgetOptions {
    stats?: {
        valueFieldKey?: string
        titleFieldKey?: string
        iconFieldKey?: string
        descriptionFieldKey?: string
    }
}

export interface StatsBlockWidgetMeta extends WidgetMeta {
    type: 'StatsBlock'
    fields: ListFieldMeta[]
    options: StatsBlockWidgetOptions
}

export function isWidgetStatsBlock(meta: WidgetMeta): meta is StatsBlockWidgetMeta {
    return meta.type === 'StatsBlock'
}
