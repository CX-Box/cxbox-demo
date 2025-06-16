import { FieldMeta } from './common'

export interface PercentFieldMeta extends FieldMeta {
    type: 'percent'
    digits?: number
    nullable?: boolean
}

export function isFieldPercent(meta: FieldMeta): meta is PercentFieldMeta {
    return meta.type === 'percent'
}
