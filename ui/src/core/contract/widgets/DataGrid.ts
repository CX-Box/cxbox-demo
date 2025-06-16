import { WidgetMeta } from './common'
import { ListFieldMeta } from '../fields'

export interface DataGridWidgetMeta extends WidgetMeta {
    type: 'DataGrid'
    fields: ListFieldMeta[]
}

export function isWidgetDataGrid(meta: WidgetMeta): meta is DataGridWidgetMeta {
    return meta.type === 'DataGrid'
}
