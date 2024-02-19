// TODO удалить когда поправят экспорт интерфейсов. этот файл для удобства миграции
import { interfaces } from '@cxbox-ui/core'

export type { WidgetFormField, LayoutRow } from '@cxbox-ui/schema'

export const {
    PopupWidgetTypes,
    isOperationGroup,
    isWidgetFieldBlock,
    isCustomWidget,
    isViewNavigationGroup,
    isViewNavigationItem,
    isCustomWidgetConfiguration
} = interfaces

export enum RouteType {
    screen = 'screen',
    default = 'default',
    router = 'router',
    invalid = 'invalid',
    unknown = 'unknown'
}

export enum FilterType {
    /**
     * Transforms into combination of 'greaterOrEqualThan' and 'lessOrEqualThan' (See src/utils/filters.ts)
     */
    range = 'range',
    equals = 'equals',
    greaterThan = 'greaterThan',
    lessThan = 'lessThan',
    greaterOrEqualThan = 'greaterOrEqualThan',
    lessOrEqualThan = 'lessOrEqualThan',
    contains = 'contains',
    specified = 'specified',
    specifiedBooleanSql = 'specifiedBooleanSql',
    equalsOneOf = 'equalsOneOf',
    containsOneOf = 'containsOneOf'
}

/**
 * Types of notification messages
 */
export enum AppNotificationType {
    success = 'success',
    info = 'info',
    warning = 'warning',
    error = 'error'
}

/**
 * A type of message shown to user before operation fires
 */
export enum OperationPreInvokeType {
    /**
     * Pop-up message contains "Yes/No" answers.
     * If user says "Yes" then operation fires
     */
    confirm = 'confirm',
    /**
     * Pop-up message contains some informational text with info icon
     */
    info = 'info',
    /**
     * Pop-up message contains some information about error with error icon
     * Перед операцией пользователя будет показано всплывающее сообщение
     * с иконкой ошибки и операция не будет выполнена (TODO: Будет или не будет? Проверить)
     */
    error = 'error'
}

/**
 * A type of action which fires after user's operation
 */
export enum OperationPostInvokeType {
    /**
     * BC's refresh. It leads to cursor dropping, data.ts refresh of current BC and its children
     */
    refreshBC = 'refreshBC',
    /**
     * File downloading by `fileId` which comes from  answer to user's operation.
     * Вызов сохранения файла в браузере по пришедшему в ответе fileId
     */
    downloadFile = 'downloadFile',
    /**
     * File downloading by `url` which comes from  answer to user's operation.
     * Вызов сохранения файла в браузере по пришедшему в ответе url
     */
    downloadFileByUrl = 'downloadFileByUrl',
    /**
     * Calling a browser transition to some record
     */
    drillDown = 'drillDown',
    /**
     * `Pick list` widget opening
     */
    openPickList = 'openPickList',
    /**
     * @deprecated TODO: Не работает, удалить все упоминания из Досье и убрать всех свидетелей
     *
     */
    // delayedRefreshBC = 'delayedRefreshBC',
    /**
     * Showing pop-up message
     */
    showMessage = 'showMessage',
    /**
     * Инициировать удаление записей
     *
     * @deprecated TODO: Remove in 2.0.0
     */
    postDelete = 'postDelete'
}

/**
 * The type of message that will be shown to the user for confirmation
 */
export enum OperationPostInvokeConfirmType {
    /**
     * Simple confirmation
     */
    confirm = 'confirm',
    /**
     * Сonfirmation with text from the user
     */
    confirmText = 'confirmText'
}

export enum PendingValidationFailsFormat {
    old = 'old',
    target = 'target'
}

export enum ApplicationErrorType {
    BusinessError,
    SystemError,
    NetworkError
}

/**
 * Type of pagination, either page numbers or "Load More" button
 */
export enum PaginationMode {
    page = 'page',
    loadMore = 'loadMore'
}

export type BcMeta = interfaces.BcMeta
export type BcMetaState = interfaces.BcMetaState

export type DataValue = interfaces.DataValue
export type DataItem = interfaces.DataItem
export type MultivalueSingleValue = interfaces.MultivalueSingleValue
export type MultivalueSingleValueOptions = interfaces.MultivalueSingleValueOptions
export type RecordSnapshotState = interfaces.RecordSnapshotState
export type PendingDataItem = interfaces.PendingDataItem
export type DataItemResponse = interfaces.DataItemResponse
export type BcDataResponse = interfaces.BcDataResponse
export type DataState = interfaces.DataState
export type DepthDataState = interfaces.DepthDataState
export type PickMap = interfaces.PickMap

export type SystemNotification = interfaces.SystemNotification
export type CxboxResponse = interfaces.CxboxResponse

export interface Route extends interfaces.Route {}

export interface ScreenMetaResponse extends interfaces.ScreenMetaResponse {}
export interface ScreenState extends interfaces.ScreenState {}

/**
 * Type of core middlewares
 */
export type CoreMiddlewares = interfaces.CoreMiddlewares

/**
 * Custom middleware interface
 */
