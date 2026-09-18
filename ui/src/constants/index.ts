export * from './api'

export const EMPTY_OBJECT = {}
export const EMPTY_ARRAY: unknown[] = []

export const opacitySuffix = '33'

export const NAVIGATION_LEVEL_SCREEN = 0

export const FIELDS = {
    TECHNICAL: {
        ID: 'id'
    },
    MASS_OPERATION: {
        ERROR_MESSAGE: 'errorMessage',
        MASS_IDS: 'massIds_'
    },
    TREE: {
        PARENT_ID: 'parentId',
        IS_LEAF: 'isLeaf'
    }
} as const

export const FIELD_DISABLED_COLOR = '#141F35'
export const WHEN_EDITABLE_FIELD_IS_DISABLED_THEN_FONT_OPACITY = 1

/*
 * The three switches of the authorization. They do not depend on each other, and the application works with any combination.
 *
 * `USER_MANAGER` and `SIGN_IN_CALLBACK_DETECTION` are the ways back to the behaviour before 3.0.2. One browser can be switched
 * without a rebuild, by a key of localStorage: the autotests compare the two values of each this way, and the support team can
 * switch one user. Then reload the page; `removeItem()` brings the build constant back.
 *
 *     localStorage.setItem('cxbox.userManager', 'original')
 *     localStorage.setItem('cxbox.signInCallbackDetection', 'signInCallbackParam')
 */

/** The value of the key in localStorage if it is one of `values`, otherwise the build constant */
function ofThisBrowser<T extends string>(key: string, values: readonly T[], buildConstant: T): T {
    try {
        const override = localStorage.getItem(key) as T | null
        return override !== null && values.includes(override) ? override : buildConstant
    } catch {
        return buildConstant // localStorage is not available
    }
}

/**
 * Which class works with the OIDC provider, see `auth/index.ts`.
 *
 * - `rotationSafe`: `RotationSafeUserManager`. It never sends the same refresh token twice, and it renews a token that is
 *   about to expire before a request. See `auth/rotationSafeUserManager`.
 * - `original`: `UserManager` of oidc-client-ts with the settings as before 3.0.2. Set it if `RotationSafeUserManager` fails.
 *   The token is renewed only in the background, in every tab. A request with an expired token opens `AuthErrorPopup`.
 *
 * A browser without IndexedDB always gets `original`: `RotationSafeUserManager` keeps its locks there. "Copy details" of
 * an error popup shows it as `indexedDb: false`.
 */
export type UserManagerKind = 'rotationSafe' | 'original'

export const USER_MANAGER: UserManagerKind = 'rotationSafe'

/** {@link USER_MANAGER}, or the key `cxbox.userManager` of localStorage */
export const userManagerOfThisBrowser = () => ofThisBrowser('cxbox.userManager', ['rotationSafe', 'original'] as const, USER_MANAGER)

/**
 * `AuthErrorPopup` opens after a 401 or 403 response and offers "Sign in again" and "Sign out".
 *
 * - `soft`: the user can close it, for example to copy unsaved data. Then it does not come back for `AUTH_ERROR_SNOOZE_SECONDS`.
 * - `strict`: the popup cannot be closed.
 */
export type AuthErrorMode = 'soft' | 'strict'

export const AUTH_ERROR_MODE: AuthErrorMode = 'soft'

/**
 * How the page learns at load that the provider returned the browser to it, see `isReturnFromProvider` in `auth/platformSession.ts`.
 *
 * - `oidcResponse`, the new way: by the response of the provider in the URL, `state` with `code` or `error`. It is the OIDC
 *   protocol, and oidc-client-ts reads the same parameters.
 * - `signInCallbackParam`, the old way, as before 3.0.2: by our parameter `sign_in_callback` from `redirect_uri`. It is
 *   after `#`, and a provider may drop it: then the return is not noticed.
 *
 * Set `signInCallbackParam` to get the old behaviour back.
 */
export type SignInCallbackDetection = 'oidcResponse' | 'signInCallbackParam'

export const SIGN_IN_CALLBACK_DETECTION: SignInCallbackDetection = 'oidcResponse'

/** {@link SIGN_IN_CALLBACK_DETECTION}, or the key `cxbox.signInCallbackDetection` of localStorage */
export const signInCallbackDetectionOfThisBrowser = () =>
    ofThisBrowser('cxbox.signInCallbackDetection', ['oidcResponse', 'signInCallbackParam'] as const, SIGN_IN_CALLBACK_DETECTION)

/**
 * After "No" in AuthErrorPopup the popup is not shown again for this long, even if more requests fail meanwhile
 */
export const AUTH_ERROR_SNOOZE_SECONDS = 30

/*
 * The waits of the authorization, see `auth/rotationSafeUserManager`. None of them guards anything: a refresh token is never sent twice
 * whatever the timeouts are, they only keep a request from hanging for ever. So they are generous - a provider that takes a
 * minute to answer is slow, not broken, and a request cut short is a session thrown away. A stand may make the two settings of
 * the UserManager longer (`requestTimeoutInSeconds`, `silentRequestTimeoutInSeconds` of `/auth/oidc.json`), but not remove them.
 */

/**
 * `silentRequestTimeoutInSeconds` of the UserManager: the request with the refresh token. Under a minute on purpose: the renewal
 * starts 60 seconds before the token expires, and a renewal that did not work out has to be known while the old token still works
 */
export const SILENT_REQUEST_TIMEOUT_SECONDS = 50

/**
 * `requestTimeoutInSeconds` of the UserManager, which the library declares without a default: the discovery document of the
 * provider (`.well-known/openid-configuration`), its signing keys, the exchange of a code for tokens at sign in, the logout.
 */
export const OIDC_REQUEST_TIMEOUT_SECONDS = 60
