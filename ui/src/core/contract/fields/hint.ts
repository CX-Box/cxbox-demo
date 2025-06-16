import { FieldMeta } from './common'

export interface HintFieldMeta extends FieldMeta {
    type: 'hint'
}

export function isFieldHint(meta: FieldMeta): meta is HintFieldMeta {
    return meta.type === 'hint'
}
