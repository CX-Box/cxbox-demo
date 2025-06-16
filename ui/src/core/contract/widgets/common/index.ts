import { DataValue } from '../../data.ts'
import { WidgetOptions } from './options.ts'
import { FieldBaseRecord } from '../../fields'

export interface WidgetMeta {
    type: string
    name: string
    title: string // отображаемое название,
    bcName: string
    position: number
    limit?: number
    gridWidth: number // 1-24
    showCondition?: WidgetShowCondition
    description?: string // description for documentation
    fields: FieldBaseRecord[]
    options: WidgetOptions
}

export interface WidgetShowCondition {
    bcName: string
    isDefault: boolean
    params: {
        fieldKey: string
        value: DataValue
    }
}

export type { WidgetOptions } from './options.ts'
