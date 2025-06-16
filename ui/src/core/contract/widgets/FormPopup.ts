import { WidgetMeta } from './common'
import { FieldBlock, FormFieldMeta } from '../fields'

export interface FormPopupWidgetMeta extends WidgetMeta {
    type: 'FormPopup'
    fields: Array<FieldBlock<FormFieldMeta> | FormFieldMeta>
}

export function isWidgetFormPopup(meta: WidgetMeta): meta is FormPopupWidgetMeta {
    return meta.type === 'FormPopup'
}
