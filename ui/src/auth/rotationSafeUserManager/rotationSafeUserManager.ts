/** One class: {@link RotationSafeUserManager}. Depends only on oidc-client-ts, the browser and {@link RefreshTokenLock} */
import { SigninSilentArgs, User, UserManager, UserManagerSettings, UseRefreshTokenArgs } from 'oidc-client-ts'
import { browserRefreshTokenLock, RefreshTokenLock } from './refreshTokenLock'

/** {@link RotationSafeUserManager.getUser} renews a token that expires in this time or sooner. Same as `updateToken(5)` in keycloak-js */
const MIN_VALIDITY_SECONDS = 5

/**
 * How long {@link RotationSafeUserManager.renewWithCookie} waits for the hidden iframe. In this time the iframe loads the page
 * of the provider and then the page of {@link UserManagerSettings.silent_redirect_uri}. If the provider forbids frames, no
 * response comes, and only this timeout ends the wait.
 */
const IFRAME_TIMEOUT_SECONDS = 30

/** How long a tab waits for the tokens that another tab stores. A write from another tab arrives with a small delay */
const WAIT_FOR_OTHER_TAB_SECONDS = 1

/** The warnings in the browser console. Each one is written together with the error that caused it */
const WARNINGS = {
    burnt: 'Token renewal: the refresh token is burnt. It was sent, but no new token came',
    iframeFailed: 'Token renewal: the hidden iframe with the SSO cookie failed',
    noMetadata: 'Token renewal: the provider metadata did not load, so nothing was sent'
}

/**
 * A {@link UserManager} of oidc-client-ts that never sends the same refresh token twice. It does not depend on the
 * application that uses it.
 *
 * <h3>When you need it</h3>
 *
 * - The provider **rotates** refresh tokens: a token works once, and a second use looks like theft. The provider rejects
 *   it and can close the session. Keycloak with "Revoke Refresh Token", Blitz, Auth0, Okta.
 *   [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700) recommends rotation.
 * - The user is stored in localStorage, so all tabs share one token.
 *
 * Without this class the same token is sent twice: by two tabs at the same time
 * ([issue 430](https://github.com/authts/oidc-client-ts/issues/430)), after F5 during a renewal, or by a retry after a
 * timeout. The user sees 401 errors, and clearing the browser cache "helps".
 *
 * <h3>How to use</h3>
 *
 * ```
 * const userManager = new RotationSafeUserManager(settings)   // before: new UserManager(settings)
 * ```
 * No oidc-client-ts method is forbidden, replaced or added. Three things work better:
 *
 * - {@link RotationSafeUserManager.getUser} renews a token that is about to expire.
 * - {@link RotationSafeUserManager.signinSilent} sends a refresh token only once for all tabs.
 * - {@link UserManagerSettings.automaticSilentRenew} renews the token once for all tabs, not once in every tab.
 *   {@link RotationSafeUserManager.startSilentRenew} and {@link RotationSafeUserManager.stopSilentRenew} switch it on and
 *   off as before.
 *
 * Do not create a plain {@link UserManager} for the same provider and client: it has no guard.
 *
 * <h3>How it works</h3>
 *
 * **The invariant.** Each refresh token is sent to the provider at most once: for all tabs, after any page reload.
 *
 * **The guard** is {@link RefreshTokenLock}: a lock on every refresh token. All tabs share the locks.
 * ```
 * if (refreshTokenLock.tryLock(token)) send(token)   // returns true only once per token
 * else do not send                                    // another tab sent it: wait for its result
 * ```
 * In the code: {@link RotationSafeUserManager._useRefreshToken}. Nothing else protects the invariant.
 *
 * **The renewal**, see {@link RotationSafeUserManager.renew}:
 *
 * 1. The tab locks the token and sends it. New tokens come. Done.
 * 2. The token is already locked. The tab sends nothing and takes the tokens that the sender stored. Done.
 * 3. No new tokens came. The token is **burnt**: it is never sent again. The session continues with the SSO cookie,
 *    see {@link RotationSafeUserManager.renewWithCookie}.
 *
 * A Web Lock only removes delays at step 2, see {@link holdingWebLock}. It is not the guard.
 *
 * <h3>What you should do</h3>
 *
 * - **If the hidden iframe cannot work**, then after a burnt token {@link RotationSafeUserManager.signinSilent} rejects and
 *   {@link RotationSafeUserManager.getUser} returns an expired user. We recommend: call {@link UserManager.signinRedirect}.
 * - **If the provider is slow**, then a renewal longer than {@link UserManagerSettings.silentRequestTimeoutInSeconds}
 *   burns the token. The default here is {@link UserManagerSettings.accessTokenExpiringNotificationTimeInSeconds} minus 10:
 *   50 seconds. We recommend: keep it below that setting.
 * - **If a renewal fails**, then the console has a warning from {@link WARNINGS}, and `addSilentRenewError()` of
 *   {@link UserManager.events} gets the reasons. We recommend: show them to the support team.
 *
 * - **If the browser has no Web Locks** (plain http, usual for dev stands), then a tab does not wait for another tab that
 *   is renewing. It matters only when two tabs renew at the same time and the provider answers slower than
 *   {@link WAIT_FOR_OTHER_TAB_SECONDS} (1 second). Then the second tab renews with the SSO cookie itself. If the hidden
 *   iframe cannot work, the second tab gets an expired user until the first tab finishes. Nothing to do.
 * - **If the browser has no IndexedDB**, then the refresh token is never sent, and every renewal uses the SSO cookie.
 *   Without the hidden iframe the user must sign in again every time the access token expires. We recommend: ask
 *   {@link RefreshTokenLock.isAvailable} at start, and if it says no, create a plain {@link UserManager}.
 * - **If the browser freezes a background tab**, then everything works as usual. After the tab wakes up, it finds the
 *   token locked and takes the tokens that another tab stored.
 *
 * <h3>Requirements</h3>
 *
 * oidc-client-ts 3.5.0, pinned. {@link RotationSafeUserManager._useRefreshToken} overrides a protected method. If a new
 * version renames it, the TypeScript check fails, so the guard cannot stop working silently.
 */
