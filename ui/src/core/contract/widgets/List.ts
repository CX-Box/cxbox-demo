import { WidgetMeta } from './common'
import { ListFieldMeta } from '../fields'
import { ListWidgetOptions } from './common/options.ts'

export interface ListWidgetMeta extends WidgetMeta {
    type: 'List'
    fields: ListFieldMeta[]
    options: ListWidgetOptions
}

export function isWidgetList(meta: WidgetMeta): meta is ListWidgetMeta {
    return meta.type === 'List'
}
