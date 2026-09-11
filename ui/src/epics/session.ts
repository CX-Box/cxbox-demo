import { AuthErrorStatusCode, loginDone, showAuthErrorPopup, SSO_AUTH } from '@actions'
import { AxiosError } from 'axios'
import { catchError, concat, EMPTY, filter, from, map, mergeMap, of, switchMap } from 'rxjs'
import { processScreensOnLogin } from './utils/processScreensOnLogin'
import { actions, interfaces, utils } from '@cxbox-ui/core'
import { RootEpic } from '@store'
import { LoginResponse } from '@interfaces/session'
import { Auth } from '../auth'
import { keepTokenFresh } from '../auth/tokenRenewal'
import { AUTH_ERROR_MODE, OIDC_CONFIG_URL } from '@constants'
import { getNormalizedAppRouteFromUrl } from '@utils/api'
import { toRequestErrorInfo } from '@utils/requestErrorInfo'
import { isAuthErrorSnoozed } from '../reducers/session'

const responseStatusMessages: Record<number, string> = {
    401: 'Unauthorized',
    403: 'Access denied'
}

const ssoAuthEpic: RootEpic = action$ =>
    action$.pipe(
        filter(SSO_AUTH.match),
        switchMap(() => {
            // keepTokenFresh replaces the library's automaticSilentRenew (off in auth/index.ts), see auth/tokenRenewal.ts
            return from(
                Auth.init(OIDC_CONFIG_URL).then(userManager => {
                    keepTokenFresh(userManager)
                    return userManager
                })
            ).pipe(
                switchMap(userManager => {
                    if (Auth.signInCallbackParam) {
                        return from(userManager.signinCallback()).pipe(
                            switchMap(user => {
                                if (Auth.signInCallbackParam === 'redirect') {
                                    const state = user?.state as Record<string, string | undefined>
                                    const route = state.route ? state.route : ''
                                    window.history.replaceState(null, '', route)
                                    return of(actions.login({ login: '', password: '' }))
                                }
                                return EMPTY
                            })
                        )
                    }

                    return from(userManager.getUser()).pipe(
                        switchMap(user => {
                            if (user && !user.expired) {
                                window.history.replaceState(null, '', getNormalizedAppRouteFromUrl())
                                return of(actions.login({ login: '', password: '' }))
                            } else {
                                userManager.signinRedirect({
                                    state: {
                                        route: getNormalizedAppRouteFromUrl()
                                    }
                                })
                                return EMPTY
                            }
                        })
                    )
                }),
                catchError(error => {
                    console.error('Authentication failed', error)
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
                            featureSettings: data.featureSettings,
                            language: data.language,
                            sessionId: data.sessionId
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
                            language: data.language,
                            sessionId: data.sessionId,
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
            Auth.getInstance().signoutRedirect()
            return of(actions.logoutDone(null))
        }),
        catchError(error => {
            console.error('Logout failed', error)
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

const AUTH_ERROR_STATUS_CODES: number[] = [401, 403]

/**
 * Overrides core `httpError401Epic` (it dispatched `logoutDone` and left empty widgets): 401 and 403 open AuthErrorPopup,
 * also before the session is active (SSO login of a user without roles), except in basic-auth mode where the login form shows the error.
 * "No" snoozes the popup for a while.
 */
const httpError401Epic: RootEpic = (action$, state$) =>
    action$.pipe(
        filter(actions.httpError.match),
        filter(action => AUTH_ERROR_STATUS_CODES.includes(action.payload.statusCode)),
        filter(() => state$.value.session.active || !process.env['REACT_APP_NO_SSO']),
        filter(() => !isAuthErrorSnoozed(state$.value.session)),
        map(action =>
            showAuthErrorPopup({
                ...toRequestErrorInfo(action.payload.error),
                statusCode: action.payload.statusCode as AuthErrorStatusCode
            })
        )
    )

/**
 * Overrides core `httpErrorDefaultEpic`: identical to the core one, but 403 is excluded
 * because it is handled by `httpError401Epic` above instead of the generic business error popup.
 */
const knownHttpErrors = [...AUTH_ERROR_STATUS_CODES, 409, 418, 500]

const httpErrorDefaultEpic: RootEpic = action$ =>
    action$.pipe(
        filter(actions.httpError.match),
        filter(action => !knownHttpErrors.includes(action.payload.statusCode)),
        map(action =>
            actions.showViewError({
                error: {
                    type: interfaces.ApplicationErrorType.BusinessError,
                    code: action.payload.error.response?.status,
                    details: action.payload.error.response?.data
                } as interfaces.ApplicationError
            })
        )
    )

export const sessionEpics = {
    ssoAuthEpic,
    logoutEpic,
    logoutDoneEpic,
    loginEpic,
    loginByAnotherRoleEpic,
    // in legacy mode the core epics stay in place (401 -> logoutDone, 403 -> generic error popup)
    ...(AUTH_ERROR_MODE === 'legacy' ? {} : { httpError401Epic, httpErrorDefaultEpic })
}
