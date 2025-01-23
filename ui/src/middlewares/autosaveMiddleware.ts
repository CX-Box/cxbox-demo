import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'
import { actions } from '@actions'
import { RootState } from '@store'
import { autosaveRoutine, bcHasPendingAutosaveChanges } from '@utils/autosave'
import {
    isChangeLocation,
    isCoreSendOperationForAnotherBc,
    needSaveConditionPopup,
    needSaveConditionStandard
} from './autosaveMiddleware.utils'
import { OperationTypeCrud } from '@cxbox-ui/core'

// TODO: Should offer to save pending changes or drop them
export const saveFormMiddleware: Middleware =
    ({ getState, dispatch }: MiddlewareAPI<Dispatch, RootState>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        const state = getState()
        /**
         * Default save operation as custom action
         *
         * If widget have only custom actions, `defaultSave` option mean witch action
         * must be executed as save record.
         * Current actions.changeLocation action as onSuccessAction
         */
        const widgetsWithDefaultSave = state.view.widgets?.filter(widget => widget?.options?.actionGroups?.defaultSave)
        const defaultSaveWidgetsHasPendingChanges = widgetsWithDefaultSave?.filter(
            defaultSaveWidget =>
                defaultSaveWidget.bcName !== action.payload?.bcName &&
                bcHasPendingAutosaveChanges(
                    state,
                    defaultSaveWidget.bcName,
                    state.screen.bo.bc?.[defaultSaveWidget?.bcName as string]?.cursor as string
                )
        )

        if (
            defaultSaveWidgetsHasPendingChanges.length &&
            (isChangeLocation(action) ||
                (actions.sendOperation.match(action) &&
                    action.payload.operationType === OperationTypeCrud.save &&
                    (action.payload?.autosave ?? true)))
        ) {
            return next(
                actions.callDefaultSave({
                    onSuccessActions: [action]
                })
            )
        }

        /**
         * Default save operation CRUD (core operation)
         */

        if (needSaveConditionStandard(action, state)) {
            return autosaveRoutine(action, { getState, dispatch }, next, false)
        }

        if (needSaveConditionPopup(action, state)) {
            return autosaveRoutine(action, { getState, dispatch }, next, isCoreSendOperationForAnotherBc(action, state))
        }

        return next(action)
    }
