import { WidgetMeta } from './common'
import { FieldBlock, FormFieldMeta } from '../fields'

export interface FormWidgetMeta extends WidgetMeta {
    type: 'Form'
    fields: Array<FieldBlock<FormFieldMeta> | FormFieldMeta>
}

export function isWidgetForm(meta: WidgetMeta): meta is FormWidgetMeta {
    return meta.type === 'Form'
}
