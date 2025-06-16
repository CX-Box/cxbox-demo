import { __API__ } from '../constants'
import { Api as CoreApi } from '../core/data/Api.ts'
import { CreateAxiosDefaults, InternalAxiosRequestConfig } from 'axios'
import { keycloak, KEYCLOAK_MIN_VALIDITY } from '../security'

export class ExtApi extends CoreApi {}

function tokenInterceptor(rqConfig: InternalAxiosRequestConfig) {
    return keycloak.updateToken(KEYCLOAK_MIN_VALIDITY).then(() => {
        return {
            ...rqConfig,
            headers: {
                ...rqConfig.headers,
                Authorization: `Bearer ${keycloak.token}`
            }
        } as InternalAxiosRequestConfig
    })
}

const __AJAX_TIMEOUT__ = 900_000
const __CLIENT_ID__: number = Date.now()

const HEADERS = { Pragma: 'no-cache', 'Cache-Control': 'no-cache, no-store, must-revalidate' }

const config: CreateAxiosDefaults = {
    baseURL: __API__,
    timeout: __AJAX_TIMEOUT__,
    responseType: 'json',
    headers: {
        ...HEADERS,
        ...{ ClientId: __CLIENT_ID__ }
    }
}

export const Api = new ExtApi(config)

if (!import.meta.env.NO_SSO) {
    Api.axios.interceptors.request.use(tokenInterceptor, () => Promise.reject())
}
