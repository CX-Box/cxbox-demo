import { WidgetMeta } from './common'
import { FieldMeta } from '../fields'

export interface DimFilterWidgetMeta extends WidgetMeta {
    type: 'DimFilter'
    fields: FieldMeta[]
}

export function isWidgetDimFilter(meta: WidgetMeta): meta is DimFilterWidgetMeta {
    return meta.type === 'DimFilter'
}
