import { FieldMeta } from './common'

export interface MultivalueFieldMeta extends FieldMeta {
    type: 'multivalue'
    popupBcName?: string
    assocValueKey?: string
    associateFieldKey?: string
    displayedKey?: string
}

export function isFieldMultivalue(meta: FieldMeta): meta is MultivalueFieldMeta {
    return meta.type === 'multivalue'
}
