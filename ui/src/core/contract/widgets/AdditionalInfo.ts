import { WidgetMeta } from './common'
import { FieldMeta } from '../fields'

export interface AdditionalInfoWidgetMeta extends WidgetMeta {
    type: 'AdditionalInfo'
    fields: FieldMeta[]
}

export function isWidgetAdditionalInfo(meta: WidgetMeta): meta is AdditionalInfoWidgetMeta {
    return meta.type === 'AdditionalInfo'
}
