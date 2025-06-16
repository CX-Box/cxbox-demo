import { FieldMeta } from './common'

export interface MultivalueHoverFieldMeta extends FieldMeta {
    type: 'multivalueHover'
    popupBcName?: string
    assocValueKey?: string
    associateFieldKey?: string
    displayedKey?: string
}

export function isFieldMultivalueHover(meta: FieldMeta): meta is MultivalueHoverFieldMeta {
    return meta.type === 'multivalueHover'
}
