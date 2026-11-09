import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'
import { actions } from '@actions'
import { RootState } from '@store'
import { dropRuntimeErrors, syncRuntimeErrorCapture } from '@utils/runtimeErrors'

export const runtimeErrorsMiddleware: Middleware = (api: MiddlewareAPI<Dispatch, RootState>) => (next: Dispatch) => (action: AnyAction) => {
    const viewName = api.getState().view.name
    // Clear before loading the next view to retain errors raised during its loading.
    if (actions.selectView.match(action) && viewName && action.payload.name !== viewName) {
        dropRuntimeErrors()
    }
    const result = next(action)
    syncRuntimeErrorCapture(api)
    return result
}
