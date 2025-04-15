import { reducers, Route as CoreRoute, RouteType } from '@cxbox-ui/core'
import { createReducer, isAnyOf } from '@reduxjs/toolkit'
import { actions } from '@actions'

interface Route extends CoreRoute {
    initiator: 'tab' | null
}

/**
 * Your initial state for this slice
 */
export const initialState: Route = {
    ...reducers.initialRouterState,
    type: RouteType.default,
    path: '/',
    params: {},
    screenName: undefined,
    initiator: null
}

const routerReducerBuilder = reducers
    .createRouterReducerBuilderManager(initialState)
    .addMatcher(isAnyOf(actions.changeLocation), (state, action) => {
        const { isTab } = action.payload
        state.initiator = isTab ? 'tab' : null
    }).builder

export const routerReducer = createReducer(initialState, routerReducerBuilder)
