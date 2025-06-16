import { WidgetOptions, WidgetMeta } from './common'
import { FieldMeta } from '../fields'

interface StepsOptions extends WidgetOptions {
    stepsOptions: {
        stepsDictionaryKey: string
    }
}

export interface StepsWidgetMeta extends WidgetMeta {
    type: 'Steps'
    fields: FieldMeta[]
    options: StepsOptions
}

export function isWidgetSteps(meta: WidgetMeta): meta is StepsWidgetMeta {
    return meta.type === 'Steps'
}
