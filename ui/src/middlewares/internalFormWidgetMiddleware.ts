import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { RootState } from '@store'
import { AppWidgetMeta } from '@interfaces/widget'
import { actions, partialUpdateRecordForm, resetRecordForm, setRecordForm } from '@actions'
import { isAnyOf, Middleware } from '@reduxjs/toolkit'
import { OperationTypeCrud, PendingDataItem } from '@cxbox-ui/core'
import { selectors } from '@selectors'
import { showUnsavedNotification } from './internalFormWidgetMiddleware.utils'

const { selectBcRecordPendingDataChanges, selectBcRecordForm, selectBc } = selectors

export const internalFormWidgetMiddleware: Middleware =
    ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, RootState>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        const EMPTY_ACTION = actions.emptyAction()
        const state = getState()

        const bcRecordForm = selectBcRecordForm(state, action.payload?.bcName)
        const previousCursor = selectBc(state, action.payload?.bcName)?.cursor

        const previousPendingDataChanges = selectBcRecordPendingDataChanges(state, action.payload?.bcName, previousCursor)
        const previousRecordHasPendingDataChanges = hasPendingDataChanges(previousPendingDataChanges)
        const actionIsRelatedToRecordForm = action.payload?.bcName === bcRecordForm?.bcName
        const isSelectRecordWithOpenedForm =
            actions.bcSelectRecord.match(action) &&
            actionIsRelatedToRecordForm &&
            bcRecordForm?.cursor !== action.payload?.cursor &&
            bcRecordForm?.active
        const isChangeActiveRecordForm = setRecordForm.match(action) && action.payload?.cursor !== bcRecordForm?.cursor

        const saveCallback = () => {
            dispatch(
                actions.sendOperation({
                    bcName: action.payload?.bcName,
                    operationType: OperationTypeCrud.save,
                    widgetName: bcRecordForm?.widgetName ?? '',
                    onSuccessAction: action
                })
            )
        }

        const cancelPendingChanges = (bcName: string | undefined) => {
            if (bcName) {
                dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
                dispatch(actions.clearValidationFails(null))
            }
        }

        const cancelCreate = () => {
            return next(
                actions.sendOperation({
                    bcName: action.payload?.bcName,
                    operationType: OperationTypeCrud.cancelCreate,
                    widgetName: bcRecordForm?.widgetName ?? ''
                })
            )
        }

        if (isSelectRecordWithOpenedForm || isChangeActiveRecordForm) {
            const cancelCallback = () => {
                if (bcRecordForm?.create) {
                    cancelCreate()
                } else {
                    previousRecordHasPendingDataChanges && cancelPendingChanges(action.payload?.bcName)

                    isSelectRecordWithOpenedForm && next(resetRecordForm({ bcName: action.payload?.bcName }))
                    next(action)
                    isChangeActiveRecordForm &&
                        dispatch(
                            actions.bcSelectRecord({
                                bcName: action.payload?.bcName,
                                cursor: action.payload?.cursor
                            })
                        )
                }
            }

            if (previousRecordHasPendingDataChanges) {
                showUnsavedNotification(saveCallback, cancelCallback)
            } else {
                cancelCallback()
            }

            return next(EMPTY_ACTION)
        }

        const isCreateOperation = actions.sendOperation.match(action) && action.payload.operationType === OperationTypeCrud.create
        const widgetWithInternalWidgetCreate = isCreateOperation
            ? getWidgetWithInternalWidgetCreateForAction(state.view.widgets as AppWidgetMeta[], action)
            : undefined

        if (isCreateOperation && widgetWithInternalWidgetCreate) {
            const cancelCallback = () => {
                previousRecordHasPendingDataChanges && cancelPendingChanges(action.payload?.bcName)
                // add data to track the completion of the creation action
                dispatch(
                    partialUpdateRecordForm({
                        widgetName: (widgetWithInternalWidgetCreate as AppWidgetMeta).options?.create?.widget,
                        bcName: widgetWithInternalWidgetCreate.bcName // the bcName of the external widget and the internal form widget should be the same
                    })
                )

                return next(action)
            }
            if (previousRecordHasPendingDataChanges) {
                showUnsavedNotification(saveCallback, cancelCallback)

                return next(EMPTY_ACTION)
            } else {
                return cancelCallback()
            }
        }

        const isSuccessfulCreateForInternalWidget = actions.bcNewDataSuccess.match(action) && actionIsRelatedToRecordForm

        if (isSuccessfulCreateForInternalWidget) {
            next(action)
            // set record form after successful create operation
            dispatch(
                setRecordForm({
                    widgetName: bcRecordForm?.widgetName ?? '',
                    bcName: action.payload?.bcName,
                    cursor: action.payload.dataItem.id,
                    active: true,
                    create: true
                })
            )

            return next(EMPTY_ACTION)
        }

        const operationOnRecordFormIsComplete =
            isAnyOf(actions.bcSaveDataSuccess, actions.bcNewDataFail, actions.sendOperationSuccess)(action) && actionIsRelatedToRecordForm
        // reset record form after a form-related operation is complete
        if (operationOnRecordFormIsComplete) {
            next(action)

            return next(resetRecordForm({ bcName: action.payload?.bcName }))
        }

        const currentPendingDataChanges = selectBcRecordPendingDataChanges(state, action.payload?.bcName, bcRecordForm?.cursor)
        const currentRecordHasPendingDataChanges = hasPendingDataChanges(currentPendingDataChanges)

        if (resetRecordForm.match(action) && currentRecordHasPendingDataChanges) {
            showUnsavedNotification(saveCallback, () => {
                if (bcRecordForm?.create) {
                    cancelCreate()
                } else {
                    cancelPendingChanges(action.payload?.bcName)
                    next(action)
                }
            })

            return next(EMPTY_ACTION)
        }

        return next(action)
    }

function getWidgetWithInternalWidgetCreateForAction(widgets: AppWidgetMeta[], action: AnyAction) {
    return widgets.find(item => item.name === action.payload.widgetName && item.options?.create?.widget)
}

function hasPendingDataChanges(pendingDataChanges: PendingDataItem | undefined) {
    return pendingDataChanges ? !!Object.keys(pendingDataChanges).length : false
}
