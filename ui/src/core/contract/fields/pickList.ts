import { FieldMeta } from './common'

export interface PickListFieldMeta extends FieldMeta {
    type: 'pickList'
    popupBcName: string
    pickMap: Record<string, string>
}

export function isFieldPickList(meta: FieldMeta): meta is PickListFieldMeta {
    return meta.type === 'pickList'
}
