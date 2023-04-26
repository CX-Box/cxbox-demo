import { axiosGet, buildUrl } from '@cxbox-ui/core'
import { LoginResponse } from '@cxbox-ui/core/interfaces/session'
import axios, { AxiosRequestConfig } from 'axios'
import { keycloak, KEYCLOAK_MIN_VALIDITY } from '../keycloak'
import { __API__ } from '../constants/constants'

const __AJAX_TIMEOUT__ = 900000
const __CLIENT_ID__: number = Date.now()

export const HEADERS = { Pragma: 'no-cache', 'Cache-Control': 'no-cache, no-store, must-revalidate' }

export function getBasicAuthRequest(login?: string, password?: string) {
    const hash = login && new Buffer(`${login}:${password}`).toString('base64') //TODO delete?
    const tzOffset = -new Date().getTimezoneOffset() * 60
    const entrypointUrl = `/${window.location.hash}`
    return axiosGet<LoginResponse>(
        buildUrl`login?_tzoffset=${tzOffset}&_entrypointUrl=${entrypointUrl}`,
        hash ? { headers: { Authorization: `Basic ${hash}` } } : { headers: { Authorization: `Bearer ${keycloak.token}` } }
    )
}

function tokenInterceptor(rqConfig: AxiosRequestConfig) {
    return keycloak.updateToken(KEYCLOAK_MIN_VALIDITY).then(() => {
        return {
            ...rqConfig,
            headers: {
                ...rqConfig.headers,
                Authorization: `Bearer ${keycloak.token}`
            }
        }
    })
}

export function axiosInstance() {
    const instance = axios.create({
        baseURL: __API__,
        timeout: __AJAX_TIMEOUT__,
        responseType: 'json',
        headers: {
            ...HEADERS,
            ...{ ClientId: __CLIENT_ID__ }
        }
    })
    instance.interceptors.request.use(tokenInterceptor, () => Promise.reject())
    return instance
}