export interface CustomMiddleware extends interfaces.CustomMiddleware {}

/**
 * List the names of all core middlewares
 */
export type CoreMiddlewareType = interfaces.CoreMiddlewareType

/**
 * Descriptor of custom middleware not presented in core middlewares
 */
export type NewMiddlewareDescriptor = interfaces.NewMiddlewareDescriptor

/**
 * Form a dictionary of override descriptors for those middleware
 */
export type CoreMiddlewareOverrideDescriptors = interfaces.CoreMiddlewareOverrideDescriptors
/**
 * Type of custom middlewares
 */
export type CustomMiddlewares = interfaces.CustomMiddlewares

export interface UserRole extends interfaces.UserRole {
    type: string
    key: string
    value: string
    description: string
    language: string
    displayOrder: number
    active: boolean
    cacheLoaderName: string
}

export type DefaultNotificationType = interfaces.DefaultNotificationType

export interface Notification extends interfaces.Notification {}

export type NotificationKeys = interfaces.NotificationKeys

export interface Session extends interfaces.Session {}

export interface LoginResponse extends interfaces.LoginResponse {}

export interface SessionScreen extends interfaces.SessionScreen {}

export interface PendingRequest extends interfaces.PendingRequest {}

export { FieldType } from '@cxbox-ui/schema'

export interface ViewSelectedCell extends interfaces.ViewSelectedCell {}

export interface PendingValidationFails extends interfaces.PendingValidationFails {}

export interface ViewState extends interfaces.ViewState {}

export interface ViewMetaResponse extends interfaces.ViewMetaResponse {}

export type PopupType = interfaces.PopupType

export interface PopupData extends interfaces.PopupData {}

export type ApplicationError = interfaces.ApplicationError

export interface ApplicationErrorBase extends interfaces.ApplicationErrorBase {
    type: ApplicationErrorType
    code?: number
}

export interface BusinessError extends interfaces.BusinessError {}

export interface SystemError extends interfaces.SystemError {}

export interface NetworkError extends interfaces.NetworkError {}

export interface WidgetInfoOptions extends interfaces.WidgetInfoOptions {}

export interface WidgetMeta extends interfaces.WidgetMeta {}

export type WidgetFieldsOrBlocks<T> = interfaces.WidgetFieldsOrBlocks<T>

export interface WidgetFormMeta extends interfaces.WidgetFormMeta {}

export interface WidgetTableMeta extends interfaces.WidgetTableMeta {}

export interface WidgetInfoMeta extends interfaces.WidgetInfoMeta {}

export interface WidgetTextMeta extends interfaces.WidgetTextMeta {}

export interface NavigationOptions extends interfaces.NavigationOptions {}

export interface NavigationWidgetMeta extends interfaces.NavigationWidgetMeta {}

export type WidgetMetaAny = interfaces.WidgetMetaAny

export type CustomWidget = interfaces.CustomWidget

export interface CustomWidgetConfiguration extends interfaces.CustomWidgetConfiguration {}

export type CustomWidgetDescriptor = interfaces.CustomWidgetDescriptor

export interface Operation extends interfaces.Operation {}

export interface OperationGroup extends interfaces.OperationGroup {}

export interface OperationPreInvoke extends interfaces.OperationPreInvoke {}

export interface OperationPostInvokeConfirm extends interfaces.OperationPostInvokeConfirm {}

export interface OperationModalInvokeConfirm extends interfaces.OperationModalInvokeConfirm {}

export interface OperationPostInvoke extends interfaces.OperationPostInvoke {}

export interface OperationPostInvokeRefreshBc extends interfaces.OperationPostInvokeRefreshBc {}

export interface OperationPostInvokeDownloadFile extends interfaces.OperationPostInvokeDownloadFile {}

export interface OperationPostInvokeDownloadFileByUrl extends interfaces.OperationPostInvokeDownloadFileByUrl {}

export interface OperationPostInvokeDrillDown extends interfaces.OperationPostInvokeDrillDown {}

export interface OperationPostInvokeOpenPickList extends interfaces.OperationPostInvokeOpenPickList {}

export interface OperationPostInvokeShowMessage extends interfaces.OperationPostInvokeShowMessage {}

export type OperationPostInvokeAny = interfaces.OperationPostInvokeAny

export type OperationScope = interfaces.OperationScope

export interface AssociatedItem extends interfaces.AssociatedItem {}

export interface OperationError extends interfaces.OperationError {}

export interface OperationErrorEntity extends interfaces.OperationErrorEntity {}

export type RequestType = interfaces.RequestType

export interface RowMeta extends interfaces.RowMeta {}

export interface RowMetaResponse extends interfaces.RowMetaResponse {}

export interface RowMetaField extends interfaces.RowMetaField {}

export interface BcFilter extends interfaces.BcFilter {}

export interface BcSorter extends interfaces.BcSorter {}

export interface FilterGroup extends interfaces.FilterGroup {}

export type NavigationLevel = interfaces.NavigationLevel

export interface NavigationTab extends interfaces.NavigationTab {}
