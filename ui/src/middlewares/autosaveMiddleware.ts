import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'
import { WidgetOperations } from '@cxbox-ui/schema'
import { actions } from '@actions'
import { coreOperations, OperationTypeCrud } from '@cxbox-ui/core'
import { RootState } from '@store'
import { autosaveRoutine, checkUnsavedChangesOfBc } from '@utils/autosave'
import { openNotification, UNSAVED_NOTIFICATION_COMMON } from './utils/openNotification'

export const saveFormMiddleware: Middleware =
    ({ getState, dispatch }: MiddlewareAPI<Dispatch, RootState>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        const state = getState()
        const isSendOperation = actions.sendOperation.match(action)
        const isCoreSendOperation = isSendOperation && coreOperations.includes(action.payload.operationType as OperationTypeCrud)
        const isChangeActiveBc = actions.changeActiveBc.match(action)
        const isChangeLocation = actions.changeLocation.match(action)

        if (isChangeActiveBc || isChangeLocation || isSendOperation) {
            const bcNameWithChanges = getBcNameWithChanges(state)
            const defaultSaveWidget = getWidgetWithDefaultSave(state, bcNameWithChanges)
            const previousActiveBc = state.screen.bo.activeBcName
            const needAutoSaveForChangeActiveBc = isChangeActiveBc && bcNameWithChanges && previousActiveBc !== action.payload?.bcName
            const needAutoSaveForChangeLocation = isChangeLocation && bcNameWithChanges
            const changeActiveBcForOperation = isSendOperation && bcNameWithChanges && previousActiveBc !== action.payload?.bcName

            // Before calling the operation, make the active bc on which this operation is being performed
            if (changeActiveBcForOperation) {
                dispatch(actions.changeActiveBc({ bcName: action.payload.bcName, onSuccessAction: action }))

                return next(actions.EMPTY)
            }

            // Autosave
            if (needAutoSaveForChangeLocation || needAutoSaveForChangeActiveBc) {
                if (defaultSaveWidget) {
                    return next(
                        actions.sendOperation({
                            bcName: defaultSaveWidget.bcName,
                            operationType: (defaultSaveWidget.options?.actionGroups as WidgetOperations).defaultSave as string,
                            widgetName: defaultSaveWidget.name,
                            onSuccessAction: action
                        })
                    )
                } else {
                    openNotification({
                        ...UNSAVED_NOTIFICATION_COMMON,
                        onOk: () =>
                            next(
                                actions.sendOperation({
                                    bcName: bcNameWithChanges,
                                    operationType: OperationTypeCrud.save,
                                    widgetName: state.view.widgets.find(widget => widget.bcName === bcNameWithChanges)?.name ?? '',
                                    onSuccessAction: action
                                })
                            )
                    })

                    return next(actions.EMPTY)
                }
            }
        }

        const isSelectTableCellInit = actions.selectTableCellInit.match(action)

        /**
         * Saving actions should be ignored
         */
        const isSaveAction = isSendOperation && action.payload.operationType === OperationTypeCrud.save
        const isNotSaveAction = !isSaveAction

        /**
         * Checking if the action is `actions.sendOperation` of core type which called for another BC
         * Also BCs having pending `_associate` should be ignored
         */
        const actionBcName = isSendOperation && action.payload.bcName
        const hasAnotherUnsavedBc =
            Object.keys(state.view.pendingDataChanges)
                .filter(key => key !== actionBcName)
                .filter(key => checkUnsavedChangesOfBc(state, key)).length > 0
        const isSendOperationForAnotherBc = isCoreSendOperation && hasAnotherUnsavedBc

        /**
         * Checking if the action is `actions.selectTableCellInit` called for another row or another widget
         */
        const selectedCell = state.view.selectedCell
        const isSelectTableCellInitOnAnotherRowOrWidget =
            selectedCell &&
            isSelectTableCellInit &&
            (selectedCell.widgetName !== action.payload.widgetName || selectedCell.rowId !== action.payload.rowId)

        /**
         * final condition
         */
        const isNeedSaveCondition = isNotSaveAction && (isSendOperationForAnotherBc || isSelectTableCellInitOnAnotherRowOrWidget)
        const isPopup = state.view.popupData?.bcName === (action as AnyAction).payload?.bcName

        const wasForcedUpdateForPopup = isNeedSaveCondition && isPopup && (action as AnyAction).payload?.wasForcedUpdate
        /**
         * Default save operation CRUD
         */
        if (isNeedSaveCondition && !wasForcedUpdateForPopup) {
            return autosaveRoutine(action, { getState, dispatch }, next, isPopup && isSendOperationForAnotherBc)
        }

        return next(action)
    }

const getBcNameWithChanges = (state: RootState) => {
    const pendingDataChanges = state.view?.pendingDataChanges

    return Object.keys(pendingDataChanges ?? {}).find(
        bcName => Object.values(Object.values(pendingDataChanges?.[bcName] ?? {})?.find(changes => changes) ?? {}).length > 0
    )
}

const getWidgetWithDefaultSave = (state: RootState, bcName?: string) => {
    return state.view.widgets?.find(widget => widget.bcName === bcName && widget?.options?.actionGroups?.defaultSave)
}
