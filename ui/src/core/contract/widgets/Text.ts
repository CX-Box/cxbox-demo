import { WidgetMeta } from './common'
import { FieldMeta } from '../fields'

export interface TextWidgetMeta extends WidgetMeta {
    type: 'Text'
    /**
     * Text to display
     */
    description: string
    /**
     * Title text
     */
    descriptionTitle: string
    fields: FieldMeta[]
}

export function isWidgetText(meta: WidgetMeta): meta is TextWidgetMeta {
    return meta.type === 'Text'
}
