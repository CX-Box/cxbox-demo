import { NotificationState } from '@interfaces/notification'
import { createReducer } from '@reduxjs/toolkit'
import { changeNotification } from '@actions'

/**
 * Your initial state for this slice
 */
export const initialState: NotificationState = { page: 1, limit: 5 }

export const notificationReducer = createReducer(initialState, builder => {
    builder.addCase(changeNotification, (state, action) => {
        Object.assign(state, action.payload)

        state.page = state.page ?? initialState.page
        state.limit = state.limit ?? initialState.limit
    })
})
