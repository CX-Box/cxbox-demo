import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { RootState } from '@store'
import { AppWidgetMeta, FileUploadFieldMeta, InternalWidgetOption } from '@interfaces/widget'
import { actions, partialUpdateRecordForm, resetRecordForm, setRecordForm } from '@actions'
import { isAnyOf, Middleware } from '@reduxjs/toolkit'
import { OperationTypeCrud, PendingDataItem } from '@cxbox-ui/core'
import { selectors } from '@selectors'
import { showUnsavedNotification } from './internalFormWidgetMiddleware.utils'
import { selectBcData, selectWidget, selectWidgetByCondition } from '@selectors/selectors'
import { getInnerWidgetOptions } from '@hooks/useInternalWidgetSelector'
import { FieldType } from '@cxbox-ui/schema'

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

        const isActivePopupWidget = state.view.popupData?.options?.type === 'file-viewer'

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
        // Disable form editing when closing a popup
        if (actions.closeViewPopup.match(action) && state.view.popupData?.bcName === bcRecordForm?.bcName) {
            dispatch(resetRecordForm({ bcName: bcRecordForm?.bcName as string }))

            return next(action)
        }

        // Enable internal form when opening popup
        if (actions.showFileViewerPopup.match(action)) {
            const calleeWidget = selectWidget(state, action.payload.calleeWidgetName)
            const currentDataItem = selectBcData(state, calleeWidget?.bcName)?.find(
                dataItem => dataItem.id === selectBc(state, calleeWidget?.bcName as string)?.cursor
            )
            const isCreate = currentDataItem?.vstamp === -1
            const innerWidgetType = isCreate ? 'create' : 'edit'

            const innerPopupWidget =
                getInnerWidgetOptions(calleeWidget, innerWidgetType)?.widget &&
                getInnerWidgetOptions(calleeWidget, innerWidgetType)?.style === 'popup'
                    ? selectWidget(state, getInnerWidgetOptions(calleeWidget, innerWidgetType)?.widget)
                    : undefined

            const innerWidgetBc = selectBc(state, innerPopupWidget?.bcName)

            if (innerPopupWidget && innerWidgetBc?.cursor) {
                const currentDataItem = selectBcData(state, innerWidgetBc?.name)?.find(dataItem => dataItem.id === innerWidgetBc?.cursor)
                const isCreate = currentDataItem?.vstamp === -1

                dispatch(
                    setRecordForm({
                        widgetName: innerPopupWidget.name,
                        cursor: innerWidgetBc?.cursor,
                        bcName: innerPopupWidget.bcName,
                        active: true,
                        create: isCreate
                    })
                )
            }

            return next(action)
        }

        if (
            actions.bcChangePage.match(action) &&
            actionIsRelatedToRecordForm &&
            previousRecordHasPendingDataChanges &&
            bcRecordForm?.active
        ) {
            const cancelCallback = () => {
                if (bcRecordForm?.create) {
                    cancelCreate()
                } else {
                    previousRecordHasPendingDataChanges && cancelPendingChanges(action.payload?.bcName)
                    isSelectRecordWithOpenedForm && !isActivePopupWidget && next(resetRecordForm({ bcName: action.payload?.bcName }))
                    next(action)
                }
            }

            if (previousRecordHasPendingDataChanges) {
                showUnsavedNotification(() => saveCallback(), cancelCallback)
            } else {
                cancelCallback()
            }

            return next(actions.emptyAction(action))
        }
        const bcNameFromChangeCursorsAction = actions.bcChangeCursors.match(action) ? Object.keys(action.payload.cursorsMap)[0] : undefined
        const bcRecordFormForChangeCursors = selectBcRecordForm(state, bcNameFromChangeCursorsAction)
        if (
            isActivePopupWidget &&
            bcNameFromChangeCursorsAction &&
            bcRecordFormForChangeCursors?.cursor &&
            action.payload?.cursorsMap?.[bcNameFromChangeCursorsAction] &&
            bcRecordFormForChangeCursors?.cursor !== action.payload?.cursorsMap?.[bcNameFromChangeCursorsAction]
        ) {
            dispatch(
                actions.partialUpdateRecordForm({
                    bcName: bcNameFromChangeCursorsAction,
                    cursor: action.payload?.cursorsMap[bcNameFromChangeCursorsAction as string]
                })
            )

            return next(action)
        }

        if (isSelectRecordWithOpenedForm || isChangeActiveRecordForm) {
            const currentDataItem = selectBcData(state, bcRecordForm?.bcName)?.find(dataItem => dataItem.id === action.payload?.cursor)
            const isCreate = currentDataItem?.vstamp === -1
            const popupData = state.view.popupData
            const innerWidgetType = isCreate ? 'create' : 'edit'
            const externalWidgetWithInnerFormPopup = selectWidgetByCondition(
                state,
                widget =>
                    !!(
                        popupData?.calleeWidgetName === widget.name &&
                        getInnerWidgetOptions(widget, innerWidgetType)?.widget &&
                        getInnerWidgetOptions(widget, innerWidgetType)?.style === 'popup'
                    )
            )
            const innerPopupWidget = selectWidget(state, getInnerWidgetOptions(externalWidgetWithInnerFormPopup, innerWidgetType)?.widget)

            const cancelCallback = () => {
                if (bcRecordForm?.create) {
                    cancelCreate()
                } else {
                    previousRecordHasPendingDataChanges && cancelPendingChanges(action.payload?.bcName)

                    isSelectRecordWithOpenedForm && !isActivePopupWidget && next(resetRecordForm({ bcName: action.payload?.bcName }))
                    next(action)
                    isSelectRecordWithOpenedForm &&
                        isSelectRecordWithOpenedForm &&
                        innerPopupWidget &&
                        dispatch(
                            actions.setRecordForm({
                                cursor: action.payload?.cursor,
                                widgetName: innerPopupWidget.name,
                                bcName: innerPopupWidget.bcName,
                                active: true,
                                create: isCreate
                            })
                        )
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

            // before: Opening file viewer popup
            const widgetWithInternalPopupWidgetCreate = getWidgetWithInternalWidgetCreateByBcName(
                state.view.widgets as AppWidgetMeta[],
                action.payload.bcName,
                'popup'
            )

            if (widgetWithInternalPopupWidgetCreate) {
                const cardOptions = widgetWithInternalPopupWidgetCreate?.options?.card
                const widgetField = (widgetWithInternalPopupWidgetCreate?.fields as FileUploadFieldMeta[])?.find(field =>
                    cardOptions?.valueFieldKey ? cardOptions?.valueFieldKey === field.key : field.type === FieldType.fileUpload
                )

                dispatch(
                    actions.showFileViewerPopup({
                        active: true,
                        options: {
                            bcName: action.payload?.bcName,
                            type: 'file-viewer',
                            calleeFieldKey: widgetField?.key as string
                        },
                        calleeWidgetName: widgetWithInternalPopupWidgetCreate?.name as string
                    })
                )
            }
            // after: Opening file viewer popup

            return next(EMPTY_ACTION)
        }

        const operationOnRecordFormIsComplete =
            isAnyOf(actions.bcSaveDataSuccess, actions.bcNewDataFail, actions.sendOperationSuccess)(action) && actionIsRelatedToRecordForm
        // reset record form after a form-related operation is complete
        if (operationOnRecordFormIsComplete) {
            next(action)

            return !isActivePopupWidget ? next(resetRecordForm({ bcName: action.payload?.bcName })) : next(actions.emptyAction())
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

function getWidgetWithInternalWidgetCreateForAction(widgets: AppWidgetMeta[], action: AnyAction, type?: InternalWidgetOption['style']) {
    return widgets.find(
        item =>
            item.name === action.payload.widgetName &&
            item.options?.create?.widget &&
            (!type || type === (item.options?.create?.style ?? 'inlineForm'))
    )
}

function getWidgetWithInternalWidgetCreateByBcName(widgets: AppWidgetMeta[], bcName: string, type?: InternalWidgetOption['style']) {
    return widgets.find(
        item => item.bcName === bcName && item.options?.create?.widget && (!type || type === (item.options?.create?.style ?? 'inlineForm'))
    )
}

function hasPendingDataChanges(pendingDataChanges: PendingDataItem | undefined) {
    return pendingDataChanges ? !!Object.keys(pendingDataChanges).length : false
}
