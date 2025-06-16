import { WidgetMeta } from './common'
import { FieldMeta } from '../fields'

export interface HeaderWidgetMeta extends WidgetMeta {
    type: 'HeaderWidget'
    fields: FieldMeta[]
}

export function isWidgetHeader(meta: WidgetMeta): meta is HeaderWidgetMeta {
    return meta.type === 'HeaderWidget'
}
