import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { AppState } from '../interfaces/storeSlices'
import { actionTypes } from '../interfaces/actions'
import { $do } from '../actions/types'
import { OperationTypeCrud } from '@cxbox-ui/core/interfaces/operation'
import { AppWidgetMeta } from '../interfaces/widget'
import { openNotification, OpenNotificationType } from './internalFormWidgetMiddleware.utils'

const TEXTS_FOR_UNSAVED_NOTIFICATION: Omit<OpenNotificationType, 'onOk' | 'onCancel'> = {
    okText: 'Save',
    cancelText: 'Cancel',
    message: 'There is unsaved data, save it ?',
    description: ''
}

export const internalFormWidgetMiddleware =
    ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, AppState>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        const state = getState()
        const recordForm = state.view.recordForm

        const selectBcRecordAfter = (action: AnyAction) => {
            next(action)

            const actionPayload = action.payload as { bcName: string; cursor: string }

            dispatch(
                $do.bcSelectRecord({
                    bcName: actionPayload.bcName,
                    cursor: actionPayload.cursor
                })
            )

            return { type: actionTypes.emptyAction }
        }

        const cancelCreate = (action: AnyAction) => {
            return next(
                $do.sendOperation({
                    bcName: action.payload.bcName,
                    operationType: OperationTypeCrud.cancelCreate,
                    widgetName: recordForm.widgetName
                })
            )
        }

        const resetRecordFormAfter = (action: AnyAction) => {
            next(action)

            return next($do.resetRecordForm(null))
        }

        const setRecordFormAfterCreateSuccess = (action: AnyAction) => {
            next(action)

            dispatch(
                $do.setRecordForm({
                    widgetName: recordForm.widgetName,
                    bcName: action.payload.bcName,
                    cursor: action.payload.dataItem.id,
                    active: true,
                    create: true
                })
            )

            return { type: actionTypes.emptyAction }
        }

        const partialUpdateRecordFormForActionSuccessfullyCreate = (
            action: AnyAction,
            internalBcName: string,
            internalWidgetName?: string
        ) => {
            dispatch(
                $do.partialUpdateRecordForm({
                    widgetName: internalWidgetName,
                    bcName: internalBcName
                })
            )

            return next(action)
        }

        const showNotificationBeforeCreatingWhenThereIsAnActiveEdit = (action: AnyAction) => {
            openNotification({
                ...TEXTS_FOR_UNSAVED_NOTIFICATION,
                onOk: () => {
                    dispatch(
                        $do.sendOperation({
                            bcName: action.payload.bcName,
                            operationType: OperationTypeCrud.save,
                            widgetName: recordForm.widgetName,
                            onSuccessAction: action
                        })
                    )
                },
                onCancel: () => {
                    dispatch($do.bcCancelPendingChanges(null as any))
                    dispatch($do.clearValidationFails(null))
                    next(action)
                }
            })

            return { type: actionTypes.emptyAction }
        }

        const showNotificationAtChangeActiveForm = (action: AnyAction) => {
            openNotification({
                ...TEXTS_FOR_UNSAVED_NOTIFICATION,
                onOk: () => {
                    dispatch(
                        $do.sendOperation({
                            bcName: action.payload.bcName,
                            operationType: OperationTypeCrud.save,
                            widgetName: recordForm.widgetName,
                            onSuccessAction: action
                        })
                    )
                },
                onCancel: () => {
                    dispatch($do.bcCancelPendingChanges(null as any))
                    dispatch($do.clearValidationFails(null))
                    next(action)
                    dispatch(
                        $do.bcSelectRecord({
                            bcName: action.payload.bcName,
                            cursor: action.payload.cursor
                        })
                    )
                }
            })

            return { type: actionTypes.emptyAction }
        }

        const showNotificationAtSimpleRecordChange = (action: AnyAction) => {
            openNotification({
                ...TEXTS_FOR_UNSAVED_NOTIFICATION,
                onOk: () => {
                    dispatch(
                        $do.sendOperation({
                            bcName: action.payload.bcName,
                            operationType: OperationTypeCrud.save,
                            widgetName: recordForm.widgetName,
                            onSuccessAction: action
                        })
                    )
                },
                onCancel: () => {
                    dispatch($do.bcCancelPendingChanges(null as any))
                    dispatch($do.clearValidationFails(null))
                    next($do.resetRecordForm(null))
                    next(action)
                }
            })

            return { type: actionTypes.emptyAction }
        }

        const showNotificationAtChangeRecordAfterCreate = (action: AnyAction) => {
            openNotification({
                ...TEXTS_FOR_UNSAVED_NOTIFICATION,
                onOk: () => {
                    dispatch(
                        $do.sendOperation({
                            bcName: action.payload.bcName,
                            operationType: OperationTypeCrud.save,
                            widgetName: recordForm.widgetName,
                            onSuccessAction: action
                        })
                    )
                },
                onCancel: () => {
                    next(
                        $do.sendOperation({
                            bcName: action.payload.bcName,
                            operationType: OperationTypeCrud.cancelCreate,
                            widgetName: recordForm.widgetName
                        })
                    )
                }
            })

            return { type: actionTypes.emptyAction }
        }

        const previousCursor = state.screen.bo.bc[action.payload?.bcName]?.cursor
        const previousPendingDataChanges = previousCursor
            ? state.view.pendingDataChanges?.[action.payload.bcName]?.[previousCursor]
            : undefined
        const isPreviousPendingDataChanges = previousPendingDataChanges ? !!Object.keys(previousPendingDataChanges).length : false
        const actionIsDependsOnRecordForm = action.payload?.bcName === recordForm.bcName
        const isSimpleChangeRecordForActiveRecordForm =
            action.type === actionTypes.bcSelectRecord &&
            actionIsDependsOnRecordForm &&
            recordForm.cursor !== action.payload.cursor &&
            recordForm.active
        const isChangeActiveRecordForm = action.type === actionTypes.setRecordForm && action.payload.cursor !== recordForm.cursor
        const actionListForRecordFormReset = [actionTypes.bcSaveDataSuccess, actionTypes.sendOperationSuccess, actionTypes.bcNewDataFail]

        // Logic for change cursor before
        if ((isSimpleChangeRecordForActiveRecordForm || isChangeActiveRecordForm) && recordForm.create && isPreviousPendingDataChanges) {
            return showNotificationAtChangeRecordAfterCreate(action)
        }

        if ((isSimpleChangeRecordForActiveRecordForm || isChangeActiveRecordForm) && recordForm.create && !isPreviousPendingDataChanges) {
            return cancelCreate(action)
        }

        if (isSimpleChangeRecordForActiveRecordForm && isPreviousPendingDataChanges) {
            return showNotificationAtSimpleRecordChange(action)
        }

        if (isSimpleChangeRecordForActiveRecordForm && !isPreviousPendingDataChanges) {
            return resetRecordFormAfter(action)
        }

        if (isChangeActiveRecordForm && isPreviousPendingDataChanges) {
            return showNotificationAtChangeActiveForm(action)
        }

        if (isChangeActiveRecordForm && !isPreviousPendingDataChanges) {
            return selectBcRecordAfter(action)
        }
        // Logic for change cursor after

        // Logic for create operation before
        const isCreateOperation = action.type === actionTypes.sendOperation && action.payload.operationType === OperationTypeCrud.create
        const widgetWithInternalWidgetCreate = isCreateOperation
            ? getWidgetWithInternalWidgetCreateForAction(state.view.widgets as AppWidgetMeta[], action)
            : undefined

        if (isCreateOperation && widgetWithInternalWidgetCreate && isPreviousPendingDataChanges) {
            return showNotificationBeforeCreatingWhenThereIsAnActiveEdit(action)
        }

        if (isCreateOperation && widgetWithInternalWidgetCreate && !isPreviousPendingDataChanges) {
            return partialUpdateRecordFormForActionSuccessfullyCreate(
                action,
                widgetWithInternalWidgetCreate.bcName, // the bcName of the external widget and the internal form widget should be the same
                (widgetWithInternalWidgetCreate as AppWidgetMeta).options?.create?.widget
            )
        }

        const isSuccessfulCreateForInternalWidget =
            action.type === actionTypes.bcNewDataSuccess && recordForm.widgetName && actionIsDependsOnRecordForm

        if (isSuccessfulCreateForInternalWidget) {
            return setRecordFormAfterCreateSuccess(action)
        }

        if (actionListForRecordFormReset.includes(action.type) && actionIsDependsOnRecordForm) {
            return resetRecordFormAfter(action)
        }
        // Logic for create operation after

        // Logic for closing the current record form before
        const currentCursor = recordForm.cursor
        const currentPendingDataChanges = currentCursor ? state.view.pendingDataChanges?.[recordForm.bcName]?.[currentCursor] : undefined
        const isCurrentPendingDataChanges = currentPendingDataChanges ? !!Object.keys(currentPendingDataChanges).length : false

        const showNotificationAtRecordClose = (action: AnyAction) => {
            openNotification({
                ...TEXTS_FOR_UNSAVED_NOTIFICATION,
                onOk: () => {
                    dispatch(
                        $do.sendOperation({
                            bcName: recordForm.bcName,
                            operationType: OperationTypeCrud.save,
                            widgetName: recordForm.widgetName,
                            onSuccessAction: action
                        })
                    )
                },
                onCancel: () => {
                    dispatch($do.bcCancelPendingChanges(null as any))
                    dispatch($do.clearValidationFails(null))
                    next(action)
                }
            })

            return { type: actionTypes.emptyAction }
        }

        if (action.type === actionTypes.resetRecordForm && isCurrentPendingDataChanges) {
            return showNotificationAtRecordClose(action)
        }
        // Logic for closing the current record form after

        return next(action)
    }

function getWidgetWithInternalWidgetCreateForAction(widgets: AppWidgetMeta[], action: AnyAction) {
    return widgets.find(item => item.name === action.payload.widgetName && item.options?.create?.widget)
}