export class RotationSafeUserManager extends UserManager {
    /** The renewal that is running now. Only one runs in a tab, and all callers share its result */
    private renewal: Promise<User | null> | null = null

    /** The access token for which the early renewal was already started. The event comes again after every `getUser()` */
    private renewedAhead?: string

    /** Set by {@link startSilentRenew}: removes the handler of the early renewal */
    private stopRenewingAhead?: () => void

    /**
     * Overrides the constructor of {@link UserManager}. Differs from oidc-client-ts:
     *
     * - Before: {@link UserManagerSettings.automaticSilentRenew} runs in every tab.
     *   {@link UserManagerSettings.silentRequestTimeoutInSeconds} is 10 seconds by default.
     *   {@link UserManagerSettings.requestTimeoutInSeconds} has no default, so a request can wait forever.
     * - Now: `automaticSilentRenew` renews the token once for all tabs. `silentRequestTimeoutInSeconds` is 50 seconds by
     *   default, because providers are often slow. `requestTimeoutInSeconds` is 60 seconds by default.
     *
     * @param refreshTokenLock the guard. Replace it only with an implementation that keeps the promises of {@link RefreshTokenLock}
     */
    constructor(settings: UserManagerSettings, private readonly refreshTokenLock: RefreshTokenLock = browserRefreshTokenLock) {
        super({
            // the renewal starts `accessTokenExpiringNotificationTimeInSeconds` before the token expires and must end before it
            silentRequestTimeoutInSeconds: Math.max((settings.accessTokenExpiringNotificationTimeInSeconds ?? 60) - 10, 10),
            requestTimeoutInSeconds: 60,
            ...settings,
            automaticSilentRenew: false
        })
        if (settings.automaticSilentRenew ?? true) {
            this.startSilentRenew()
        }
    }

    /**
     * Overrides {@link UserManager.startSilentRenew}. Differs from oidc-client-ts:
     *
     * - Before: it starts the renewal of oidc-client-ts. It runs in every tab and sends the same token again after a timeout.
     * - Now: it starts {@link renewAheadOfExpiry}.
     */
    public override startSilentRenew(): void {
        this.stopSilentRenew()
        this.stopRenewingAhead = this.events.addAccessTokenExpiring(() => this.renewAheadOfExpiry())
    }

    /**
     * Overrides {@link UserManager.stopSilentRenew}. Differs from oidc-client-ts:
     *
     * - Before: it stops the renewal of oidc-client-ts. It never starts here.
     * - Now: it stops {@link renewAheadOfExpiry}. {@link getUser} still renews a token that is about to expire.
     */
    public override stopSilentRenew(): void {
        this.stopRenewingAhead?.()
        this.stopRenewingAhead = undefined
    }

