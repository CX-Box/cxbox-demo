import { WidgetOptions, WidgetMeta } from './common'
import { ListFieldMeta } from '../fields'

export interface PivotWidgetMeta extends WidgetMeta {
    type: 'Pivot'
    fields: ListFieldMeta[]
    options: WidgetOptions
}

export function isWidgetPivot(meta: WidgetMeta): meta is PivotWidgetMeta {
    return meta.type === 'Pivot'
}
