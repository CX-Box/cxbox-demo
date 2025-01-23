import { AnyAction } from 'redux'
import { actions } from '@actions'
import { coreOperations, OperationTypeCrud } from '@cxbox-ui/core'
import { RootState } from '@store'
import { checkUnsavedChangesOfBc } from '@utils/autosave'

const isSendOperation = (action: AnyAction) => actions.sendOperation.match(action)
const isCoreSendOperation = (action: AnyAction) => {
    return isSendOperation(action) && coreOperations.includes(action.payload.operationType)
}
const isSelectTableRowInit = (action: AnyAction) => actions.selectTableRowInit.match(action)
const isSaveOperation = (action: AnyAction) => isSendOperation(action) && action.payload.operationType === OperationTypeCrud.save

export const isChangeLocation = (action: AnyAction) => actions.changeLocation.match(action)

/**
 * Checking if the action is `actions.sendOperation` of core type which called for another BC
 * Also BCs having pending `_associate` should be ignored
 */
export const isCoreSendOperationForAnotherBc = (action: AnyAction, state: RootState) => {
    const hasAnotherUnsavedBc = (actionBcName: string) =>
        Object.keys(state.view.pendingDataChanges)
            .filter(key => key !== actionBcName)
            .filter(key => checkUnsavedChangesOfBc(state, key)).length > 0

    return isCoreSendOperation(action) && hasAnotherUnsavedBc(action.payload.bcName)
}

/**
 * Checking if the action is `actions.selectTableCellInit` called for another row or another widget
 */
const isSelectTableRowInitOnAnotherRowOrWidget = (action: AnyAction, state: RootState) => {
    const selectedRow = state.view.selectedRow

    return (
        selectedRow &&
        isSelectTableRowInit(action) &&
        (selectedRow.widgetName !== action.payload.widgetName || selectedRow.rowId !== action.payload.rowId)
    )
}
const needSaveCondition = (action: AnyAction, state: RootState) =>
    !isSaveOperation(action) && (isCoreSendOperationForAnotherBc(action, state) || isSelectTableRowInitOnAnotherRowOrWidget(action, state))

export const needSaveConditionStandard = (action: AnyAction, state: RootState) => {
    const isPopup = state.view.popupData?.bcName === (action as AnyAction).payload?.bcName

    return needSaveCondition(action, state) && !isPopup
}

export const needSaveConditionPopup = (action: AnyAction, state: RootState) => {
    const isPopup = state.view.popupData?.bcName === (action as AnyAction).payload?.bcName

    return needSaveCondition(action, state) && isPopup && !action.payload?.wasForcedUpdate
}
