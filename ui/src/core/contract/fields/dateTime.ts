import { FieldMeta } from './common'

export interface DateTimeFieldMeta extends FieldMeta {
    type: 'dateTime'
}

export function isFieldDateTime(meta: FieldMeta): meta is DateTimeFieldMeta {
    return meta.type === 'dateTime'
}
