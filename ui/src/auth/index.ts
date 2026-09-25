import { Log, UserManager, WebStorageStateStore, UserManagerSettings } from 'oidc-client-ts'
import axios from 'axios'
import { OIDC_REQUEST_TIMEOUT_SECONDS, SILENT_REQUEST_TIMEOUT_SECONDS, userManagerOfThisBrowser } from '@constants'
import { browserRefreshTokenLock, RotationSafeUserManager } from './rotationSafeUserManager'

Log.setLogger(console)

/** Zero does not switch a timeout off: without a timeout a request to the provider can wait forever */
const seconds = (fromStand: unknown, byDefault: number) => (Number(fromStand) > 0 ? Number(fromStand) : byDefault)

export class Auth {
    private static _instance: UserManager | null = null

    private constructor() {}

    private static _initializing: Promise<UserManager> | null = null

    /**
     * A singleton per page, also for calls made at the same time.
     * Two plain UserManagers in one page would send the same refresh token twice
     */
    public static init(url: string) {
        if (!Auth._initializing) {
            Auth._initializing = Auth.create(url).catch(error => {
                Auth._initializing = null
                throw error
            })
        }
        return Auth._initializing
    }

    private static async create(url: string) {
        const { data } = await axios.get(url)

        const appBasePath = '/ui/#/'
        const appBaseUrl = window.location.origin + appBasePath

        const oidcConfig: UserManagerSettings = {
            authority: data['authority'] || '',
            client_id: data['client_id'] || '',
            redirect_uri: `${appBaseUrl}?sign_in_callback=redirect`,
            silent_redirect_uri: `${appBaseUrl}?sign_in_callback=silent`,
            post_logout_redirect_uri: appBaseUrl,
            silentRequestTimeoutInSeconds: 30,
            scope: 'openid profile',
            ...data,
            userStore: new WebStorageStateStore({ store: localStorage })
        }

        // RotationSafeUserManager keeps its locks in IndexedDB. Where IndexedDB does not work, the plain UserManager
        // is used: it renews tokens, only without the lock
        if (userManagerOfThisBrowser() === 'original' || !(await browserRefreshTokenLock.isAvailable())) {
            Auth._instance = new UserManager(oidcConfig)
            return Auth._instance
        }
        oidcConfig.silentRequestTimeoutInSeconds = seconds(data['silentRequestTimeoutInSeconds'], SILENT_REQUEST_TIMEOUT_SECONDS)
        oidcConfig.requestTimeoutInSeconds = seconds(data['requestTimeoutInSeconds'], OIDC_REQUEST_TIMEOUT_SECONDS)
        Auth._instance = new RotationSafeUserManager(oidcConfig)
        return Auth._instance
    }

    public static getInstance() {
        if (!Auth._instance) {
            throw new Error('UserManager is not initialized')
        }
        return Auth._instance
    }

    public static get signInCallbackParam(): string | null {
        let params = new URLSearchParams(window.location.search)
        let param = params.get('sign_in_callback')

        if (param) {
            return param
        }

        const hashQueryString = window.location.hash.split('?')[1] as string | undefined
        if (hashQueryString?.length) {
            params = new URLSearchParams(hashQueryString)
            param = params.get('sign_in_callback')
        }

        return param
    }
}
