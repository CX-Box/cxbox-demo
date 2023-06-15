import { WidgetMeta, WidgetTypes, WidgetOptions } from '@cxbox-ui/core/interfaces/widget'

export enum CustomFieldTypes {
    MultipleSelect = 'multipleSelect'
}

export enum CustomWidgetTypes {
    Steps = 'Steps',
    Funnel = 'Funnel',
    RingProgress = 'RingProgress',
    DashboardList = 'DashboardList'
}

export const removeRecordOperationWidgets: Array<WidgetTypes | string> = [WidgetTypes.List]

export interface StepsWidgetMeta extends WidgetMeta {
    type: CustomWidgetTypes.Steps
    options: WidgetOptions & {
        stepsOptions: {
            stepsDictionaryKey: string
        }
    }
}

export interface FunnelWidgetMeta extends WidgetMeta {
    type: CustomWidgetTypes.Funnel
    options: WidgetOptions & { funnelOptions: { dataKey: string } }
}

export interface RingProgressWidgetMeta extends WidgetMeta {
    type: CustomWidgetTypes.RingProgress
    options: WidgetOptions & { ringProgressOptions: { text: string; numberField: string; descriptionField: string; percentField: string } }
}

type InternalWidgetOption = {
    widget: string
    style: 'inlineForm' | 'popup' | 'inline' | 'none'
}

export interface AppWidgetMeta extends WidgetMeta {
    options?: WidgetOptions & {
        create?: InternalWidgetOption
        edit?: InternalWidgetOption
    }
}
