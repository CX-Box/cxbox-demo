import { ErrorResponse, User, UserManager } from 'oidc-client-ts'
import { AUTH_ERROR_MODE } from '@constants'
import { Auth } from './index'

/**
 * The only place the access token is renewed: the request interceptor, the websocket client and the "expiring" event of
 * oidc-client-ts all come here.
 *
 * With refresh token rotation a refresh token works once, so concurrent renewals are collapsed into one: within a tab by a shared
 * promise, across the tabs of the browser (they share localStorage) by a Web Lock. oidc-client-ts has neither guard, see
 * https://github.com/authts/oidc-client-ts/issues/430 and https://github.com/authts/oidc-client-ts/issues/1618.
 * Do not call `signinSilent()` anywhere else.
 */

/** A token that expires within this many seconds is renewed before the request, the margin of keycloak-js `updateToken(5)` */
export const TOKEN_MIN_VALIDITY_SECONDS = 5
export const TOKEN_REFRESH_ATTEMPTS = 3
export const TOKEN_REFRESH_RETRY_DELAY_MS = 1000
/** How long a tab waits for the renewal of another tab: longer than a renewal with all its retries */
export const LOCK_WAIT_MS = 15000

/** `invalid_grant`: refresh token revoked or expired, `login_required`: no SSO session. Nothing to retry */
const SESSION_OVER_ERRORS = ['invalid_grant', 'login_required']

/**
 * QA hook: `?token_renew_lock=off` in the url switches the lock off for the tab (kept in sessionStorage across the sign-in redirect).
 * The UI tests use it to reproduce the race the lock removes.
 */
const LOCK_SWITCH = 'token_renew_lock'
const lockSwitch = new URLSearchParams(window.location.search).get(LOCK_SWITCH)
if (lockSwitch) {
    sessionStorage.setItem(LOCK_SWITCH, lockSwitch)
}
const isLockEnabled = () => 'locks' in navigator && sessionStorage.getItem(LOCK_SWITCH) !== 'off'

const expiresWithin = (user: User, seconds: number) => user.expires_in !== undefined && user.expires_in <= seconds

const isSessionOver = (error: unknown) => error instanceof ErrorResponse && SESSION_OVER_ERRORS.includes(error.error ?? '')

/** One POST to the token endpoint per attempt. Technical failures are retried, a session that is over is not */
async function renewNow(attempt = 1): Promise<User | null> {
    try {
        return await Auth.getInstance().signinSilent()
    } catch (error) {
        if (attempt < TOKEN_REFRESH_ATTEMPTS && !isSessionOver(error)) {
            console.warn(
                `Failed to refresh the token (attempt ${attempt} of ${TOKEN_REFRESH_ATTEMPTS}), retrying in ${
                    TOKEN_REFRESH_RETRY_DELAY_MS / 1000
                }s`,
                error
            )
            await new Promise(resolve => setTimeout(resolve, TOKEN_REFRESH_RETRY_DELAY_MS))
            return renewNow(attempt + 1)
        }
        console.warn('Failed to refresh the token, or the session has expired', error)
        throw error
    }
}

/**
 * Cross-tab guard. The lock is keyed by client and user, so the tabs of one session queue up. Under the lock the stored token is
 * checked again: renewed by another tab meanwhile, it is used as is. No lock (an old browser, the QA hook) or no user: renew at once.
 */
async function renewUnderLock(): Promise<User | null> {
    const userManager = Auth.getInstance()
    const user = await userManager.getUser()
    if (!user?.profile.sub || !isLockEnabled()) {
        return renewNow()
    }

    const lockName = `cxbox.token-renewal:${userManager.settings.client_id}:${user.profile.sub}`
    const abort = new AbortController()
    const waiting = setTimeout(() => abort.abort(), LOCK_WAIT_MS)
    try {
        return await navigator.locks.request(lockName, { signal: abort.signal }, async () => {
            const stored = await userManager.getUser()
            if (stored && !expiresWithin(stored, userManager.settings.accessTokenExpiringNotificationTimeInSeconds)) {
                console.info('The token has already been renewed by another tab')
                return stored
            }
            return renewNow()
        })
    } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
            throw error
        }
        console.warn(`No token renewal lock within ${LOCK_WAIT_MS}ms, renewing without it`)
        return renewNow()
    } finally {
        clearTimeout(waiting)
    }
}

let renewal: Promise<User | null> | null = null

/** In-tab guard: callers that find the token expired at the same time share one renewal (keycloak-js had this queue, oidc-client-ts does not) */
export function renewTokenOnce(): Promise<User | null> {
    if (!renewal) {
        renewal = renewUnderLock().finally(() => {
            renewal = null
        })
    }
    return renewal
}

/** The stored user, renewed first when its token expires within `TOKEN_MIN_VALIDITY_SECONDS`. Rejects when the renewal failed for good */
export async function freshUser(): Promise<User | null> {
    const user = await Auth.getInstance().getUser()
    return user && !expiresWithin(user, TOKEN_MIN_VALIDITY_SECONDS) ? user : renewTokenOnce()
}

let renewedAhead: string | undefined

/**
 * Renewal ahead of expiry in place of the library's `automaticSilentRenew` (off in `auth/index.ts`): the same `accessTokenExpiring`
 * event, but through the shared renewal, so the tabs do not race. The event repeats every few seconds until expiry, hence one
 * renewal per token. A failure is only logged: the next request retries and shows the popup if the session is over.
 */
export function keepTokenFresh(userManager: UserManager) {
    if (AUTH_ERROR_MODE === 'legacy') {
        return
    }
    userManager.events.addAccessTokenExpiring(async () => {
        const user = await userManager.getUser()
        if (user && user.access_token !== renewedAhead) {
            renewedAhead = user.access_token
            await renewTokenOnce().catch(() => undefined)
        }
    })
}
