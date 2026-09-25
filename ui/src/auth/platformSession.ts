import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { User, UserManager } from 'oidc-client-ts'
import { OIDC_CONFIG_URL, signInCallbackDetectionOfThisBrowser } from '@constants'
import { getNormalizedAppRouteFromUrl } from '@utils/api'
import { Auth } from './index'

const SIGN_IN_RESTARTS = 'cxbox.sign-in-restarts'
const MAX_SIGN_IN_RESTARTS = 2

/**
 * The only place where a project changes the authorization. Projects often use their own sign in: another provider,
 * their own tokens, a login form. Implement this interface and set it in {@link platformSession}: requests, the
 * websocket, `AuthErrorPopup` and "Log out" keep working, and nothing else in `ui/src` changes. So an update to a new
 * platform version does not conflict with the authorization of the project.
 *
 * The platform has two implementations: {@link oidcSession} for an OIDC provider (Keycloak and others) and
 * {@link noSsoSession} for the login form of the build with `REACT_APP_NO_SSO`.
 */
export interface PlatformSession {
    /**
     * The application starts: sign the user in or send the page to the sign in page.
     * Must not reject: return 'failed', and `AuthErrorPopup` opens.
     */
    signInOnPageLoad(): Promise<SignInResult>

    /** Every request to the backend passes here: add what the backend needs to know the user, for example a token */
    authorizeRequest(rqConfig: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig>

    /** The websocket connects to this URL: add what the backend needs to know the user, for example a token */
    authorizeWebSocketUrl(url: string): Promise<string>

    /**
     * "Sign in again" in `AuthErrorPopup`: sign the user in again and bring them back to the same screen.
     * Must not reject: return 'failed', and the popup says that the sign in service is not reachable.
     */
    signInAgain(): Promise<RedirectResult>

    /**
     * "Sign out" in `AuthErrorPopup` and "Log out" in the user menu: end the session of the user.
     * Must not reject: return 'failed', and the popup says that the sign in service is not reachable.
     */
    signOut(): Promise<RedirectResult>
}

/**
 * - 'signedIn': the user has a valid session, the application starts.
 * - 'nothingToDo': the application does not start now. The page is going to the sign in page, or it is the hidden
 *   iframe of a token renewal.
 * - 'failed': the sign in did not work. `AuthErrorPopup` opens instead of an endless spinner.
 */
export type SignInResult = 'signedIn' | 'nothingToDo' | 'failed'

/**
 * - 'redirecting': the page is going to the sign in page or to the logout page. The popup stays until the page leaves.
 * - 'failed': the redirect did not start, for example the provider is not reachable. The popup says so, and the user
 *   can try again.
 * - 'useLoginForm': there is no sign in page. The popup dispatches `logout`, and the login form of the application opens.
 */
export type RedirectResult = 'redirecting' | 'failed' | 'useLoginForm'

export const platformSession: PlatformSession = process.env['REACT_APP_NO_SSO'] ? noSsoSession() : oidcSession()

/**
 * The build without SSO: the session cookie of the backend authorizes the requests, so there is nothing to add
 */
function noSsoSession(): PlatformSession {
    return {
        signInOnPageLoad: async () => 'nothingToDo', // not called: `AppLayout` shows the login form
        authorizeRequest: async rqConfig => rqConfig,
        authorizeWebSocketUrl: async url => url,
        signInAgain: async () => 'useLoginForm',
        signOut: async () => 'useLoginForm'
    }
}

function oidcSession(): PlatformSession {
    return {
        async signInOnPageLoad() {
            try {
                const userManager = await Auth.init(OIDC_CONFIG_URL)
                if (isReturnFromProvider()) {
                    return await completeSignIn(userManager)
                }
                const user = await userManager.getUser()
                if (user && !user.expired) {
                    return sessionStarted(getNormalizedAppRouteFromUrl())
                }
                return await goToProvider(userManager)
            } catch (error) {
                console.error('Authentication failed', error)
                return afterFailedSignIn()
            }
        },

        async authorizeRequest(rqConfig) {
            const user = await getUserWithValidToken().catch(reason => {
                throw unauthorized(rqConfig, reason)
            })
            rqConfig.headers.Authorization = `Bearer ${user?.access_token}`
            return rqConfig
        },

        async authorizeWebSocketUrl(url) {
            const user = await getUserWithValidToken()
            return user?.access_token ? `${url}?access_token=${encodeURI(user.access_token)}` : url
        },

        async signInAgain() {
            try {
                await redirectToProvider(await Auth.init(OIDC_CONFIG_URL))
                return 'redirecting'
            } catch (error) {
                console.error('Sign in failed', error)
                return 'failed'
            }
        },

        async signOut() {
            try {
                await Auth.getInstance().signoutRedirect()
                return 'redirecting'
            } catch (error) {
                console.error('Logout failed', error)
                return 'failed'
            }
        }
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// The helpers of signInOnPageLoad
// ---------------------------------------------------------------------------------------------------------------------

const detectBySignInCallbackParam = () => signInCallbackDetectionOfThisBrowser() === 'signInCallbackParam'

/**
 * The URL of a return from the provider: `/ui/?state=5d1f0c...&code=9c2a71...#/?sign_in_callback=redirect`
 */
function isReturnFromProvider() {
    if (detectBySignInCallbackParam()) {
        return Auth.signInCallbackParam !== null
    }
    const params = urlParams()
    return params.has('state') && (params.has('code') || params.has('error'))
}

/**
 * oidc-client-ts creates its iframe with `width=0` and `height=0`. The size tells it from an application
 * that is shown inside a visible frame
 */
function isHiddenIframe() {
    if (detectBySignInCallbackParam()) {
        return Auth.signInCallbackParam !== null && Auth.signInCallbackParam !== 'redirect'
    }
    return window.self !== window.top && window.innerWidth === 0 && window.innerHeight === 0
}

/** Also after `?` inside the route: `redirect_uri` of `index.ts` puts `sign_in_callback` there */
function urlParams() {
    const { search, hash } = window.location
    return new URLSearchParams(`${search.slice(1)}&${hash.split('?')[1] ?? ''}`)
}

/** oidc-client-ts keeps it during the trip to the provider and returns it in {@link User.state} */
interface SignInState {
    route: string
}

async function completeSignIn(userManager: UserManager): Promise<SignInResult> {
    const user = await userManager.signinCallback()
    if (!user) {
        return 'nothingToDo' // the hidden iframe: oidc-client-ts passed the response of the provider to the parent page
    }
    const state = user.state as SignInState | undefined
    return sessionStarted(state?.route ?? '')
}

function sessionStarted(route: string): SignInResult {
    window.history.replaceState(null, '', route) // without the parameters of the provider
    sessionStorage.removeItem(SIGN_IN_RESTARTS)
    return 'signedIn'
}

async function goToProvider(userManager: UserManager): Promise<SignInResult> {
    // "Back" on the provider page restores this page from the browser cache as it was: a spinner. So reload it.
    // Only at page load: there is nothing on the screen to lose
    window.addEventListener('pageshow', event => event.persisted && window.location.reload())
    await redirectToProvider(userManager)
    return 'nothingToDo'
}

async function redirectToProvider(userManager: UserManager) {
    const state: SignInState = { route: getNormalizedAppRouteFromUrl() }
    await userManager.signinRedirect({ state })
}

function afterFailedSignIn(): SignInResult | Promise<SignInResult> {
    if (isHiddenIframe()) {
        return 'nothingToDo' // nobody sees the hidden iframe. The parent page gets a timeout
    }
    return isReturnFromProvider() ? restartSignIn() : 'failed'
}

/**
 * After F5 during the return from the provider the URL keeps the used code, and every reload fails.
 * A new sign in gets a new code, without a password while the SSO session is valid.
 * {@link MAX_SIGN_IN_RESTARTS} keeps a broken provider from a loop.
 */
async function restartSignIn(): Promise<SignInResult> {
    window.history.replaceState(null, '', window.location.pathname) // the URL of a return has only the parameters of the provider
    const restarts = Number(sessionStorage.getItem(SIGN_IN_RESTARTS)) + 1
    sessionStorage.setItem(SIGN_IN_RESTARTS, String(restarts))
    return restarts > MAX_SIGN_IN_RESTARTS ? 'failed' : platformSession.signInOnPageLoad()
}

// ---------------------------------------------------------------------------------------------------------------------
// The helpers of authorizeRequest and authorizeWebSocketUrl
// ---------------------------------------------------------------------------------------------------------------------

/**
 * `RotationSafeUserManager.getUser()` first renews a token that is about to expire, plain `UserManager` does not
 */
async function getUserWithValidToken(): Promise<User | null> {
    const userManager = Auth.getInstance()
    // `getUser()` does not reject when the renewal fails: the reasons come only through this event.
    // Support sees them in "Copy details"
    let reasons = ''
    const stopListening = userManager.events.addSilentRenewError(error => {
        reasons = error.message
    })
    const user = await userManager.getUser().finally(stopListening)
    if (!user || user.expired) {
        throw new Error(`The session is lost: there is no user with a valid access token. ${reasons}`)
    }
    return user
}

/** The 401 that the backend would give anyway. `data` keeps the reasons for "Copy details" */
function unauthorized(rqConfig: InternalAxiosRequestConfig, reason: unknown) {
    return new AxiosError('Session has expired: token refresh failed', AxiosError.ERR_BAD_REQUEST, rqConfig, undefined, {
        status: 401,
        statusText: 'Unauthorized',
        data: String((reason as Error | undefined)?.message ?? ''),
        headers: {},
        config: rqConfig
    } as AxiosResponse)
}
