import { Api as CXBoxApi, utils } from '@cxbox-ui/core'
import { BcCountParamsMap, BcCountResponse } from '@interfaces/bcCount'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { __API__, AUTH_ERROR_MODE } from '@constants'
import { NotificationCheckNewResponse, NotificationCountResponse, NotificationsResponse } from '@interfaces/notification'
import { fileControllerMapping } from '@constants/notification'
import { LoginResponse } from '@interfaces/session'
import { TableSettingsItem } from '@interfaces/tableSettings'
import { FilterGroup, FilterType } from '@interfaces/filters'
import { saveAs } from 'file-saver'
import { getFileNameFromDisposition } from '@utils/getFileNameFromDisposition'
import { map, Observable } from 'rxjs'
import { Auth } from '../auth'
import { freshUser } from '../auth/tokenRenewal'

class Api extends CXBoxApi {
    loginByRoleRequest(role: string) {
        return super.loginByRoleRequest(role) as Observable<LoginResponse>
    }

    fetchBcCount(screenName: string, bcName: string, params: BcCountParamsMap = {}) {
        return this.api$
            .request<BcCountResponse>('get', utils.buildUrl`count/${screenName}/` + bcName, { params: params })
            .pipe(map(response => response.data))
    }

    getBasicAuthRequest(login?: string, password?: string) {
        const hash = login && btoa(`${login}:${password}`)
        const tzOffset = -new Date().getTimezoneOffset() * 60
        const entrypointUrl = `/${window.location.hash}`
        const config: AxiosRequestConfig = { headers: { Authorization: `Basic ${hash}` } }
        return this.api$
            .request<LoginResponse>('get', utils.buildUrl`login?_tzoffset=${tzOffset}&_entrypointUrl=${entrypointUrl}`, config)
            .pipe(map(response => response.data))
    }

    getNotificationList(page: number, limit: number) {
        const queryStringObject = {
            _page: page,
            _limit: limit
        }

        return this.api$
            .request<NotificationsResponse>('get', 'notification/get-notifications', { params: queryStringObject })
            .pipe(map(response => response.data))
            .toPromise()
    }

    getNotificationCount() {
        return this.api$
            .request<NotificationCountResponse>('get', 'notification/count-notifications')
            .pipe(map(response => response.data))
            .toPromise()
    }

    setNotificationsRead(selectedRowKeys: (number | string)[]) {
        return this.api$
            .request<any>('post', 'notification/mark-notification-as-read', { data: selectedRowKeys })
            .pipe(map(response => response.data))
            .toPromise()
    }

    checkNewNotification() {
        return this.api$
            .request<NotificationCheckNewResponse>('get', '/notification/check-new-notification')
            .pipe(map(response => response.data))
            .toPromise()
    }

    /**
     * Uses for creation endpoint if file downloading from websocket message
     *
     * @param link
     */
    getMessageDownloadFileEndpoint(link: string) {
        const instance = this.api$.instance

        return instance.defaults.baseURL?.endsWith('/')
            ? `${instance.defaults.baseURL}${fileControllerMapping}/${link}`
            : `${instance.defaults.baseURL}/${fileControllerMapping}/${link}`
    }

    deleteNotifications(selectedRowKeys: number[]) {
        return this.api$
            .request('delete', '/notification/delete-notification', {
                data: selectedRowKeys,
                headers: { 'Content-Type': 'application/json' }
            })
            .pipe(map(response => response.data))
    }

    createPersonalSetting(data: Omit<TableSettingsItem, 'id'>[]) {
        return this.api$
            .request<{
                success: boolean
                data: [
                    {
                        id: string
                        vstamp: number
                        view: string
                        widget: string
                    }
                ]
            }>('post', '/personalAdditionalFields', {
                data: {
                    data
                }
            })
            .pipe(map(response => response.data))
    }

    updatePersonalSetting(data: Omit<TableSettingsItem, 'id'>[]) {
        return this.api$
            .request<{
                success: boolean
                data: [
                    {
                        id: string
                        vstamp: number
                        view: string
                        widget: string
                    }
                ]
            }>('put', '/personalAdditionalFields', {
                data: {
                    data
                }
            })
            .pipe(map(response => response.data))
    }

    deletePersonalSetting(id: string) {
        return this.api$.request('delete', '/personalAdditionalFields', { data: { data: [id] } }).pipe(map(response => response.data))
    }

