import { Log, UserManager, WebStorageStateStore } from 'oidc-client-ts'
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

        const appBaseUrl = window.location.origin

        const oidcConfig = {
            authority: data['authority'] || '',
            client_id: data['client_id'] || '',
            redirect_uri: data['redirect_uri'] || `${appBaseUrl}?sign_in_callback=redirect`,
            ...data,
            silent_redirect_uri: `${appBaseUrl}?sign_in_callback=silent`,
            post_logout_redirect_uri: appBaseUrl,
            silentRequestTimeoutInSeconds: 30,
            scope: 'openid profile',
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

// let userManager: UserManager | null = null
//
// export const initUserManager = async () => {
//     if (userManager) {
//         return userManager
//     }
//
//     const { data } = await axios.get('/api/v1/auth/oidc.json')
//
//     const appBaseUrl = window.location.origin
//
//     const oidcConfig = {
//         authority: `${data['auth-server-url']}/realms/${data.realm}`,
//         client_id: data.resource,
//         redirect_uri: `${appBaseUrl}?sign_in_callback=redirect`,
//         silent_redirect_uri: `${appBaseUrl}?sign_in_callback=silent`,
//         post_logout_redirect_uri: appBaseUrl,
//         silentRequestTimeoutInSeconds: 30,
//         scope: 'openid profile',
//         userStore: new WebStorageStateStore({ store: localStorage })
//     }
//
//     userManager = new UserManager(oidcConfig)
//     return userManager
// }
