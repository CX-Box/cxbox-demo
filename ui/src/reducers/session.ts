import { interfaces, reducers } from '@cxbox-ui/core'
import { createReducer } from '@reduxjs/toolkit'

interface Session extends interfaces.Session {
    logout: boolean
    userId?: string
}

const initialState: Session = {
    ...reducers.initialSessionState,
    active: false,
    screens: [],
    loginSpin: false,
    logout: false,
    notifications: [],
    isMetaRefreshing: false
}

const sessionReducerBuilder = reducers.createSessionReducerBuilderManager(initialState).builder

export const sessionReducer = createReducer(initialState, sessionReducerBuilder)
