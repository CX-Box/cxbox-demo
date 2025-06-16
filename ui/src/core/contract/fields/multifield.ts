import { FieldMeta } from './common'

export interface MultiFieldMeta extends FieldMeta {
    type: 'multifield'
    fields: FieldMeta[]
    style: 'inline' | 'list'
}

export function isFieldMultiField(meta: FieldMeta): meta is MultiFieldMeta {
    return meta.type === 'multifield'
}
