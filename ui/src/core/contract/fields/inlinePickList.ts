import { FieldMeta } from './common'

export interface InlinePickListFieldMeta extends FieldMeta {
    type: 'inline-pickList'
    searchSpec: string
    popupBcName: string
    pickMap: Record<string, string>
}

export function isFieldInlinePickList(meta: FieldMeta): meta is InlinePickListFieldMeta {
    return meta.type === 'inline-pickList'
}
