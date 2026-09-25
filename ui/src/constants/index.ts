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
 * The second values of `USER_MANAGER` and `SIGN_IN_CALLBACK_DETECTION` are fallbacks, if the default one does not work
 * for a customer. The application only reads the localStorage keys below. They switch one browser without a rebuild:
 * the UI tests of cxbox-code-samples run some scenarios with both values, and the support team can switch one user
 * in the browser console. The key works after a page reload.
 *
 *     localStorage.setItem('cxbox.userManager', 'original')
 *     localStorage.setItem('cxbox.signInCallbackDetection', 'signInCallbackParam')
 */

function ofThisBrowser<T extends string>(key: string, values: readonly T[], buildConstant: T): T {
    try {
        const override = localStorage.getItem(key) as T | null
        return override !== null && values.includes(override) ? override : buildConstant
    } catch {
        return buildConstant
    }
}

/**
 * `USER_MANAGER`: which class works with the OIDC provider.
 *
 * - `rotationSafe`: `RotationSafeUserManager`, see `auth/rotationSafeUserManager/README.md`.
 * - `original`: plain `UserManager` of oidc-client-ts. It renews tokens only in the background, in every tab,
 *   so a request with an expired token opens `AuthErrorPopup`.
 *
 * A browser where IndexedDB does not open always gets `original`: `RotationSafeUserManager` keeps its locks there.
 */
export type UserManagerKind = 'rotationSafe' | 'original'

export const USER_MANAGER: UserManagerKind = 'rotationSafe'

export const userManagerOfThisBrowser = () => ofThisBrowser('cxbox.userManager', ['rotationSafe', 'original'] as const, USER_MANAGER)

/**
 * `AUTH_ERROR_MODE`: can the user close `AuthErrorPopup`, which opens after a 401 or 403 response.
 *
 * - `soft`: the cross closes it for `AUTH_ERROR_SNOOZE_SECONDS`, for example to copy unsaved data.
 * - `strict`: the popup has no cross.
 */
export type AuthErrorMode = 'soft' | 'strict'

export const AUTH_ERROR_MODE: AuthErrorMode = 'soft'

/**
 * `SIGN_IN_CALLBACK_DETECTION`: how the page learns that the provider returned the browser to it.
 *
 * - `oidcResponse`: by `state` with `code` or `error` in the URL. It is the OIDC protocol, and oidc-client-ts
 *   reads the same parameters.
 * - `signInCallbackParam`: by our parameter `sign_in_callback` from `redirect_uri`. It is after `#`, and a provider
 *   may drop it: then the return is not noticed.
 */
export type SignInCallbackDetection = 'oidcResponse' | 'signInCallbackParam'

export const SIGN_IN_CALLBACK_DETECTION: SignInCallbackDetection = 'oidcResponse'

export const signInCallbackDetectionOfThisBrowser = () =>
    ofThisBrowser('cxbox.signInCallbackDetection', ['oidcResponse', 'signInCallbackParam'] as const, SIGN_IN_CALLBACK_DETECTION)

/**
 * After the user closes AuthErrorPopup, it is not shown again for this long, even if more requests fail meanwhile
 */
export const AUTH_ERROR_SNOOZE_SECONDS = 30

/*
 * The timeouts of the requests to the OIDC provider. They are long on purpose: a refresh token request that is cut
 * short burns the refresh token. A server may set its own values in `/auth/oidc.json`.
 */

/**
 * The refresh token request. Less than 60 seconds: the renewal starts 60 seconds before the token expires
 * and must end while the old token still works
 */
export const SILENT_REQUEST_TIMEOUT_SECONDS = 50

/**
 * The other requests to the provider: the discovery document, the signing keys, the user info, the exchange
 * of a code for tokens, the token revocation. oidc-client-ts has no default for it
 */
export const OIDC_REQUEST_TIMEOUT_SECONDS = 60
