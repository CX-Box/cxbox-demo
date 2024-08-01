import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { RootState } from '@store'
import { AppWidgetMeta } from '@interfaces/widget'
import { actions } from '@actions'
import { OperationTypeCrud } from '@cxbox-ui/core'

/**
 * Performs mechanism of autosave
 *
 * @param action
 * @param store
 * @param next
 * @param isPopup
 * @category Utils
 */
export function autosaveRoutine(
    action: AnyAction,
    store: MiddlewareAPI<Dispatch<AnyAction>, RootState>,
    next: Dispatch,
    isPopup: boolean = false
) {
    const state = store.getState()
    const dispatch = store.dispatch
    const pendingDataChanges = state.view.pendingDataChanges
    const bcList = Object.keys(pendingDataChanges)
    /**
     * Here we need to find BC with unsaved changes called `baseBcName`
     * because current action will be dispatched after `baseBcName` saving.
     * 1. We need to check out if bcName of current action is suitable for that aim
     * 2. Otherwise find first unsaved bcName
     */
    const baseBcNameIndex =
        action.payload?.bcName &&
        bcHasPendingAutosaveChanges(state, action.payload.bcName, state.screen.bo.bc[action.payload.bcName]?.cursor as string)
            ? bcList.findIndex(bcName => bcName === action.payload?.bcName)
            : bcList.findIndex(bcName => bcHasPendingAutosaveChanges(state, bcName, state.screen.bo.bc[bcName]?.cursor as string))
    const baseBcName = bcList[baseBcNameIndex]
    /**
     * Here we need to form a list of rest BC names.
     * We exclude `baseBcName` from `bcList`
     */
    if (baseBcNameIndex > -1) {
        bcList.splice(baseBcNameIndex, 1)
    }
    /**
     * Saving process
     */
    if (baseBcName) {
        /**
         * Save all BCs except `baseBcName`
         */
        bcList.forEach(bcName => {
            const widget = state.view.widgets?.find((v: AppWidgetMeta) => v.bcName === bcName)
            const cursor = state.screen.bo.bc[bcName]?.cursor
            if (bcHasPendingAutosaveChanges(state, bcName, cursor as string)) {
                !isPopup
                    ? dispatch(
                          actions.sendOperation({
                              bcName: bcName,
                              operationType: OperationTypeCrud.save,
                              widgetName: widget?.name as string
                          })
                      )
                    : dispatch(actions.forceUpdateRowMeta({ bcName: bcName }))
            }
        })
        /**
         * save `baseBcName`'s BC
         */
        const baseWidget = state.view.widgets?.find((v: AppWidgetMeta) => v.bcName === baseBcName)
        return !isPopup
            ? next(
                  actions.sendOperation({
                      bcName: baseBcName,
                      operationType: OperationTypeCrud.save,
                      widgetName: baseWidget?.name as string,
                      onSuccessAction: action
                  })
              )
            : dispatch(actions.forceUpdateRowMeta({ bcName: baseBcName, onSuccessAction: action }))
    }

    return next(action)
}

/**
 * Checks presence of pending changes suitable for autosave
 *
 * @param store
 * @param bcName
 * @param cursor
 */
export function bcHasPendingAutosaveChanges(store: RootState, bcName: string, cursor: string) {
    const pendingChanges = store.view.pendingDataChanges
    const cursorChanges = pendingChanges[bcName]?.[cursor as string]
    const result = cursorChanges && !Object.keys(cursorChanges).includes('_associate') && Object.values(cursorChanges).length > 0
    return result
}

/**
 * Checks presence of unsaved data.ts for specified BC
 *
 * @param store
 * @param bcName
 */
export function checkUnsavedChangesOfBc(store: RootState, bcName: string) {
    const pendingCursors = Object.keys(store.view.pendingDataChanges?.[bcName] ?? {})
    return pendingCursors.some(cursor => bcHasPendingAutosaveChanges(store, bcName, cursor))
}
