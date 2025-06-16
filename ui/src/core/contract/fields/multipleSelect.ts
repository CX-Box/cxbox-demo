import { FieldMeta } from './common'

export interface MultipleSelectFieldMeta extends FieldMeta {
    type: 'multipleSelect'
}

export function isFieldMultipleSelect(meta: FieldMeta): meta is MultipleSelectFieldMeta {
    return meta.type === 'multipleSelect'
}
