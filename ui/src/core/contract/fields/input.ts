import { FieldMeta } from './common'

export interface InputFieldMeta extends FieldMeta {
    type: 'input'
}

export function isFieldInput(meta: FieldMeta): meta is InputFieldMeta {
    return meta.type === 'input'
}
