import { FieldMeta } from './common'

export interface DateTimeWithSecondsFieldMeta extends FieldMeta {
    type: 'dateTimeWithSeconds'
}

export function isFieldDateTimeWithSeconds(meta: FieldMeta): meta is DateTimeWithSecondsFieldMeta {
    return meta.type === 'dateTimeWithSeconds'
}
