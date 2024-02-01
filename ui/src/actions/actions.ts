/**
 * This is a utility class for typing payload of redux actions
 */
import { createAction } from '@reduxjs/toolkit'
import { actions, interfaces } from '@cxbox-ui/core'
import { OperationPreInvokeCustom } from '@interfaces/operation'
import { NotificationState } from '@interfaces/notification'
import { LoginResponse } from '@interfaces/session'

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
        options?: { operation?: ReturnType<typeof processPreInvoke>['payload'] }
    }
>('showViewPopup')

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
    bcName?: string
    cursor?: string
    active?: boolean
    create?: boolean
}>('partialUpdateRecordForm')

export const resetRecordForm = createAction('resetRecordForm')

export const sendOperationSuccess = createAction<
    ReturnType<typeof actions.sendOperationSuccess>['payload'] & { dataItem?: interfaces.DataItem }
>('sendOperationSuccess')

export const processPreInvoke = createAction<
    Omit<ReturnType<typeof actions.processPreInvoke>['payload'], 'preInvoke'> & {
        preInvoke: OperationPreInvokeCustom | interfaces.OperationPreInvoke
    }
>('processPreInvoke')

export const loginDone = createAction<LoginResponse>('loginDone')

export const changeNotification = createAction<Partial<NotificationState>>('changeNotification')

export const changeBcFullTextFilter = createAction<{
    bcName: string
    fullTextFilterValue: string
}>('changeBcFullTextFilter')
