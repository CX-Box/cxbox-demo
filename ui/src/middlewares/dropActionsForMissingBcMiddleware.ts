import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { isAnyOf, Middleware } from '@reduxjs/toolkit'
import { OperationTypeCrud } from '@cxbox-ui/core'
import { RootState } from '@store'
import { actions } from '@actions'

/**
 * Actions on which the core screen reducer changes the bc without a check that the bc exists.
 * bcFetchDataFail is not here: it has this check.
 */
const changesBcWithoutCheck = isAnyOf(
    actions.bcFetchDataRequest,
    actions.bcLoadMore,
    actions.bcFetchDataSuccess,
    actions.inlinePickListFetchDataSuccess,
    actions.bcNewDataSuccess,
    actions.bcChangeDepthCursor,
    actions.bcSelectRecord,
    actions.bcForceUpdate,
    actions.bcChangePage,
    actions.showViewPopup,
    actions.sendOperationSuccess,
    actions.bcDeleteDataFail,
    actions.sendOperationFail,
    actions.bcSaveDataSuccess,
    actions.bcSaveDataFail,
    actions.associateInProgress,
    actions.setOperationFinished
)

/**
 * sendOperation changes the bc too, except these operations (the same list as in the core screen reducer)
 */
const operationsHandledLocally: readonly string[] = [OperationTypeCrud.associate, OperationTypeCrud.fileUpload]

const failsWithoutBc = (action: AnyAction) =>
    changesBcWithoutCheck(action) ||
    (actions.sendOperation.match(action) && !operationsHandledLocally.includes(action.payload.operationType))

/**
 * Drops an action for a bc that is not on the screen.
 *
 * A response to an action can come after the user went to another screen, when the bc of the old screen is gone.
 * The core screen reducer fails on such an action, so no reducer or epic can use it, and it is dropped.
 */
export const dropActionsForMissingBcMiddleware: Middleware =
    ({ getState }: MiddlewareAPI<Dispatch<AnyAction>, RootState>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        const bcName = failsWithoutBc(action) ? action.payload.bcName : undefined

        if (bcName && !getState().screen.bo.bc[bcName]) {
            return next(actions.emptyAction(action))
        }

        return next(action)
    }
