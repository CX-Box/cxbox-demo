import { createReducer } from '@reduxjs/toolkit'
import { reducers } from '@cxbox-ui/core'
import { changeMenuCollapsed, customAction } from '../actions/types'

/**
 * Your initial state for this slice
 */
const initialState = {
    ...reducers.initialScreenState,
    menuCollapsed: false
}

export const screenReducer = createReducer(
    initialState,
    reducers
        .createScreenReducerBuilderManager(initialState)
        .addCase(changeMenuCollapsed, (state, action) => {
            state.menuCollapsed = action.payload
        })
        .addCase(customAction, state => {
            console.log(state)
        }).builder
)