    /**
     * Overrides {@link UserManager.getUser}. Differs from oidc-client-ts:
     *
     * - Before: it returns the stored token, even if it expired a minute ago. Then the backend answers 401.
     * - Now: a token that expires in {@link MIN_VALIDITY_SECONDS} (5 seconds) or less is renewed first. The call can wait
     *   for the provider.
     *
     * It still never rejects. If the renewal fails, it returns the stored user, and {@link User.expired} shows the problem.
     * If nobody is signed in, it returns null immediately.
     */
    public override async getUser(raiseEvent = false): Promise<User | null> {
        const user = await super.getUser(raiseEvent)
        if (!user || !expiresWithin(user, MIN_VALIDITY_SECONDS)) {
            return user
        }
        return this.signinSilent().catch(() => super.getUser(raiseEvent))
    }

    /**
     * Overrides {@link UserManager.signinSilent}. Differs from oidc-client-ts:
     *
     * - Before: every caller in every tab sends the refresh token.
     * - Now: only one renewal runs in a tab, and the token is sent only once for all tabs. See {@link renew}.
     *
     * It still rejects if the session cannot be renewed. Offline it sends nothing and returns the stored user.
     */
    public override signinSilent(args?: SigninSilentArgs): Promise<User | null> {
        this.renewal ??= this.renew(args).finally(() => (this.renewal = null))
        return this.renewal
    }

    /**
     * The three steps of the renewal, see "How it works" in {@link RotationSafeUserManager}.
     *
     * A token is burnt when it was sent, but no new tokens came: the provider rejected it, a timeout, a lost connection,
     * F5, a closed tab. Nobody knows if the provider used it, so it is never sent again.
     *
     * There are no special cases. F5 during a renewal, a new tab instead of a closed one, a crashed tab: the tab is at
     * step 2, sees that the sender is gone, and goes to step 3.
     */
    private async renew(args?: SigninSilentArgs): Promise<User | null> {
        const stored = await super.getUser()
        if (!navigator.onLine) {
            return stored // the browser is offline: nothing is sent, so the token is not used
        }
        let refreshTokenFailure: unknown = 'there is no refresh token'
        if (stored?.refresh_token && !args?.forceIframeAuth) {
            // load the provider metadata BEFORE the token is locked: if the provider is down, no token is lost
            await this.metadataService.getMetadata().catch(error => {
                console.warn(WARNINGS.noMetadata, error)
                this.reportFailure(`Provider metadata: ${messageOf(error)}`)
                throw error
            })
            // the first load of the metadata takes time. If another tab has renewed the token meanwhile, nothing is left to do
            const renewedMeanwhile = await this.newerUser(stored, 0)
            if (renewedMeanwhile) {
                return renewedMeanwhile
            }
            try {
                // step 1, the guard is inside. The timeout is passed explicitly: oidc-client-ts overwrites the setting with `undefined`
                const timeout = args?.silentRequestTimeoutInSeconds ?? this.settings.silentRequestTimeoutInSeconds
                return await super.signinSilent({ ...args, silentRequestTimeoutInSeconds: timeout })
            } catch (error) {
                const theirs = await this.newerUser(stored) // step 2
                if (theirs) {
                    return theirs
                }
                refreshTokenFailure = error
                console.warn(WARNINGS.burnt, error) // step 3
            }
        }
        return this.renewWithCookie(refreshTokenFailure, args)
    }

    /**
     * The SSO session is a cookie that the provider saved in the browser at login. While it is valid, the provider issues
     * new tokens without a password. There are two ways to ask:
     *
     * - A hidden iframe with `prompt=none`. The user sees nothing. This method does it. It works only if the provider and
     *   the application are on the same site (app.corp.com and sso.corp.com): browsers do not send cookies to an iframe
     *   of another site.
     * - A full page redirect, {@link UserManager.signinRedirect}. The cookie is always sent. But the page reloads, so the
     *   application decides: at page load redirect immediately, during work ask the user first.
     *
     * If the iframe fails, this method rejects, and `silentRenewError` of {@link UserManager.events} gets both reasons.
     */
    private async renewWithCookie(refreshTokenFailure: unknown, args?: SigninSilentArgs): Promise<User | null> {
        try {
            return await super.signinSilent({ ...args, forceIframeAuth: true, silentRequestTimeoutInSeconds: IFRAME_TIMEOUT_SECONDS })
        } catch (error) {
            console.warn(WARNINGS.iframeFailed, error)
            this.reportFailure(`Refresh token: ${messageOf(refreshTokenFailure)}. Hidden iframe: ${messageOf(error)}`)
            throw error
        }
    }

