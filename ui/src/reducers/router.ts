import { Route } from '@cxbox-ui/core/interfaces/router'
import { createReducer } from '@reduxjs/toolkit'
import { createRouterReducerBuilderManager } from '@cxbox-ui/core/reducers'
import { loginDone } from '@cxbox-ui/core/actions'

/**
 * Your initial state for this slice
 */
const initialState: Route = { type: 'default' as any, path: '/', params: {}, screenName: undefined }

export const routerReducer = createReducer(
    initialState,
    createRouterReducerBuilderManager(initialState).addCase(loginDone, (state, action) => {
        state = keycloakAwareParseLocation(action.payload)
    }).builder
)

/**
 * Copy of built-in parseLocation of Cxbox UI extended with a fix for malformed url, e.g.
 * when GET parameters are present and joined through `&` without `?` appearing first.
 *
 * TODO: Remove when https://github.com/CX-Box/cxbox-ui/issues/663 is resolved.
 *
 * @param loc
 */
export function keycloakAwareParseLocation(loc: typeof historyObj.location): Route {
    let path: string = loc.pathname
    if (path.startsWith('/')) {
        path = path.substring(1)
    }
    if (path.endsWith('/')) {
        path = path.substring(0, path.length - 1)
    }
    if (path?.includes('&') && !path?.includes('?')) {
        path = path.substring(0, path.indexOf('&'))
    }
    const params = new URLSearchParams(loc.search)
    const tokens = path.split('/').map(decodeURIComponent)

    let type = 'unknown'
    let screenName
    let viewName
    let bcPath
    if (tokens.length > 0 && tokens[0] === 'router') {
        type = 'router'
    } else if (tokens.length === 1) {
        type = 'default'
    } else if (tokens.length >= 2 && tokens[0] === 'screen') {
        let bcIndex = 2
        type = 'screen'
        screenName = tokens[1]
        if (tokens.length >= 4 && tokens[2] === 'view') {
            bcIndex += 2
            viewName = tokens[3]
        }
        bcPath = tokens.slice(bcIndex).map(encodeURIComponent).join('/')
    }

    return {
        type: type as any,
        path: path,
        params: params as any,
        screenName: screenName,
        viewName: viewName,
        bcPath: bcPath
    }
}
