import { WidgetOptions, WidgetMeta } from './common'
import { FieldMeta } from '../fields'

interface RingProgressMetaOptions extends WidgetOptions {
    ringProgressOptions: {
        text: string
        numberField: string
        descriptionField: string
        percentField: string
    }
}

export interface RingProgressWidgetMeta extends WidgetMeta {
    type: 'RingProgress'
    fields: FieldMeta[]
    options: RingProgressMetaOptions
}

export function isWidgetRingProgress(meta: WidgetMeta): meta is RingProgressWidgetMeta {
    return meta.type === 'RingProgress'
}
