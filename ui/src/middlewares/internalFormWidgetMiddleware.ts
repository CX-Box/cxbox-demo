import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { RootState } from '@store'
import { actions, interfaces } from '@cxbox-ui/core'
import { AppWidgetMeta } from '@interfaces/widget'
import { openNotification, OpenNotificationType } from './internalFormWidgetMiddleware.utils'
import { partialUpdateRecordForm, resetRecordForm, setRecordForm } from '@actions'
import { Middleware } from '@reduxjs/toolkit'

const { OperationTypeCrud } = interfaces

const TEXTS_FOR_UNSAVED_NOTIFICATION: Omit<OpenNotificationType, 'onOk' | 'onCancel'> = {
    okText: 'Save',
    cancelText: 'Cancel',
    message: 'There is unsaved data, save it ?',
    description: ''
}

export const internalFormWidgetMiddleware: Middleware =
    ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, RootState>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        const state = getState()
        const recordForm = state.view.recordForm

        const selectBcRecordAfter = (action: AnyAction) => {
            next(action)

            const actionPayload = action.payload as { bcName: string; cursor: string }

            dispatch(
                actions.bcSelectRecord({
                    bcName: actionPayload.bcName,
                    cursor: actionPayload.cursor
                })
            )

            return next(actions.emptyAction())
        }

        const cancelCreate = (action: AnyAction) => {
            return next(
                actions.sendOperation({
                    bcName: action.payload.bcName,
                    operationType: OperationTypeCrud.cancelCreate,
                    widgetName: recordForm.widgetName
                })
            )
        }

        const resetRecordFormAfter = (action: AnyAction) => {
            next(action)

            return next(resetRecordForm())
        }

        const setRecordFormAfterCreateSuccess = (action: AnyAction) => {
            next(action)

            dispatch(
                setRecordForm({
                    widgetName: recordForm.widgetName,
                    bcName: action.payload.bcName,
                    cursor: action.payload.dataItem.id,
                    active: true,
                    create: true
                })
            )

            return next(actions.emptyAction())
        }

        const partialUpdateRecordFormForActionSuccessfullyCreate = (
            action: AnyAction,
            internalBcName: string,
            internalWidgetName?: string
        ) => {
            dispatch(
                partialUpdateRecordForm({
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
                        actions.sendOperation({
                            bcName: action.payload.bcName,
                            operationType: OperationTypeCrud.save,
                            widgetName: recordForm.widgetName,
                            onSuccessAction: action
                        })
                    )
                },
                onCancel: () => {
                    dispatch(actions.bcCancelPendingChanges(null as any))
                    dispatch(actions.clearValidationFails(null))
                    next(action)
                }
            })

            return next(actions.emptyAction())
        }

        const showNotificationAtChangeActiveForm = (action: AnyAction) => {
            openNotification({
                ...TEXTS_FOR_UNSAVED_NOTIFICATION,
                onOk: () => {
                    dispatch(
                        actions.sendOperation({
                            bcName: action.payload.bcName,
                            operationType: OperationTypeCrud.save,
                            widgetName: recordForm.widgetName,
                            onSuccessAction: action
                        })
                    )
                },
                onCancel: () => {
                    dispatch(actions.bcCancelPendingChanges(null as any))
                    dispatch(actions.clearValidationFails(null))
                    next(action)
                    dispatch(
                        actions.bcSelectRecord({
                            bcName: action.payload.bcName,
                            cursor: action.payload.cursor
                        })
                    )
                }
            })

            return next(actions.emptyAction())
        }

        const showNotificationAtSimpleRecordChange = (action: AnyAction) => {
            openNotification({
                ...TEXTS_FOR_UNSAVED_NOTIFICATION,
                onOk: () => {
                    dispatch(
                        actions.sendOperation({
                            bcName: action.payload.bcName,
                            operationType: OperationTypeCrud.save,
                            widgetName: recordForm.widgetName,
                            onSuccessAction: action
                        })
                    )
                },
                onCancel: () => {
                    dispatch(actions.bcCancelPendingChanges(null as any))
                    dispatch(actions.clearValidationFails(null))
                    next(resetRecordForm())
                    next(action)
                }
            })

            return next(actions.emptyAction())
        }

        const showNotificationAtChangeRecordAfterCreate = (action: AnyAction) => {
            openNotification({
                ...TEXTS_FOR_UNSAVED_NOTIFICATION,
                onOk: () => {
                    dispatch(
                        actions.sendOperation({
                            bcName: action.payload.bcName,
                            operationType: OperationTypeCrud.save,
                            widgetName: recordForm.widgetName,
                            onSuccessAction: action
                        })
                    )
                },
                onCancel: () => {
                    next(
                        actions.sendOperation({
                            bcName: action.payload.bcName,
                            operationType: OperationTypeCrud.cancelCreate,
                            widgetName: recordForm.widgetName
                        })
                    )
                }
            })

            return next(actions.emptyAction())
        }

        const previousCursor = state.screen.bo.bc[action.payload?.bcName]?.cursor
        const previousPendingDataChanges = previousCursor
            ? state.view.pendingDataChanges?.[action.payload.bcName]?.[previousCursor]
            : undefined
        const isPreviousPendingDataChanges = previousPendingDataChanges ? !!Object.keys(previousPendingDataChanges).length : false
        const actionIsDependsOnRecordForm = action.payload?.bcName === recordForm.bcName
        const isSimpleChangeRecordForActiveRecordForm =
            action.type === actions.bcSelectRecord.toString() &&
            actionIsDependsOnRecordForm &&
            recordForm.cursor !== action.payload.cursor &&
            recordForm.active
        const isChangeActiveRecordForm = action.type === setRecordForm.toString() && action.payload.cursor !== recordForm.cursor
        const actionListForRecordFormReset = [
            actions.bcSaveDataSuccess.toString(),
            actions.sendOperationSuccess.toString(),
            actions.bcNewDataFail.toString()
        ]

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
        const isCreateOperation =
            action.type === actions.sendOperation.toString() && action.payload.operationType === OperationTypeCrud.create
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
            action.type === actions.bcNewDataSuccess.toString() && recordForm.widgetName && actionIsDependsOnRecordForm

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
                        actions.sendOperation({
                            bcName: recordForm.bcName,
                            operationType: OperationTypeCrud.save,
                            widgetName: recordForm.widgetName,
                            onSuccessAction: action
                        })
                    )
                },
                onCancel: () => {
                    dispatch(actions.bcCancelPendingChanges(null as any))
                    dispatch(actions.clearValidationFails(null))
                    next(action)
                }
            })

            return next(actions.emptyAction())
        }

        if (action.type === resetRecordForm.toString() && isCurrentPendingDataChanges) {
            return showNotificationAtRecordClose(action)
        }
        // Logic for closing the current record form after

        return next(action)
    }

function getWidgetWithInternalWidgetCreateForAction(widgets: AppWidgetMeta[], action: AnyAction) {
    return widgets.find(item => item.name === action.payload.widgetName && item.options?.create?.widget)
}
