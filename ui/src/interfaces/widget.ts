import { interfaces } from '@cxbox-ui/core'

export enum CustomFieldTypes {
    MultipleSelect = 'multipleSelect',
    DocumentPreview = 'documentPreview',
    Time = 'time',
    SuggestionPickList = 'suggestionPickList'
}

export enum CustomWidgetTypes {
    FormPopup = 'FormPopup',
    DocumentList = 'DocumentList',
    DocumentFormPopup = 'DocumentFormPopup',
    Steps = 'Steps',
    Funnel = 'Funnel',
    RingProgress = 'RingProgress',
    DashboardList = 'DashboardList',
    AdditionalInfo = 'AdditionalInfo',
    SuggestionPickList = 'SuggestionPickList',
    StatsBlock = 'StatsBlock'
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

export type DocumentPreviewType = 'base64' | 'dataUrl' | 'fileUrl' | 'generatedFileUrl'

export type DocumentPreviewFieldMeta = Omit<interfaces.WidgetFieldBase, 'type'> & {
    type: CustomFieldTypes.DocumentPreview
    previewType: DocumentPreviewType
    fieldKeyForContentType?: string
    fieldKeyForFileName?: string
}

type InternalWidgetOption = {
    widget: string
    style: 'inlineForm' | 'popup' | 'inline' | 'none'
}

export type DocumentPreviewBase64Option = {
    type: 'base64'
    fieldKeyForBase64: string
    fieldKeyForContentType: string
}

export type DocumentPreviewDataUrlOption = {
    type: 'dataUrl'
    fieldKeyForUrl: string
}

export type DocumentPreviewFileUrlOption = {
    type: 'fileUrl'
    fieldKeyForUrl: string
}

export type DocumentPreviewGeneratedFileUrlOption = {
    type: 'generatedFileUrl'
    fieldKeyForUrl: string
    fieldKeyForContentType: string
}

export type OperationCustomMode = 'default' | 'file-upload-dnd' | 'default-and-file-upload-dnd'

export type OperationInfo = {
    actionKey: string
    fieldKey?: string
    mode?: OperationCustomMode | string
}

export interface AppWidgetMeta extends interfaces.WidgetMeta {
    options?: interfaces.WidgetOptions & {
        documentPreview?: {
            type: string
            edit: {
                widget: string
            }
            enabledPdfViewer?: boolean
            fieldKeyForImageTitle?: string
            imageSizeOnList?: number
        } & (
            | DocumentPreviewBase64Option
            | DocumentPreviewDataUrlOption
            | DocumentPreviewFileUrlOption
            | DocumentPreviewGeneratedFileUrlOption
        )

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
            defaultLimit?: number
            hideLimitOptions?: boolean
            availableLimitsList?: number[]
        }
    }
}

export interface AppWidgetTableMeta extends interfaces.WidgetTableMeta {
    options?: AppWidgetMeta['options']
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