    /**
     * THE GUARD. Overrides {@link UserManager._useRefreshToken}. Differs from oidc-client-ts:
     *
     * - Before: it sends the refresh token.
     * - Now: it first locks the token with {@link RefreshTokenLock}. If the token is already locked, it is not sent.
     *
     * oidc-client-ts calls this method from `signinSilent()`, and nothing else in it asks for new tokens with a refresh
     * token. With DPoP it repeats the request inside this call, if the provider refused the first one and asked for a nonce.
     *
     * @invariant each refresh token is sent to the provider at most once
     * @guardedBy refreshTokenLock
     */
    protected override async _useRefreshToken(args: UseRefreshTokenArgs): Promise<User> {
        const token = args.state.refresh_token
        const webLockName = `oidc.renewal:${this.settings.authority}:${this.settings.client_id}`
        const requestTimeoutMs = ((args.timeoutInSeconds ?? 10) + 5) * 1000

        return holdingWebLock(webLockName, requestTimeoutMs, async () => {
            const isFirstSender = await this.refreshTokenLock.tryLock(token)
            if (!isFirstSender) {
                throw new Error('This refresh token was already sent')
            }
            const user = await super._useRefreshToken(args)
            if (user.refresh_token === token) {
                await this.refreshTokenLock.unlock(token) // the provider does not rotate tokens: the same token can be used next time
            }
            return user
        })
    }

    /** The application gets the reasons through `addSilentRenewError()` of {@link UserManager.events} and can show them to the support team */
    private reportFailure(reasons: string) {
        void this.events._raiseSilentRenewError(new Error(reasons))
    }

    /** Replaces `automaticSilentRenew` of oidc-client-ts. An error is ignored here: the next {@link getUser} tries again */
    private async renewAheadOfExpiry() {
        const user = await super.getUser()
        const aheadSeconds = this.settings.accessTokenExpiringNotificationTimeInSeconds ?? 60
        // the event is for the token that this tab saw last. Maybe another tab has already renewed it: then do nothing
        if (user && expiresWithin(user, aheadSeconds) && user.access_token !== this.renewedAhead) {
            this.renewedAhead = user.access_token
            await this.signinSilent().catch(() => undefined)
        }
    }

    /** Returns the user that another tab stored instead of `than`. Waits up to {@link WAIT_FOR_OTHER_TAB_SECONDS} */
    private async newerUser(than: User, waitSeconds = WAIT_FOR_OTHER_TAB_SECONDS): Promise<User | null> {
        for (let waitedMs = 0; ; waitedMs += 100) {
            const user = await super.getUser()
            if (user && user.access_token !== than.access_token) {
                return user
            }
            if (waitedMs >= waitSeconds * 1000) {
                return null
            }
            await new Promise(resolve => setTimeout(resolve, 100))
        }
    }
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

const expiresWithin = (user: User, seconds: number) => user.expires_in !== undefined && user.expires_in <= seconds

/**
 * Runs `work` while holding a Web Lock. The lock only removes delays: everything works without it, and the invariant holds.
 *
 * At step 2 of the renewal a tab wants to know: is the sender still waiting for the response, or is it gone?
 * {@link RefreshTokenLock} cannot answer: it lives longer than the page that locked the token. A Web Lock can: all tabs see it,
 * and the browser releases it when the page dies (F5, closed tab, crash).
 *
 * - **If the browser has no Web Locks** (plain http, usual for dev stands), then `work` runs immediately. A tab at step 2
 *   does not know if the sender is alive. It waits {@link WAIT_FOR_OTHER_TAB_SECONDS} (1 second) and uses the SSO cookie.
 *   With a slower provider it is too early: see "What you should do" in {@link RotationSafeUserManager}.
 * - **If a frozen tab holds the lock** longer than `limitMs`, then the promise rejects, and `work` does not run: the tab
 *   uses the SSO cookie. It is rare: Chrome does not freeze a tab that holds a Web Lock.
 */
function holdingWebLock<T>(lockName: string, limitMs: number, work: () => Promise<T>): Promise<T> {
    if (!('locks' in navigator)) {
        return work()
    }
    const limit = new AbortController()
    const timer = setTimeout(() => limit.abort(), limitMs)
    return navigator.locks.request(lockName, { signal: limit.signal }, () => {
        clearTimeout(timer)
        return work()
    })
}
