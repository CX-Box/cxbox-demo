# RotationSafeUserManager

A `UserManager` of [oidc-client-ts](https://github.com/authts/oidc-client-ts) that uses each refresh token at most
once to get new tokens: for all tabs of the browser and after a page reload.

The folder depends only on oidc-client-ts 3.5.0 and the browser. Copy it into any project that uses oidc-client-ts.

## When you need it

You need it when the provider **rotates** refresh tokens: a token works once, and a second use looks like theft. The
provider rejects it and can close the whole session. Examples: Keycloak with "Revoke Refresh Token", Auth0, Okta,
Blitz. [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700) recommends rotation.

A plain `UserManager` can send the same refresh token twice:

- by two tabs at the same time, when the user is stored in `localStorage` and all tabs share one refresh token
  ([issue 430](https://github.com/authts/oidc-client-ts/issues/430));
- after F5 during a renewal;
- by a retry after a timeout.

The user sees 401 errors. Often only clearing the site data helps.

## Usage

```ts
import { UserManager, UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts'
import { browserRefreshTokenLock, RotationSafeUserManager } from './rotationSafeUserManager'

const settings: UserManagerSettings = {
    authority: 'https://sso.example.com/realms/app',
    client_id: 'app',
    redirect_uri: 'https://app.example.com/',
    silent_redirect_uri: 'https://app.example.com/',
    userStore: new WebStorageStateStore({ store: localStorage })
}

export async function createUserManager(): Promise<UserManager> {
    // without IndexedDB the lock cannot work: then use plain oidc-client-ts
    return (await browserRefreshTokenLock.isAvailable()) ? new RotationSafeUserManager(settings) : new UserManager(settings)
}
```

Then use the result as any `UserManager`.

The second argument of the constructor is the lock: `new RotationSafeUserManager(settings, refreshTokenLock)`. The
default is `browserRefreshTokenLock`. Replace it only with a lock that follows the rules of `RefreshTokenLock`, for
example in tests.

## Compatibility

`RotationSafeUserManager` extends `UserManager`. Every method of `UserManager` works with the same arguments and
returns the same kind of result. No method is removed or added. Code that works with `UserManager` keeps working if
the [requirements](#requirements) are met.

Only this differs:

| | `UserManager` | `RotationSafeUserManager` |
|---|---|---|
| A refresh token | Every tab sends it. It is sent again after F5 or a timeout | It is sent at most once for all tabs |
| `signinSilent()` while a renewal runs | Starts one more renewal | Returns the running renewal. Its arguments are ignored |
| The refresh token did not work | `signinSilent()` rejects | First tries the hidden iframe with the SSO cookie, then rejects |
| The browser is offline | `signinSilent()` sends the request and rejects | `signinSilent()` sends nothing and returns the stored user |
| `getUser()` | Returns the stored user, even with an expired token | First renews a token that expires in 5 seconds or less. The call can wait for the provider |
| `automaticSilentRenew` | Renews the token in every tab. Retries after a timeout (`maxSilentRenewTimeoutRetries`) | Renews the token once for all tabs. No retries: the next `getUser()` renews |
| The `silentRenewError` event | Only from `automaticSilentRenew` | From every failed renewal, also from `getUser()` and `signinSilent()` |
| Timeout of the refresh token request, `silentRequestTimeoutInSeconds` | `requestTimeoutInSeconds` if it is set, otherwise 10 seconds | `accessTokenExpiringNotificationTimeInSeconds` minus 10, at least 10: 50 seconds by default |
| Timeout of the hidden iframe | `silentRequestTimeoutInSeconds` | Always 30 seconds |
| Timeout of other requests, `requestTimeoutInSeconds` | None: a request can wait forever | 60 seconds |

The settings that you pass replace these defaults. `settings.automaticSilentRenew` of the instance is always false:
the class runs its own renewal instead. The first `getUser()` or sign in starts it.

## Requirements

1. **oidc-client-ts 3.5.0**, pinned in `package.json` (no `^`), and TypeScript 4.3 or newer. The class overrides the
   protected method `_useRefreshToken`. If a new version renames it, the TypeScript check fails. The build must check
   types: Vite and esbuild do not do it. Other changes of oidc-client-ts are not caught, so update the version only
   together with a check of this class.
2. **IndexedDB**: the locks are stored there. Call `browserRefreshTokenLock.isAvailable()` at start, as in
   [Usage](#usage). Without IndexedDB the class never sends a refresh token, and every renewal uses the SSO cookie.
3. **The user store is `localStorage`**: `userStore: new WebStorageStateStore({ store: localStorage })`. Then a tab
   gets the tokens that another tab stored. With another store the class is still safe, but a tab does not see the
   tokens of other tabs and renews with the SSO cookie more often.
4. **One user manager for the provider and client.** Do not create a plain `UserManager` or another OIDC library for
   the same `authority` and `client_id`: it sends refresh tokens without the lock. An ESLint rule
   `no-restricted-imports` that allows oidc-client-ts only in the code of the sign in helps to keep it.
5. **A refresh token lives less than 30 days.** Locks older than 30 days are deleted, and then the token could be
   sent again. Offline tokens (`offline_access`) can live longer.
6. **For the SSO cookie**, optional. It is needed after a failed renewal and for a provider without refresh tokens:
   - `silent_redirect_uri` is a page of your application that calls `userManager.signinCallback()`;
   - this page can be shown in a frame of your site: no `X-Frame-Options: DENY`, no `frame-ancestors 'none'`;
   - the provider allows its pages in a frame of your site;
   - the provider and the application are on the same site (`app.corp.com` and `sso.corp.com`): Safari and Firefox
     do not send cookies to a frame of another site.

   Without it a failed renewal cannot be repaired silently, see [If something goes wrong](#if-something-goes-wrong).
7. **Web Locks**, optional: they exist only on https and localhost. Without them a tab does not wait for another tab
   that is renewing, see [If something goes wrong](#if-something-goes-wrong).

## If something goes wrong

Every problem writes a warning to the browser console. When a renewal fails, `userManager.events.addSilentRenewError()`
gets the reasons. We recommend: show these reasons to the support team.

The warnings:

- **"Token renewal: the refresh token is burnt. It was sent, but no new token came".** The provider rejected the token,
  or its answer did not come: a timeout, a lost connection, F5, a closed tab. Nobody knows if the provider used the
  token, so it is never sent again. The session continues with the SSO cookie. Nothing to do.
- **"Token renewal: the hidden iframe with the SSO cookie failed".** The SSO cookie did not help. `signinSilent()`
  rejects. `getUser()` returns the stored user, and its token expires in 5 seconds or less. We recommend: call
  `signinRedirect()`, the user signs in again.
- **"Token renewal: the provider metadata did not load, so nothing was sent".** The provider is not reachable. The
  refresh token was not sent and is still good. Nothing to do: the next `getUser()` tries again.
- **"Token renewal: the refresh token lock is not available, so the refresh token is not sent".** IndexedDB is missing
  or does not work, for example in Firefox private mode before version 115. The "burnt" warning comes next, but this
  token was not sent. We recommend: create a plain `UserManager`, see [Usage](#usage).

Other cases:

- **If the provider does not answer**, then `getUser()` waits up to 81 seconds with the default settings: 50 seconds
  for the refresh token request, 1 second for another tab, 30 seconds for the hidden iframe. It waits longer if the
  provider metadata is not loaded yet or another tab is renewing. Keep it in mind if you call `getUser()` before
  every request.
- **If the provider is slow**, then a renewal longer than `silentRequestTimeoutInSeconds` burns the token. We
  recommend: make this setting as long as the provider needs, but shorter than
  `accessTokenExpiringNotificationTimeInSeconds`. The renewal starts that many seconds before the token expires and
  must end before it.
- **If the browser has no Web Locks** (plain http, usual for test servers), then a tab does not know if another tab
  is still renewing. It waits 1 second and renews with the SSO cookie itself. Without the hidden iframe it gets an
  expired user until the other tab stores the new tokens. It matters only when two tabs renew at the same time and the
  provider answers slower than 1 second. Nothing to do.
- **If the browser freezes a background tab**, then everything works as usual. After the tab wakes up, it finds the
  token locked and takes the tokens that another tab stored.

## How it works

**The rule.** Each refresh token is used at most once to get new tokens: for all tabs, after any page reload.

Two other requests also carry a refresh token, but they do not get new tokens with it: the token revocation
(`revokeTokens()`), and with DPoP the repeat of a request that the provider refused for a missing nonce.

**The guard** is a lock on every refresh token, shared by all tabs: `RefreshTokenLock` in
[refreshTokenLock.ts](./refreshTokenLock.ts). Nothing else protects the rule.

The default lock `browserRefreshTokenLock` stores the locks in the IndexedDB database `oidc.refresh-token-locks`.
Adding a key there is atomic for all tabs, and a committed record survives F5 and a browser crash.

The key is the SHA-256 hash of the token. On plain http the browser has no `crypto.subtle`, and the key is the token
itself. Records older than 30 days are deleted.

**The renewal**, `signinSilent()` in [rotationSafeUserManager.ts](./rotationSafeUserManager.ts):

1. The tab locks the token and sends it. New tokens come. Done.
2. The token is already locked: another tab sent it, or this tab before F5. The tab sends nothing and takes the
   tokens that the sender stored. Done.
3. No new tokens came. The token is **burnt**: it is never sent again. The session continues with the SSO cookie in a
   hidden iframe.

A Web Lock only helps at step 2. While the sender waits for the provider, it holds the Web Lock, and the browser
releases it when the page dies. So another tab waits for the sender, but not longer than
`silentRequestTimeoutInSeconds` plus 5 seconds. Without Web Locks the tab waits 1 second and then uses the SSO
cookie. The rule holds in both cases.

## Files

| File | What is inside |
|---|---|
| [rotationSafeUserManager.ts](./rotationSafeUserManager.ts) | The class `RotationSafeUserManager` |
| [refreshTokenLock.ts](./refreshTokenLock.ts) | The interface `RefreshTokenLock` and the lock `browserRefreshTokenLock` |
| [index.ts](./index.ts) | What the folder exports |
