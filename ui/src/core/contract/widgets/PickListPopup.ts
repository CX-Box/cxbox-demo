import { WidgetMeta } from './common'
import { ListFieldMeta } from '../fields'
import { ListWidgetOptions } from './common/options.ts'

export interface PickListPopupWidgetMeta extends WidgetMeta {
    type: 'PickListPopup'
    fields: ListFieldMeta[]
    options: ListWidgetOptions
}

export function isWidgetPickListPopup(meta: WidgetMeta): meta is PickListPopupWidgetMeta {
    return meta.type === 'PickListPopup'
}
