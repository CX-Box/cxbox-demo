import { FieldMeta } from './common'

export interface TextFieldMeta extends FieldMeta {
    type: 'text'
    popover?: boolean
}

export function isFieldText(meta: FieldMeta): meta is TextFieldMeta {
    return meta.type === 'text'
}
