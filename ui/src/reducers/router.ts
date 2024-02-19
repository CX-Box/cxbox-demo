import { interfaces, reducers } from '@cxbox-ui/core'
import { createReducer } from '@reduxjs/toolkit'
const { RouteType } = interfaces

/**
 * Your initial state for this slice
 */
export const initialState: interfaces.Route = {
    ...reducers.initialRouterState,
    type: RouteType.default,
    path: '/',
    params: {},
    screenName: undefined
}

const routerReducerBuilder = reducers.createRouterReducerBuilderManager(initialState).builder

export const routerReducer = createReducer(initialState, routerReducerBuilder)
