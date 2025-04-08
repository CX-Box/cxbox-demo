import { loginDone, SSO_AUTH } from '@actions'
import { AxiosError } from 'axios'
import { keycloak, keycloakOptions } from '../keycloak'
import { catchError, concat, EMPTY, filter, from, mergeMap, of, switchMap } from 'rxjs'
import { processScreensOnLogin } from './utils/processScreensOnLogin'
import { actions, utils } from '@cxbox-ui/core'
import { RootEpic } from '@store'
import { LoginResponse } from '@interfaces/session'

const responseStatusMessages: Record<number, string> = {
    401: 'Unauthorized',
    403: 'Access denied'
}

const ssoAuthEpic: RootEpic = action$ =>
    action$.pipe(
        filter(SSO_AUTH.match),
        switchMap(() => {
            return from(keycloak.init(keycloakOptions)).pipe(
                switchMap(() => of(actions.login({ login: '', password: '' }))),
                catchError(() => {
                    console.error('Authentication failed')
                    return EMPTY
                })
            )
        })
    )

const loginEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.login.match),
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
                            screens: processScreensOnLogin(data.screens),
                            userId: data.userId,
                            featureSettings: data.featureSettings
                        })
                    )
                }),
                catchError((error: AxiosError) => {
                    const errorMsg = error.response
                        ? responseStatusMessages[error.response.status] || 'Server application unavailable'
                        : 'Empty response from server'
                    return concat(of(actions.loginFail({ errorMsg })), utils.createApiErrorObservable(error))
                })
            )
        })
    )

/**
 * Performed on role switching
 */
export const loginByAnotherRoleEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.login.match),
        filter(action => !!action.payload?.role),
        switchMap(action => {
            /**
             * Default implementation of `loginByAnotherRoleEpic` epic
             *
             * Performs login request with `role` parameter
             *
             * If `role` changed, epic changes location to default view
             */

            const role = action.payload.role ?? ''
            const isSwitchRole = role && role !== state$.value.session.activeRole
            return api.loginByRoleRequest(role).pipe(
                mergeMap(data => {
                    let defaultUrl

                    if (isSwitchRole) {
                        const defaultScreen = data.screens.find(screen => screen.defaultScreen) || data.screens[0]
                        const views = defaultScreen.meta?.views ?? []
                        const defaultView =
                            utils.getDefaultViewForPrimary(defaultScreen.primary ?? '', views) ??
                            utils.getDefaultViewFromPrimaries(defaultScreen.primaries, views) ??
                            views[0]

                        if (defaultView) {
                            defaultUrl = defaultView.url
                        }
                    }

                    return concat([
                        actions.loginDone({
                            devPanelEnabled: data.devPanelEnabled,
                            activeRole: data.activeRole,
                            roles: data.roles,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            login: data.login,
                            screens: processScreensOnLogin(data.screens),
                            userId: data.userId,
                            featureSettings: data.featureSettings,
                            defaultUrl
                        })
                    ])
                }),
                catchError((error: AxiosError) => {
                    console.error(error)
                    const errorMsg = error.response
                        ? responseStatusMessages[error.response.status] || 'Server application unavailable'
                        : 'Empty server response'
                    return concat(of(actions.loginFail({ errorMsg })), utils.createApiErrorObservable(error))
                })
            )
        })
    )

const logoutEpic: RootEpic = action$ =>
    action$.pipe(
        filter(actions.logout.match),
        switchMap(() => {
            keycloak.logout()
            return of(actions.logoutDone(null))
        })
    )

const logoutDoneEpic: RootEpic = action$ =>
    action$.pipe(
        filter(actions.logoutDone.match),
        switchMap(() => {
            return EMPTY
        })
    )

export const sessionEpics = {
    ssoAuthEpic,
    logoutEpic,
    logoutDoneEpic,
    loginEpic,
    loginByAnotherRoleEpic
}
