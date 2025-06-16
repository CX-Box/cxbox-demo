import { FieldMeta } from './common'

/**
 * @deprecated TODO: Remove in 2.0.0 in favor of `hidden` flag of widget meta fields description
 */
export interface HiddenFieldMeta extends FieldMeta {
    type: 'hidden'
}

export function isFieldHidden(meta: FieldMeta): meta is HiddenFieldMeta {
    return meta.type === 'hidden'
}
