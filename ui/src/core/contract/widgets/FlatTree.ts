import { WidgetMeta } from './common'
import { FieldMeta } from '../fields'

export interface FlatTreeWidgetMeta extends WidgetMeta {
    type: 'FlatTree'
    fields: FieldMeta[]
}

export function isWidgetFlatTree(meta: WidgetMeta): meta is FlatTreeWidgetMeta {
    return meta.type === 'FlatTree'
}
