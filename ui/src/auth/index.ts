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

        const appBaseUrl = window.location.origin + '/ui/#/'

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
}
