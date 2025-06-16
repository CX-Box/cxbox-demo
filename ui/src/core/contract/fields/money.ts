import { FieldMeta } from './common'

export interface MoneyFieldMeta extends FieldMeta {
    type: 'money'
    digits?: number
    nullable?: boolean
}

export function isFieldMoney(meta: FieldMeta): meta is MoneyFieldMeta {
    return meta.type === 'money'
}
