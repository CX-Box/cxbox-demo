import { Log, UserManager, WebStorageStateStore, UserManagerSettings } from 'oidc-client-ts'
import axios from 'axios'
import { OIDC_REQUEST_TIMEOUT_SECONDS, SILENT_REQUEST_TIMEOUT_SECONDS, userManagerOfThisBrowser } from '@constants'
import { browserRefreshTokenLock, RotationSafeUserManager } from './rotationSafeUserManager'

Log.setLogger(console)

/** A timeout set on the stand counts when it is a positive number (it may arrive as a string) */
const seconds = (fromStand: unknown, byDefault: number) => (Number(fromStand) > 0 ? Number(fromStand) : byDefault)

export class Auth {
    private static _instance: UserManager | null = null

    private constructor() {}

    private static _initializing: Promise<UserManager> | null = null

    /**
     * Single flight: the check of `_instance` used to stand before the request for the settings and the assignment after it, so two
     * callers that started together both built a UserManager and both went through the sign in. Now they share one initialization.
     */
    public static init(url: string) {
        if (!Auth._initializing) {
            Auth._initializing = Auth.create(url).catch(error => {
                Auth._initializing = null // a failure is not remembered: the next sign in asks for the settings again
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

        // A browser without IndexedDB cannot lock a refresh token: it gets plain oidc-client-ts as well, whatever the constant says
        if (userManagerOfThisBrowser() === 'original' || !(await browserRefreshTokenLock.isAvailable())) {
            // the settings above and plain oidc-client-ts: exactly as before 3.0.2
            Auth._instance = new UserManager(oidcConfig)
            return Auth._instance
        }
        // The stand can make a timeout longer, but cannot remove it: without a timeout a request to the provider can wait forever
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
