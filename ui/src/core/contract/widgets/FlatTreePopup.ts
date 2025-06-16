import { WidgetOptions, WidgetMeta } from './common'
import { ListFieldMeta } from '../fields'

interface FlatTreeWidgetOptions extends WidgetOptions {
    /**
     * Allow selecting multiple items for FlatListPopup
     *
     * TODO: Move to separate interface
     */
    multiple?: boolean
}

export interface FlatTreePopupWidgetMeta extends WidgetMeta {
    type: 'FlatTreePopup'
    fields: ListFieldMeta[]
    options: FlatTreeWidgetOptions
}

export function isWidgetFlatTreePopup(meta: WidgetMeta): meta is FlatTreePopupWidgetMeta {
    return meta.type === 'FlatTreePopup'
}
