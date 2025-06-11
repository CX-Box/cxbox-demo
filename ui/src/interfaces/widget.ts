import { EAggFunction } from '@constants/aggregation'
import {
    DictionaryFieldMeta,
    NumberFieldMeta,
    PickListFieldMeta,
    WidgetFormMeta,
    WidgetInfoMeta,
    WidgetListFieldBase,
    WidgetMeta,
    WidgetOptions,
    WidgetTableMeta,
    WidgetTypes
} from '@cxbox-ui/core'
import { FileUploadFieldMeta as CoreFileUploadFieldMeta, WidgetField as CoreWidgetField } from '@cxbox-ui/schema'
import { TableSettingsItem } from '@interfaces/tableSettings'
import { IAggField, IAggLevel } from '@interfaces/groupingHierarchy'
import { PaginationMode } from '@constants/pagination'

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
    AdditionalList = 'AdditionalList',
    SuggestionPickList = 'SuggestionPickList',
    StatsBlock = 'StatsBlock',
    GroupingHierarchy = 'GroupingHierarchy',
    Pie1D = 'Pie1D',
    Column2D = 'Column2D',
    Line2D = 'Line2D',
    DualAxes2D = 'DualAxes2D'
}

export const removeRecordOperationWidgets: Array<WidgetTypes | string> = [
    WidgetTypes.List,
    CustomWidgetTypes.GroupingHierarchy,
    WidgetTypes.PickListPopup,
    WidgetTypes.AssocListPopup
]

export interface StepsWidgetMeta extends WidgetMeta {
    type: CustomWidgetTypes.Steps
    options: WidgetOptions & {
        stepsOptions: {
            stepsDictionaryKey: string
            descriptionFieldKey?: string
        }
    }
}

export interface FunnelWidgetMeta extends WidgetMeta {
    type: CustomWidgetTypes.Funnel
    options: WidgetOptions & { funnelOptions: { dataKey: string } }
}

export interface RingProgressWidgetMeta extends WidgetMeta {
    type: CustomWidgetTypes.RingProgress
    options: WidgetOptions & {
        ringProgressOptions: { text: string; numberField: string; descriptionField: string; percentField: string }
    }
}

export type TableWidgetField = WidgetListFieldBase & {
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

export interface AppWidgetMeta extends WidgetMeta {
    personalFields?: TableSettingsItem | null // TODO make mandatory
    options?: WidgetOptions & {
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
            enabled?: boolean
            hideLimitOptions?: boolean
            availableLimitsList?: number[]
            type?: PaginationMode
        }
        groupingHierarchy?: {
            counterMode?: 'none' | 'always' | 'collapsed'
            fields: string[]
            aggFields?: IAggField[]
            aggLevels?: IAggLevel[]
        }
        read?: {
            widget: string
        }
        dual2D?: Dual2DConfig
    }
}

export interface AppWidgetTableMeta extends WidgetTableMeta {
    options?: AppWidgetMeta['options']
}

export interface AppWidgetGroupingHierarchyMeta extends Omit<AppWidgetTableMeta, 'type'> {
    type: CustomWidgetTypes.GroupingHierarchy
    options?: AppWidgetTableMeta['options']
}

export interface WidgetFormPopupMeta extends Omit<WidgetFormMeta, 'type'> {
    type: CustomWidgetTypes.FormPopup
}

export interface SuggestionPickListWidgetMeta extends WidgetMeta {
    type: CustomWidgetTypes.SuggestionPickList
    fields: Array<{
        title: string
        key: string
    }>
}

export interface SuggestionPickListField extends Omit<PickListFieldMeta, 'type'> {
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

export type AppNumberFieldMeta = NumberFieldMeta & {
    currency?: string
}

export const enum EDictionaryMode {
    default = 'default',
    icon = 'icon'
}

export type AppDictionaryFieldMeta = DictionaryFieldMeta & {
    mode?: EDictionaryMode
}

export const enum ETitleMode {
    left = 'left',
    top = 'top'
}

export interface AppWidgetInfoMeta extends WidgetInfoMeta {
    options?: WidgetInfoMeta['options'] & {
        layout?: WidgetOptions['layout'] & {
            titleMode?: ETitleMode
        }
    }
}

export interface AdditionalInfoWidgetMeta extends Omit<WidgetInfoMeta, 'type'> {
    type: string
}

export interface AdditionalListWidgetMeta extends AppWidgetMeta {}

export interface Chart1DConfig {
    valueFieldKey: string
    valuePosition?: 'inner' | 'outer'
    titleFieldKey?: string
    iconFieldKey?: string
    descriptionFieldKey?: string[]
    total?: {
        value?: string
        innerSpace?: number
        func?: EAggFunction
        argFieldKeys?: string[]
        description?: string
    }
}

export interface Pie1DWidgetMeta extends Omit<AppWidgetTableMeta, 'type'> {
    type: CustomWidgetTypes.Pie1D
    options: AppWidgetMeta['options'] & {
        chart1D: Chart1DConfig
    }
}

export interface Chart2DConfig {
    xValueFieldKey: string
    xMax?: number
    xMin?: number
    xStep?: number
    yValueFieldKey: string
    yMax?: number
    yMin?: number
    yStep?: number
    groupFieldKey?: string
    stack?: boolean
    descriptionFieldKey?: string[]
}

export interface Chart2DWidgetMeta extends Omit<AppWidgetTableMeta, 'type'> {
    type: CustomWidgetTypes.Column2D | CustomWidgetTypes.Line2D
    options: AppWidgetMeta['options'] & {
        chart2D: Chart2DConfig
    }
}

export interface Dual2DConfig {
    widgets: string[]
}

export interface DualAxes2DWidgetMeta extends Omit<AppWidgetTableMeta, 'type'> {
    type: CustomWidgetTypes.DualAxes2D
}
