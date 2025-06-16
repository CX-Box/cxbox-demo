import { FieldMeta } from './common'

export interface NumberFieldMeta extends FieldMeta {
    type: 'number'
    digits?: number
    nullable?: boolean
}

export function isFieldNumber(meta: FieldMeta): meta is NumberFieldMeta {
    return meta.type === 'number'
}
