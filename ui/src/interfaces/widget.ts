import { interfaces } from '@cxbox-ui/core'

export enum CustomFieldTypes {
    MultipleSelect = 'multipleSelect',
    Time = 'time'
}

export enum CustomWidgetTypes {
    FormPopup = 'FormPopup',
    Steps = 'Steps',
    Funnel = 'Funnel',
    RingProgress = 'RingProgress',
    DashboardList = 'DashboardList',
    AdditionalInfo = 'AdditionalInfo'
}

export const removeRecordOperationWidgets: Array<interfaces.WidgetTypes | string> = [interfaces.WidgetTypes.List]

export interface StepsWidgetMeta extends interfaces.WidgetMeta {
    type: CustomWidgetTypes.Steps
    options: interfaces.WidgetOptions & {
        stepsOptions: {
            stepsDictionaryKey: string
        }
    }
}

export interface FunnelWidgetMeta extends interfaces.WidgetMeta {
    type: CustomWidgetTypes.Funnel
    options: interfaces.WidgetOptions & { funnelOptions: { dataKey: string } }
}

export interface RingProgressWidgetMeta extends interfaces.WidgetMeta {
    type: CustomWidgetTypes.RingProgress
    options: interfaces.WidgetOptions & {
        ringProgressOptions: { text: string; numberField: string; descriptionField: string; percentField: string }
    }
}

export type TableWidgetField = interfaces.WidgetListFieldBase & {
    /**
     * Width (px) to be set for the field when exporting to Excel
     */
    excelWidth?: number
}

type InternalWidgetOption = {
    widget: string
    style: 'inlineForm' | 'popup' | 'inline' | 'none'
}

export interface AppWidgetMeta extends interfaces.WidgetMeta {
    options?: interfaces.WidgetOptions & {
        primary?: {
            enabled: boolean
            title?: string
        }

        create?: InternalWidgetOption
        edit?: InternalWidgetOption

        export?: {
            // Part of the file name, by default taken from the widget title
            title?: string
            enabled: boolean
        }

        fullTextSearch?: {
            enabled?: boolean
            placeholder?: string
        }
    }
}

export interface AppWidgetTableMeta extends interfaces.WidgetTableMeta {
    options?: AppWidgetMeta['options']
}

export interface WidgetFormPopupMeta extends Omit<interfaces.WidgetFormMeta, 'type'> {
    type: CustomWidgetTypes.FormPopup
}
