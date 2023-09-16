import { Api as CXBoxApi, buildUrl } from '@cxbox-ui/core'
import { BcCountParamsMap, BcCountResponse } from '../interfaces/bcCount'
import { keycloak, KEYCLOAK_MIN_VALIDITY } from '../keycloak'
import { LoginResponse } from '@cxbox-ui/core/interfaces'
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { __API__ } from "@constants"

class Api extends CXBoxApi {
    fetchBcCount(bcName: string, params: BcCountParamsMap = {}) {
        const url = buildUrl`count/dashboard/` + bcName
        const stringParams = new URLSearchParams()
        if (params) {
            Object.keys(params).forEach(i => {
                let value = params[i]
                if (Array.isArray(value)) {
                    value = `[${value.reduce((acc, cur, index) => {
                        if (!index) {
                            return acc + `"${cur}"`
                        } else {
                            return `${acc},"${cur}"`
                        }
                    }, '')}]`
                }
                stringParams.set(i, value)
            })
        }
        return this.api$.get<BcCountResponse>(url + (stringParams && `?${stringParams}`))
    }

    getBasicAuthRequest(login?: string, password?: string) {
        const hash = login && Buffer.from(`${login}:${password}`).toString('base64') //TODO delete?
        const tzOffset = -new Date().getTimezoneOffset() * 60
        const entrypointUrl = `/${window.location.hash}`
        const config: AxiosRequestConfig = hash
            ? { headers: { Authorization: `Basic ${hash}` } }
            : { headers: { Authorization: `Bearer ${keycloak.token}` } }
        return this.api$.get<LoginResponse>(buildUrl`login?_tzoffset=${tzOffset}&_entrypointUrl=${entrypointUrl}`, config)
    }
}

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

const __AJAX_TIMEOUT__ = 900000
const __CLIENT_ID__: number = Date.now()

const HEADERS = { Pragma: 'no-cache', 'Cache-Control': 'no-cache, no-store, must-revalidate' }

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
export const CxBoxApiInstance = new Api(instance)
