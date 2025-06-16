import { FieldMeta } from './common'

export interface TimeFieldMeta extends FieldMeta {
    type: 'time'
}

export function isFieldTime(meta: FieldMeta): meta is TimeFieldMeta {
    return meta.type === 'time'
}
