import { WidgetMeta } from './common'
import { ListFieldMeta } from '../fields'

export interface AssocListPopupWidgetMeta extends WidgetMeta {
    type: 'AssocListPopup'
    fields: ListFieldMeta[]
}

export function isWidgetAssocListPopup(meta: WidgetMeta): meta is AssocListPopupWidgetMeta {
    return meta.type === 'AssocListPopup'
}