    saveFilterGroup(data: { filterGroups: FilterGroup[] }) {
        return this.api$
            .request<{ data: { id: string }[] }>('post', 'personalFilterGroups', {
                data: {
                    data: data || {}
                }
            })
            .pipe(map(response => response.data))
    }

    deleteFilterGroup(filterGroupId: number) {
        return this.api$
            .request<{ data: unknown }>('delete', `personalFilterGroups`, { data: [filterGroupId] })
            .pipe(map(response => response.data))
    }

    async getBlob(url: string, params: { preview: boolean }) {
        try {
            return await this.api$.instance.get(url, {
                baseURL: '',
                params,
                responseType: 'blob'
            })
        } catch (error: any) {
            const isBlobError = error.response?.data instanceof Blob && error.response.data.type?.includes('application/json')

            if (isBlobError) {
                try {
                    const text = await error.response.data.text()
                    error.response.data = JSON.parse(text)
                } catch {
                    console.warn('Failed to parse error blob:', error)
                }
            }

            throw error
        }
    }

    async saveBlob(url: string, filename?: string) {
        const response = await this.getBlob(url, { preview: false })
        const disposition = response.request.getResponseHeader('content-disposition')

        // TODO add parser for disposition
        saveAs(response.data, filename ?? getFileNameFromDisposition(disposition))

        return response
    }

    getFile(fileId: string) {
        return this.api$.instance.get('/file', { responseType: 'blob', params: { id: fileId } })
    }

    uploadFile(file: Blob, fileName: string) {
        const data = new FormData()
        data.append('file', file, fileName)

        return this.api$.instance.post('/file', data)
    }
}

/**
 * Behavior before 3.0.2 (`AUTH_ERROR_MODE = 'legacy'`): the stored token as is, even an expired one; renewal only by the library's timer
 */
function legacyTokenInterceptor(rqConfig: InternalAxiosRequestConfig) {
    return Auth.getInstance()
        .getUser()
        .then(user => {
            rqConfig.headers.Authorization = `Bearer ${user?.access_token}`
            return rqConfig
        })
}

/**
 * Token check before every request (as `keycloak.updateToken(5)` did): renewal only when needed, shared by all callers and tabs,
 * see `auth/tokenRenewal.ts`. A renewal that fails for good becomes a synthetic 401 for AuthErrorPopup.
 */
function tokenInterceptor(rqConfig: InternalAxiosRequestConfig) {
    if (AUTH_ERROR_MODE === 'legacy') {
        return legacyTokenInterceptor(rqConfig)
    }

    return freshUser()
        .then(user => {
            rqConfig.headers.Authorization = `Bearer ${user?.access_token}`
            return rqConfig
        })
        .catch(() => {
            throw new AxiosError('Session has expired: token refresh failed', AxiosError.ERR_BAD_REQUEST, rqConfig, undefined, {
                status: 401,
                statusText: 'Unauthorized',
                data: null,
                headers: {},
                config: rqConfig
            } as AxiosResponse)
        })
}

const __AJAX_TIMEOUT__ = 900000
const __CLIENT_ID__: number = Date.now()

/**
 * Per-tab client id sent as `ClientId` header with every request; also written to the copied error details
 */
export const CLIENT_ID = __CLIENT_ID__

export interface TimedRequestConfig extends InternalAxiosRequestConfig {
    /**
     * Timestamps taken around the request (before the token refresh started and when the error arrived); used by error popup details
     */
    requestStartedAt?: number
    requestFinishedAt?: number
}

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

if (!process.env['REACT_APP_NO_SSO']) {
    instance.interceptors.request.use(tokenInterceptor, () => Promise.reject())
}

// registered last, so it runs first (request interceptors are applied in reverse order): the timestamp is taken before the token refresh
instance.interceptors.request.use(config => {
    ;(config as TimedRequestConfig).requestStartedAt = Date.now()
    return config
})

instance.interceptors.response.use(
    response => response,
    error => {
        // also reached by the synthetic 401 thrown from `tokenInterceptor`: request interceptor rejections flow through this chain
        if (error?.config) {
            ;(error.config as TimedRequestConfig).requestFinishedAt = Date.now()
        }
        return Promise.reject(error)
    }
)

export const CxBoxApiInstance = new Api(instance, Infinity, Object.values(FilterType))
