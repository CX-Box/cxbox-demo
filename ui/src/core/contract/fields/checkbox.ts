import { FieldMeta } from './common'

export interface CheckboxFieldMeta extends FieldMeta {
    type: 'checkbox'
}

export function isFieldCheckbox(meta: FieldMeta): meta is CheckboxFieldMeta {
    return meta.type === 'checkbox'
}
