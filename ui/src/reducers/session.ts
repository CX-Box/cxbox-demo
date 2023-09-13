import { actionTypes, AnyAction } from '../interfaces/actions'
import { AppState } from '../interfaces/storeSlices'
import { Session } from '@cxbox-ui/core/interfaces'
import { reducers, actions } from '@cxbox-ui/core'
import { createReducer } from '@reduxjs/toolkit'

/**
 * Your reducers for this slice
 */
export const sessionReducer = createReducer(
    reducers.initialSessionState,
    reducers
        .createSessionReducerBuilderManager(reducers.initialSessionState)
        .addCase(actions.logout, state => {
            state.logout = true
            state.active = false
            state.loginSpin = false
        })
        .addCase(actions.loginDone, state => {
            state.active = true
            state.logout = false
        }).builder
)
