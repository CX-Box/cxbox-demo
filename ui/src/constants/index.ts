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
    }
} as const

export const FIELD_DISABLED_COLOR = '#141F35'
export const WHEN_EDITABLE_FIELD_IS_DISABLED_THEN_FONT_OPACITY = 1

/**
 * How the frontend reacts to 401/403 responses.
 *
 * - `legacy`: cxbox-ui core behaviour. 401 silently dispatches `logoutDone` (widgets stay empty), 403 opens the generic error popup
 *   and an expired access token is sent as is (the backend answers 401, core dispatches logoutDone).
 * - `soft`: AuthErrorPopup offers to sign in again. "Yes" logs out (same as the "Log out" button), "No" continues at own risk
 *   and snoozes the popup for `AUTH_ERROR_SNOOZE_SECONDS`. A failed token refresh is reported as 401 too.
 * - `strict`: same popup, but the only option is to sign in again.
 */
export type AuthErrorMode = 'legacy' | 'soft' | 'strict'

export const AUTH_ERROR_MODE: AuthErrorMode = 'soft'

/**
 * After "No" in AuthErrorPopup the popup is not shown again for this long, even if more requests fail meanwhile
 */
export const AUTH_ERROR_SNOOZE_SECONDS = 30
