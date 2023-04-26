import { CustomEpic, actionTypes, AnyAction } from '../interfaces/actions'
import { getBasicAuthRequest } from '../api/session'
import { LoginResponse } from '@cxbox-ui/core/interfaces/session'
import { Observable } from 'rxjs/Observable'
import { $do, SSO_AUTH } from '../actions/types'
import { AxiosError } from 'axios'
import { AppState } from '../interfaces/storeSlices'
import { Epic } from 'redux-observable'
import { keycloak, keycloakOptions } from '../keycloak'

const responseStatusMessages: Record<number, string> = {
    401: 'Unauthorized',
    403: 'Access denied'
}

const ssoAuthEpic: Epic<AnyAction, AppState> = (action$, store) =>
    action$.ofType(SSO_AUTH).switchMap(() => {
        return Observable.fromPromise(keycloak.init(keycloakOptions))
            .switchMap(() => Observable.of($do.login({ login: '', password: '' })))
            .catch(() => {
                console.error('Authentication failed')
                return Observable.empty<never>()
            })
    })

const loginEpic: CustomEpic = (action$, store) =>
    action$
        .ofType(actionTypes.login)
        .filter(action => !action.payload?.role)
        .switchMap(action => {
            const login = action.payload && action.payload.login
            const password = action.payload && action.payload.password
            return getBasicAuthRequest(login, password)
                .mergeMap((data: LoginResponse) => {
                    return Observable.of(
                        $do.loginDone({
                            devPanelEnabled: data.devPanelEnabled,
                            activeRole: data.activeRole,
                            roles: data.roles,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            login: data.login,
                            screens: data.screens
                        })
                    )
                })
                .catch((error: AxiosError) => {
                    const errorMsg = error.response
                        ? responseStatusMessages[error.response.status] || 'Server application unavailable'
                        : 'Empty response from server'
                    return Observable.of($do.loginFail({ errorMsg }))
                })
        })

const logoutEpic: CustomEpic = (action$, store) =>
    action$.ofType(actionTypes.logout).switchMap(() => {
        keycloak.logout()
        return Observable.of($do.logoutDone(null))
    })

const logoutDone: CustomEpic = (action$, store) =>
    action$.ofType(actionTypes.logoutDone).switchMap(() => {
        return Observable.empty()
    })

export const sessionEpics = {
    ssoAuthEpic,
    logoutEpic,
    logoutDone,
    loginEpic
}
