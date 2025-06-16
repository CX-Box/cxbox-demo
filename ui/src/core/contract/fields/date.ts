import { FieldMeta } from './common'

export interface DateFieldMeta extends FieldMeta {
    type: 'date'
}

export function isFieldDate(meta: FieldMeta): meta is DateFieldMeta {
    return meta.type === 'date'
}
