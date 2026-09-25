import { SigninSilentArgs, User, UserManager, UserManagerSettings, UseRefreshTokenArgs } from 'oidc-client-ts'
import { browserRefreshTokenLock, RefreshTokenLock } from './refreshTokenLock'

/**
 * {@link RotationSafeUserManager.getUser} renews a token that expires in this time or sooner. As `updateToken(5)` of keycloak-js
 */
const MIN_VALIDITY_SECONDS = 5

/**
 * How long the hidden iframe with the SSO cookie may take. It loads two pages: of the provider and of
 * `silent_redirect_uri`. If the provider forbids frames, only this timeout ends the wait
 */
const IFRAME_TIMEOUT_SECONDS = 30

/**
 * How long a tab waits for the tokens that another tab stores: a write of another tab to localStorage arrives
 * with a small delay
 */
const WAIT_FOR_OTHER_TAB_SECONDS = 1

const WARNINGS = {
    burnt: 'Token renewal: the refresh token is burnt. It was sent, but no new token came',
    iframeFailed: 'Token renewal: the hidden iframe with the SSO cookie failed',
    noMetadata: 'Token renewal: the provider metadata did not load, so nothing was sent'
}

/**
 * A {@link UserManager} of oidc-client-ts 3.5.0 that uses each refresh token at most once to get new tokens:
 * for all tabs of the browser and after a page reload. Every method of {@link UserManager} works with the same
 * arguments and returns the same kind of result. What differs and what it needs: README.md in this folder.
 */
export class RotationSafeUserManager extends UserManager {
    private renewal: Promise<User | null> | null = null

    /** oidc-client-ts raises the expiring event again after every `getUser()`: renew once per token */
    private renewedAhead?: string

    private stopRenewingAhead?: () => void

    /**
     * The defaults differ from oidc-client-ts, see "Compatibility" in README.md.
     *
     * @param refreshTokenLock replace it only with a lock that follows the rules of {@link RefreshTokenLock}
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
     * The renewal of oidc-client-ts runs in every tab and sends the same token again after a timeout,
     * so {@link renewAheadOfExpiry} runs instead
     */
    public override startSilentRenew(): void {
        this.stopSilentRenew()
        this.stopRenewingAhead = this.events.addAccessTokenExpiring(() => this.renewAheadOfExpiry())
    }

    /** {@link getUser} still renews a token that is about to expire */
    public override stopSilentRenew(): void {
        this.stopRenewingAhead?.()
        this.stopRenewingAhead = undefined
    }

    /**
     * First renews a token that expires in {@link MIN_VALIDITY_SECONDS} or less, so a request does not go with
     * an expired token. The call can wait for the provider. A failed renewal does not make it reject: it returns
     * the stored user.
     */
    public override async getUser(raiseEvent = false): Promise<User | null> {
        const user = await super.getUser(raiseEvent)
        if (!user || !expiresWithin(user, MIN_VALIDITY_SECONDS)) {
            return user
        }
        return this.signinSilent().catch(() => super.getUser(raiseEvent))
    }

    /** Calls made while a renewal runs get its result, and their arguments are ignored */
    public override signinSilent(args?: SigninSilentArgs): Promise<User | null> {
        this.renewal ??= this.renew(args).finally(() => (this.renewal = null))
        return this.renewal
    }

    /**
     * The three steps of "How it works" in README.md.
     *
     * A token is burnt when it was sent, but no new tokens came: the provider rejected it, a timeout, a lost
     * connection, F5, a closed tab. Nobody knows if the provider used it, so it is never sent again.
     *
     * There are no special cases. F5 during a renewal, a new tab instead of a closed one, a crashed tab: the tab is
     * at step 2, sees that the sender is gone, and goes to step 3.
     */
    private async renew(args?: SigninSilentArgs): Promise<User | null> {
        const stored = await super.getUser()
        if (!navigator.onLine) {
            return stored // offline a request would only burn the token
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
     * The SSO cookie of the provider gives new tokens without a password. This method asks in a hidden iframe, so
     * the user sees nothing. It works reliably only when the provider and the application are on the same site:
     * Safari and Firefox do not send cookies to an iframe of another site. A full page redirect always works,
     * but it reloads the page, so the application decides when to do it.
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
     * THE GUARD: a refresh token is sent only if this tab locked it. oidc-client-ts sends a refresh token for new
     * tokens only here, so nothing else needs the lock. With DPoP the retry with a nonce happens inside this call.
     *
     * @invariant each refresh token is sent to the provider at most once
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

    /** oidc-client-ts raises this event only in its own renewal, which is off here */
    private reportFailure(reasons: string) {
        void this.events._raiseSilentRenewError(new Error(reasons))
    }

    /** An error is ignored: the next {@link getUser} renews */
    private async renewAheadOfExpiry() {
        const user = await super.getUser()
        const aheadSeconds = this.settings.accessTokenExpiringNotificationTimeInSeconds ?? 60
        // the event is for the token that this tab saw last. Maybe another tab has already renewed it: then do nothing
        if (user && expiresWithin(user, aheadSeconds) && user.access_token !== this.renewedAhead) {
            this.renewedAhead = user.access_token
            await this.signinSilent().catch(() => undefined)
        }
    }

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
 * At step 2 a tab must know: is the sender still waiting for the provider, or is it gone? {@link RefreshTokenLock}
 * cannot tell: a lock lives longer than the page that made it. A Web Lock can: the browser releases it when the
 * page dies (F5, a closed tab, a crash). Everything works without Web Locks: then a tab waits
 * {@link WAIT_FOR_OTHER_TAB_SECONDS} and uses the SSO cookie.
 *
 * `limitMs` is for a frozen tab that holds the lock: then `work` does not run, and the tab uses the SSO cookie.
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
