import { AnyAction, createAction } from '@reduxjs/toolkit'
import { actions, interfaces } from '@cxbox-ui/core'
import { OperationPreInvokeCustom } from '@interfaces/operation'
import { NotificationState } from '@interfaces/notification'
import { LoginResponse } from '@interfaces/session'
import { TableSettingsItem, TableSettingsList, TableSettingsMap } from '@interfaces/tableSettings'
import { FilterGroup } from '@interfaces/filters'
import { FileViewerPopupOptions } from '@interfaces/view'
import { DataItem } from '@cxbox-ui/core'

export const SSO_AUTH = createAction('SSO_AUTH')

/**
 * Declare your redux actions here with action name and payload type
 *
 */
export const changeMenuCollapsed = createAction<boolean>('changeMenuCollapsed')

/**
 * An example of action and payload declaration
 */
export const customAction = createAction<{ customMessage: string }>('customAction')

/**
 * You can expand payload of internal cxbox-ui actions:
 */
export const showViewPopup = createAction<
    ReturnType<typeof actions.showViewPopup>['payload'] & {
        options?: { operation?: ReturnType<typeof processPreInvoke>['payload']; calleeFieldKey?: string }
    }
>('showViewPopup')

export const showFileViewerPopup = createAction<{
    active: boolean
    calleeWidgetName: string
    options: FileViewerPopupOptions
}>('showFileViewerPopup')

/**
 * Set the number of records for BC
 */
export const setBcCount = createAction<{
    count: number
    bcName: string
}>('setBcCount')

export const setRecordForm = createAction<{
    widgetName: string
    bcName: string
    cursor: string
    active: boolean
    create: boolean
}>('setRecordForm')

export const partialUpdateRecordForm = createAction<{
    widgetName?: string
    bcName: string
    cursor?: string
    active?: boolean
    create?: boolean
}>('partialUpdateRecordForm')

export const resetRecordForm = createAction<{ bcName?: string } | undefined>('resetRecordForm')

export const processPreInvoke = createAction<
    Omit<ReturnType<typeof actions.processPreInvoke>['payload'], 'preInvoke'> & {
        preInvoke: OperationPreInvokeCustom | interfaces.OperationPreInvoke
    }
>('processPreInvoke')

export const loginDone = createAction<LoginResponse>('loginDone')

export const changeNotification = createAction<Partial<NotificationState>>('changeNotification')

export const initTableSettings = createAction<{ rawSettings: TableSettingsList | TableSettingsMap }>('initTableSettings')

export const changeTableSettings = createAction<
    Pick<TableSettingsItem, 'view' | 'widget'> & Partial<Omit<TableSettingsItem, 'view' | 'widget'>>
>('changeTableSettings')

export const resetTableSettings = createAction<Pick<TableSettingsItem, 'view' | 'widget'>>('resetTableSettings')

export const updateIdForFilterGroup = createAction<{ name: string; bc: string; id: string }>('updateIdForFilterGroup')

export const addFilterGroup = createAction<FilterGroup & { bc: string }>('addFilterGroup')

export const removeFilterGroup = createAction<{ name: string; bc: string; id?: string }>('removeFilterGroup')

export const changePageLimit = createAction<{ bcName: string; limit: number }>('changePageLimit')
/**
 * sortedGroupKeys - responsible for sorting fields after updating a record for GroupingHierarchy widget
 */
export const bcSaveDataSuccess = createAction<ReturnType<typeof actions.bcSaveDataSuccess>['payload'] & { sortedGroupKeys?: string[] }>(
    'bcSaveDataSuccess'
)
/**
 * sortedGroupKeys - responsible for sorting fields after updating a record for GroupingHierarchy widget
 */
export const sendOperationSuccess = createAction<
    ReturnType<typeof actions.sendOperationSuccess>['payload'] & {
        dataItem?: interfaces.DataItem
        sortedGroupKeys?: string[]
        // needed to save data without reloading the page when bulk loading a file for group hierarchies
        newDataItems?: interfaces.DataItem[]
    }
>('sendOperationSuccess')

export const updateBcData = createAction<{ bcName: string; data: DataItem[] }>('updateBcData')

export const forceUpdateRowMeta = createAction<{ bcName: string; cursor?: string; onSuccessAction?: AnyAction; wasForcedUpdate?: boolean }>(
    'forceUpdateRowMeta'
)

export const setCollapsedWidgets = createAction<{ viewName: string; widgetNameGroup: string[] }>('setCollapsedWidgets')

export const drillDownInNewTab = createAction<{
    widgetName: string
    cursor: string
    fieldKey: string
    copyLink?: boolean
}>('drillDownInNewTab')

export const emptyAction = createAction<undefined | AnyAction>('emptyAction')
