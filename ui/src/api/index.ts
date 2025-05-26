import { Api as CXBoxApi, utils } from '@cxbox-ui/core'
import { BcCountParamsMap, BcCountResponse } from '@interfaces/bcCount'
import { keycloak, KEYCLOAK_MIN_VALIDITY } from '../keycloak'
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { __API__ } from '@constants'
import { applyParams } from '@utils/api'
import { NotificationCheckNewResponse, NotificationCountResponse, NotificationsResponse } from '@interfaces/notification'
import { fileControllerMapping } from '@constants/notification'
import { LoginResponse } from '@interfaces/session'
import { TableSettingsItem } from '@interfaces/tableSettings'
import { FilterGroup } from '@interfaces/filters'
import { saveAs } from 'file-saver'
import { getFileNameFromDisposition } from '@utils/getFileNameFromDisposition'
import { Observable } from 'rxjs'

class Api extends CXBoxApi {
    loginByRoleRequest(role: string) {
        return super.loginByRoleRequest(role) as Observable<LoginResponse>
    }

    fetchBcCount(screenName: string, bcName: string, params: BcCountParamsMap = {}) {
        const url = utils.buildUrl`count/${screenName}/` + bcName
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
        const hash = login && btoa(`${login}:${password}`)
        const tzOffset = -new Date().getTimezoneOffset() * 60
        const entrypointUrl = `/${window.location.hash}`
        const config: AxiosRequestConfig = hash
            ? { headers: { Authorization: `Basic ${hash}` } }
            : { headers: { Authorization: `Bearer ${keycloak.token}` } }
        return this.api$.get<LoginResponse>(utils.buildUrl`login?_tzoffset=${tzOffset}&_entrypointUrl=${entrypointUrl}`, config)
    }

    getNotificationList(page: number, limit: number) {
        const queryStringObject = {
            _page: page,
            _limit: limit
        }

        const url = applyParams('notification/get-notifications', queryStringObject)

        return this.api$.get<NotificationsResponse>(url).toPromise()
    }

    getNotificationCount() {
        return this.api$.get<NotificationCountResponse>('notification/count-notifications').toPromise()
    }

    setNotificationsRead(selectedRowKeys: (number | string)[]) {
        return this.api$.post<any>('notification/mark-notification-as-read', selectedRowKeys).toPromise()
    }

    checkNewNotification() {
        return this.api$.get<NotificationCheckNewResponse>('/notification/check-new-notification').toPromise()
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
        return this.api$.delete('/notification/delete-notification', {
            data: JSON.stringify(selectedRowKeys),
            headers: { 'Content-Type': 'application/json' }
        })
    }

    createPersonalSetting(data: Omit<TableSettingsItem, 'id'>[]) {
        return this.api$.post<{
            success: boolean
            data: [
                {
                    id: string
                    vstamp: number
                    view: string
                    widget: string
                }
            ]
        }>('/personalAdditionalFields', { data })
    }

    updatePersonalSetting(data: Omit<TableSettingsItem, 'id'>[]) {
        return this.api$.put<{
            success: boolean
            data: [
                {
                    id: string
                    vstamp: number
                    view: string
                    widget: string
                }
            ]
        }>('/personalAdditionalFields', { data })
    }

    deletePersonalSetting(id: string) {
        return this.api$.delete('/personalAdditionalFields', { data: { data: [id] } } as AxiosRequestConfig)
    }

    saveFilterGroup(data: { filterGroups: FilterGroup[] }) {
        return this.api$.post<{ data: { id: string }[] }>('personalFilterGroups', { data: data || {} }, undefined)
    }

    deleteFilterGroup(filterGroupId: number) {
        return this.api$.delete<{ data: unknown }>(`personalFilterGroups`, { data: [filterGroupId] } as AxiosRequestConfig)
    }

    getBlob(url: string, params: { preview: boolean }) {
        return this.api$.instance.get(url, { responseType: 'blob', baseURL: '', params })
    }

    async saveBlob(url: string, filename?: string) {
        const response = await this.getBlob(url, { preview: false })
        const disposition = response.request.getResponseHeader('content-disposition')

        // TODO add parser for disposition
        saveAs(response.data, filename ?? getFileNameFromDisposition(disposition))

        return response
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

if (!process.env['REACT_APP_NO_SSO']) {
    instance.interceptors.request.use(tokenInterceptor, () => Promise.reject())
}

export const CxBoxApiInstance = new Api(instance)
