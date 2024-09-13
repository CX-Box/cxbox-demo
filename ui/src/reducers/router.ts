import { reducers, Route, RouteType } from '@cxbox-ui/core'
import { createReducer } from '@reduxjs/toolkit'

/**
 * Your initial state for this slice
 */
export const initialState: Route = {
    ...reducers.initialRouterState,
    type: RouteType.default,
    path: '/',
    params: {},
    screenName: undefined
}

const routerReducerBuilder = reducers.createRouterReducerBuilderManager(initialState).builder

export const routerReducer = createReducer(initialState, routerReducerBuilder)
