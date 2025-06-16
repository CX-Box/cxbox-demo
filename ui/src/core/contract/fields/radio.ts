import { FieldMeta } from './common'

export interface RadioFieldMeta extends FieldMeta {
    type: 'radio'
}

export function isFieldRadio(meta: FieldMeta): meta is RadioFieldMeta {
    return meta.type === 'radio'
}
