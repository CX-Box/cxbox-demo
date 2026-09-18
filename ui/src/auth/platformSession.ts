/**
 * {@link PlatformSession}: what the application does with the session of its user. It says nothing about OIDC.
 * It has two implementations: {@link noSsoSession} and {@link oidcSession}. The build chooses one: {@link platformSession}.
 * The code outside `src/auth` calls only {@link platformSession}, and does not know about tokens, oidc-client-ts or {@link Auth}.
 *
 * Not here: the safe token renewal ({@link RotationSafeUserManager}) and the provider settings (`index.ts`).
 * A separate file, so a project that takes a new platform version gets a new file, not a conflict in the files it changed.
 */
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { User, UserManager } from 'oidc-client-ts'
import { OIDC_CONFIG_URL, signInCallbackDetectionOfThisBrowser } from '@constants'
import { getNormalizedAppRouteFromUrl } from '@utils/api'
import { Auth } from './index'

/** The sessionStorage key of the counter of {@link restartSignIn} */
const SIGN_IN_RESTARTS = 'cxbox.sign-in-restarts'
const MAX_SIGN_IN_RESTARTS = 2

/**
 * The life of a session in the application. The methods are in the same order:
 *
 * 1. The application starts: {@link PlatformSession.signInOnPageLoad}. The user is signed in, or the page goes to the provider.
 * 2. The user works. Every HTTP request gets the token from {@link PlatformSession.authorizeRequest}, the websocket gets it from
 *    {@link PlatformSession.authorizeWebSocketUrl}. The token is renewed in the background.
 * 3. The session is lost: the backend answers 401 or 403, or the token cannot be renewed. `AuthErrorPopup` opens.
 *    - "Sign in again": {@link PlatformSession.signInAgain}. The page goes to the provider and comes back to step 1.
 *    - "Sign out": {@link PlatformSession.signOut}. The page goes to the logout of the provider.
 * 4. The user logs out from the user menu: {@link PlatformSession.signOut}.
 */
export interface PlatformSession {
    /** Called by `ssoAuthEpic` when the application starts */
    signInOnPageLoad(): Promise<SignInResult>

