import { interfaces, WidgetTypes } from '@cxbox-ui/core'
import { FileUploadFieldMeta as CoreFileUploadFieldMeta, WidgetField as CoreWidgetField } from '@cxbox-ui/schema'
import { TableSettingsItem } from '@interfaces/tableSettings'

export enum CustomFieldTypes {
    MultipleSelect = 'multipleSelect',
    Time = 'time',
    SuggestionPickList = 'suggestionPickList'
}

export enum CustomWidgetTypes {
    FormPopup = 'FormPopup',
    Steps = 'Steps',
    Funnel = 'Funnel',
    RingProgress = 'RingProgress',
    DashboardList = 'DashboardList',
    AdditionalInfo = 'AdditionalInfo',
    SuggestionPickList = 'SuggestionPickList',
    StatsBlock = 'StatsBlock',
    GroupingHierarchy = 'GroupingHierarchy'
}

export const removeRecordOperationWidgets: Array<interfaces.WidgetTypes | string> = [
    WidgetTypes.List,
    CustomWidgetTypes.GroupingHierarchy,
    WidgetTypes.PickListPopup
]

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

export type OperationCustomMode = 'default' | 'file-upload-dnd' | 'default-and-file-upload-dnd'

export type OperationInfo = {
    actionKey: string
    fieldKey?: string
    mode?: OperationCustomMode | string
}

export interface AppWidgetMeta extends interfaces.WidgetMeta {
    personalFields?: TableSettingsItem | null // TODO make mandatory
    options?: interfaces.WidgetOptions & {
        title?: {
            bgColor?: string
        }

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

        additional?: {
            enabled: boolean
            fields: string[]
        }

        filterSetting?: {
            enabled: boolean
        }

        stats?: {
            valueFieldKey?: string
            titleFieldKey?: string
            iconFieldKey?: string
            descriptionFieldKey?: string
        }
        buttons?: OperationInfo[]
        pagination?: {
            hideLimitOptions?: boolean
            availableLimitsList?: number[]
            type?: 'nextAndPreviousWihHasNext' | 'nextAndPreviousSmart' | 'nextAndPreviousWithCount'
        }
        groupingHierarchy?: {
            fields: string[]
        }
    }
}

export interface AppWidgetTableMeta extends interfaces.WidgetTableMeta {
    options?: AppWidgetMeta['options']
}

export interface AppWidgetGroupingHierarchyMeta extends Omit<AppWidgetTableMeta, 'type'> {
    type: CustomWidgetTypes.GroupingHierarchy
    options?: AppWidgetTableMeta['options']
}

export interface WidgetFormPopupMeta extends Omit<interfaces.WidgetFormMeta, 'type'> {
    type: CustomWidgetTypes.FormPopup
}

export interface SuggestionPickListWidgetMeta extends interfaces.WidgetMeta {
    type: CustomWidgetTypes.SuggestionPickList
    fields: Array<{
        title: string
        key: string
    }>
}

export interface SuggestionPickListField extends Omit<interfaces.PickListFieldMeta, 'type'> {
    type: CustomFieldTypes.SuggestionPickList
}

export type FileUploadFieldMeta = CoreFileUploadFieldMeta & {
    preview?: {
        /**
         * Enables file previews. Default false.
         */
        enabled: boolean
        /**
         * Key whose value is used for the popup title. If not specified, the file name is taken
         */
        titleKey?: string
        /**
         * The key whose value is used for the tooltip under the popup title. If not specified, the additional attribute is not shown.
         */
        hintKey?: string
        /**
         * Preview display mode: popup (default), side-panel.
         */
        mode?: 'popup' | 'side-panel'
        /**
         * Includes display of mini-previews for file types for which we can, for the rest there are icons with an eye.
         * The default is false (icons with an eye are shown for all files).
         * Where the value will come from is decided at the project level.
         */
        miniPreview?: boolean
    }
}

export type WidgetField = CoreWidgetField | FileUploadFieldMeta
