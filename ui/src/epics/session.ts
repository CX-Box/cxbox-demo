import { loginDone, SSO_AUTH } from '@actions'
import { AxiosError } from 'axios'
import { keycloak, keycloakOptions } from '../keycloak'
import { catchError, concat, EMPTY, filter, from, mergeMap, of, switchMap } from 'rxjs'
import { actions, utils } from '@cxbox-ui/core'
import { RootEpic } from '@store'
import { addSortForGroupHierarchiesMutate } from '@utils/groupingHierarchy'
import { LoginResponse } from '@interfaces/session'

const { login, loginFail, logout, logoutDone } = actions

const responseStatusMessages: Record<number, string> = {
    401: 'Unauthorized',
    403: 'Access denied'
}

const ssoAuthEpic: RootEpic = action$ =>
    action$.pipe(
        filter(SSO_AUTH.match),
        switchMap(() => {
            return from(keycloak.init(keycloakOptions)).pipe(
                switchMap(() => of(login({ login: '', password: '' }))),
                catchError(() => {
                    console.error('Authentication failed')
                    return EMPTY
                })
            )
        })
    )

const loginEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(login.match),
        filter(action => !action.payload?.role),
        switchMap(action => {
            const login = action.payload && action.payload.login
            const password = action.payload && action.payload.password
            return api.getBasicAuthRequest(login, password).pipe(
                mergeMap((data: LoginResponse) => {
                    return of(
                        loginDone({
                            devPanelEnabled: data.devPanelEnabled,
                            activeRole: data.activeRole,
                            roles: data.roles,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            login: data.login,
                            screens: addSortForGroupHierarchiesMutate([...data.screens]),
                            userId: data.userId,
                            featureSettings: data.featureSettings
                        })
                    )
                }),
                catchError((error: AxiosError) => {
                    const errorMsg = error.response
                        ? responseStatusMessages[error.response.status] || 'Server application unavailable'
                        : 'Empty response from server'
                    return concat(of(loginFail({ errorMsg })), utils.createApiErrorObservable(error))
                })
            )
        })
    )

const logoutEpic: RootEpic = action$ =>
    action$.pipe(
        filter(logout.match),
        switchMap(() => {
            keycloak.logout()
            return of(logoutDone(null))
        })
    )

const logoutDoneEpic: RootEpic = action$ =>
    action$.pipe(
        filter(logoutDone.match),
        switchMap(() => {
            return EMPTY
        })
    )

export const sessionEpics = {
    ssoAuthEpic,
    logoutEpic,
    logoutDoneEpic,
    loginEpic
}
