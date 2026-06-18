import { Log, UserManager, WebStorageStateStore, UserManagerSettings } from 'oidc-client-ts'
import axios from 'axios'

Log.setLogger(console)

export class Auth {
    private static _instance: UserManager | null = null

    private constructor() {}

    public static async init(url: string) {
        if (Auth._instance) {
            throw new Error(`UserManager is already initialized`)
        }
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

        Auth._instance = new UserManager(oidcConfig)
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
