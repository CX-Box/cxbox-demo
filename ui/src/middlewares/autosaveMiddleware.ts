import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'
import { WidgetOperations } from '@cxbox-ui/schema'
import { actions } from '@actions'
import { coreOperations, OperationTypeCrud } from '@cxbox-ui/core'
import { RootState } from '@store'
import { autosaveRoutine, checkUnsavedChangesOfBc } from '@utils/autosave'

export const saveFormMiddleware: Middleware =
    ({ getState, dispatch }: MiddlewareAPI<Dispatch, RootState>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        const state = getState()

        // TODO: Should offer to save pending changes or drop them

        const isSendOperation = actions.sendOperation.match(action)
        const isCoreSendOperation = isSendOperation && coreOperations.includes(action.payload.operationType as OperationTypeCrud)
        const isSelectTableRowInit = actions.selectTableRowInit.match(action)

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
        const selectedRow = state.view.selectedRow
        const isSelectTableRowInitOnAnotherRowOrWidget =
            selectedRow &&
            isSelectTableRowInit &&
            (selectedRow.widgetName !== action.payload.widgetName || selectedRow.rowId !== action.payload.rowId)

        /**
         * Default save operation as custom action
         *
         * If widget have only custom actions, `defaultSave` option mean witch action
         * must be executed as save record.
         * Current actions.changeLocation action as onSuccessAction
         */
        const defaultSaveWidget = state.view.widgets?.find(item => item?.options?.actionGroups?.defaultSave)
        const defaultCursor = state.screen.bo.bc?.[defaultSaveWidget?.bcName as string]?.cursor
        const pendingData = state.view?.pendingDataChanges?.[defaultSaveWidget?.bcName as string]?.[defaultCursor as string]
        const isChangeLocation = defaultSaveWidget && actions.changeLocation.match(action) && Object.keys(pendingData || {}).length > 0
        if (isChangeLocation) {
            return next(
                actions.sendOperation({
                    bcName: defaultSaveWidget.bcName,
                    operationType: (defaultSaveWidget.options?.actionGroups as WidgetOperations).defaultSave as string,
                    widgetName: defaultSaveWidget.name,
                    onSuccessAction: action
                })
            )
        }

        /**
         * final condition
         */
        const isNeedSaveCondition = isNotSaveAction && (isSendOperationForAnotherBc || isSelectTableRowInitOnAnotherRowOrWidget)
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