    /**
     * The axios request interceptor of `api/index.ts`. It adds the access token to every request as a header:
     * ```
     * Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
     * ```
     * If the session is lost, the request is not sent. It fails with a 401 response that is created here: the backend would
     * answer 401 anyway. A 401 opens `AuthErrorPopup`.
     */
    authorizeRequest(rqConfig: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig>

    /**
     * Called by the websocket (`useNotificationClient`) before it connects. It adds the access token to the URL:
     * ```
     * wss://host/api/v1/websocketnotification                                       // before
     * wss://host/api/v1/websocketnotification?access_token=eyJhbGciOiJSUzI1NiIs...  // after
     * ```
     * Rejects if the session is lost: the websocket does not connect, and `AuthErrorPopup` opens.
     */
    authorizeWebSocketUrl(url: string): Promise<string>

    /**
     * The "Sign in again" button of `AuthErrorPopup`: a redirect to the provider and back to the same screen. No password is
     * needed while the SSO session is valid.
     */
    signInAgain(): Promise<RedirectResult>

    /** "Sign out" of `AuthErrorPopup`, and `logoutEpic` for "Log out" of the user menu */
    signOut(): Promise<RedirectResult>
}

/**
 * How {@link PlatformSession.signInOnPageLoad} ended:
 *
 * - 'signedIn': a user with a valid token exists, continue with the login.
 * - 'nothingToDo': the application does not start now. The page is going to the provider, or it is the hidden iframe of a
 *   token renewal.
 * - 'failed': nothing worked. Show the popup, not a spinner.
 */
export type SignInResult = 'signedIn' | 'nothingToDo' | 'failed'

/**
 * How {@link PlatformSession.signInAgain} and {@link PlatformSession.signOut} ended:
 *
 * - 'redirecting': the page is going to the provider. The popup stays until the page leaves.
 * - 'failed': the redirect did not start, the provider is not reachable. The popup says so, and the user can try again.
 * - 'useLoginForm': the build without SSO has no provider. The popup dispatches `logout`, and the login form opens.
 */
export type RedirectResult = 'redirecting' | 'failed' | 'useLoginForm'

/** The session of this build */
export const platformSession: PlatformSession = process.env['REACT_APP_NO_SSO'] ? noSsoSession() : oidcSession()

/**
 * {@link PlatformSession} of the build without SSO (`REACT_APP_NO_SSO`): the login form of `AppLayout` and the session cookie of
 * the backend. There is no provider and there are no tokens, so there is nothing to do
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

/** {@link PlatformSession} with OIDC. The methods are in the order of the interface, their helpers are below */
function oidcSession(): PlatformSession {
    return {
        // 1. The application starts
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

        // 2. The user works
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

        // 3. The session is lost, `AuthErrorPopup` is open
        async signInAgain() {
            try {
                await redirectToProvider(await Auth.init(OIDC_CONFIG_URL))
                return 'redirecting'
            } catch (error) {
                console.error('Sign in failed', error)
                return 'failed'
            }
        },

        // 3 and 4. "Sign out" of the popup, "Log out" of the user menu
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
// The helpers of step 1
// ---------------------------------------------------------------------------------------------------------------------

/** The old way or the new way, see `SIGN_IN_CALLBACK_DETECTION` in `constants/index.ts` */
const detectBySignInCallbackParam = () => signInCallbackDetectionOfThisBrowser() === 'signInCallbackParam'

/**
 * Did the provider return the browser to this page? The URL of a return:
 * ```
 * /ui/?state=5d1f0c...&code=9c2a71...#/?sign_in_callback=redirect
 * ```
 * - New way: the URL has the response of the provider, `state` with `code` or `error`. It is the OIDC protocol, and
 *   oidc-client-ts reads the same parameters.
 * - Old way: the URL has our `sign_in_callback`, see `redirect_uri` in `index.ts`. It is after `#`, and a provider may drop it.
 */
function isReturnFromProvider() {
    if (detectBySignInCallbackParam()) {
        return Auth.signInCallbackParam !== null
    }
    const params = urlParams()
    return params.has('state') && (params.has('code') || params.has('error'))
}

/**
 * Is this page the hidden iframe of a token renewal? Asked by {@link afterFailedSignIn}: nobody sees it, so a failed return
 * is not repaired in it. An application that is shown inside a visible frame is not a hidden iframe.
 *
 * - New way: the page is inside a frame of zero size. oidc-client-ts creates its iframe with `width=0` and `height=0`.
 * - Old way: `sign_in_callback` is not 'redirect'. It is 'silent', see `silent_redirect_uri` in `index.ts`.
 */
function isHiddenIframe() {
    if (detectBySignInCallbackParam()) {
        return Auth.signInCallbackParam !== null && Auth.signInCallbackParam !== 'redirect'
    }
    return window.self !== window.top && window.innerWidth === 0 && window.innerHeight === 0
}

/** The parameters before `#`, and after `?` inside the route: `redirect_uri` of `index.ts` ends with `#/?sign_in_callback=...` */
function urlParams() {
    const { search, hash } = window.location
    return new URLSearchParams(`${search.slice(1)}&${hash.split('?')[1] ?? ''}`)
}

/**
 * What oidc-client-ts keeps for us during the trip to the provider. {@link redirectToProvider} gives it to oidc-client-ts,
 * and {@link completeSignIn} gets it back in {@link User.state}.
 */
interface SignInState {
    /** The screen where the user was before the trip: `/ui/#/screen/client/view/clientlist?filters=...` */
    route: string
}

/** The provider returned the browser to this page. oidc-client-ts remembers who asked for it: the page or the hidden iframe */
async function completeSignIn(userManager: UserManager): Promise<SignInResult> {
    const user = await userManager.signinCallback()
    if (!user) {
        return 'nothingToDo' // the hidden iframe: oidc-client-ts passed the response of the provider to the parent page
    }
    // the page: oidc-client-ts exchanged the code from the URL for tokens. Open the screen where the user was before the trip
    const state = user.state as SignInState | undefined
    return sessionStarted(state?.route ?? '')
}

/** The user is signed in */
function sessionStarted(route: string): SignInResult {
    window.history.replaceState(null, '', route) // the screen of the user, without the parameters of the provider
    sessionStorage.removeItem(SIGN_IN_RESTARTS)
    return 'signedIn'
}

/** Nobody is signed in: the page goes to the provider */
async function goToProvider(userManager: UserManager): Promise<SignInResult> {
    // "Back" on the provider page restores this page from the browser cache as it was: a spinner. So reload it.
    // Only at page load: there is nothing on the screen to lose
    window.addEventListener('pageshow', event => event.persisted && window.location.reload())
    await redirectToProvider(userManager)
    return 'nothingToDo'
}

/** A full page redirect to the provider. The user comes back to the same screen, see {@link SignInState} */
async function redirectToProvider(userManager: UserManager) {
    const state: SignInState = { route: getNormalizedAppRouteFromUrl() }
    await userManager.signinRedirect({ state })
}

/** The sign in at page load failed */
function afterFailedSignIn(): SignInResult | Promise<SignInResult> {
    if (isHiddenIframe()) {
        return 'nothingToDo' // nobody sees the hidden iframe. The parent page gets a timeout
    }
    return isReturnFromProvider() ? restartSignIn() : 'failed'
}

/**
 * F5 during the return from the provider: the URL still has the used code, so every reload fails, an endless spinner.
 * The fix: open the start page and sign in again as at a normal page load. oidc-client-ts does not send the used code
 * again, the provider gives a new one, and the SSO cookie means no password.
 * Maximum {@link MAX_SIGN_IN_RESTARTS} times in a row, then `AuthErrorPopup`: a broken provider must not cause a loop.
 */
async function restartSignIn(): Promise<SignInResult> {
    window.history.replaceState(null, '', window.location.pathname) // the URL of a return has only the parameters of the provider
    const restarts = Number(sessionStorage.getItem(SIGN_IN_RESTARTS)) + 1
    sessionStorage.setItem(SIGN_IN_RESTARTS, String(restarts))
    return restarts > MAX_SIGN_IN_RESTARTS ? 'failed' : platformSession.signInOnPageLoad()
}

// ---------------------------------------------------------------------------------------------------------------------
// The helpers of step 2
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Rejects if there is no valid token: the session is lost. {@link RotationSafeUserManager.getUser} renews the token first if
 * it is about to expire. `UserManager` of oidc-client-ts does not: it renews tokens only in the background.
 */
async function getUserWithValidToken(): Promise<User | null> {
    const userManager = Auth.getInstance()
    // `getUser()` never rejects. If it could not renew the token, the reasons come through the `silentRenewError` event.
    // They go to "Copy details" of `AuthErrorPopup`, so the support team sees why the session was lost
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

/** The 401 response that the backend would give. `data`: the reasons, the support team sees them in "Copy details" of the popup */
function unauthorized(rqConfig: InternalAxiosRequestConfig, reason: unknown) {
    return new AxiosError('Session has expired: token refresh failed', AxiosError.ERR_BAD_REQUEST, rqConfig, undefined, {
        status: 401,
        statusText: 'Unauthorized',
        data: String((reason as Error | undefined)?.message ?? ''),
        headers: {},
        config: rqConfig
    } as AxiosResponse)
}
