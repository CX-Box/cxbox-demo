/*
 * © OOO "SI IKS LAB", 2022-2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults, GenericAbortSignal } from 'axios'
import { AppMetaResponse } from '../contract/appMeta.ts'
import { ApiResponse, FilterGroup } from '../contract/common'
import { AssociatedItem, BcDataResponse, DataItemResponse, DataValue } from '../contract/data.ts'
import { RowMetaResponse } from '../contract/rowMeta.ts'
import { keycloak } from '../../security'
import { BcCountResponse } from '../contract/bcCount.ts'
import { NotificationCheckNewResponse, NotificationCountResponse, NotificationsResponse } from '../contract/notification.ts'
import { fileControllerMapping } from '../../constants/notification.ts'
import { TableSettingsItem } from '../contract/tableSettings.ts'

export type QueryApiRequest = {
    signal: GenericAbortSignal
}

export type MutationApiRequest<T = Record<string, never>> = {
    data: T
}

export type DefaultApiParams = {
    bcPath: string
    params?: Record<string, string>
}

export class Api {
    axios: AxiosInstance
    constructor(config?: CreateAxiosDefaults) {
        const defaults: CreateAxiosDefaults = {
            responseType: 'json',
            headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        }
        this.axios = axios.create({ ...defaults, ...config })

        this.axios.interceptors.response.use((response: AxiosResponse<ApiResponse>) => {
            if (response.data.redirectUrl) {
                let redirectUrl = response.data.redirectUrl
                if (!redirectUrl.startsWith('/') && !redirectUrl.match('^http(.?)://')) {
                    redirectUrl = `${window.location.pathname}#/${redirectUrl}`
                }
                if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
                    redirectUrl = `${window.location.origin}${redirectUrl}`
                }
                window.location.replace(redirectUrl)
            }
            return response
        })
    }

    buildUrlWithParams(path: string, params?: Record<string, string>) {
        const filteredParams = Object.fromEntries(Object.entries(params ?? {}).filter(([, value]) => value))
        const searchParams = new URLSearchParams(filteredParams)
        const url = new URL(path, window.location.origin + this.axios.defaults.baseURL)

        for (const [key, value] of searchParams) {
            url.searchParams.append(key, value)
        }
        return url.toString()
    }

    async routerRequest(path: string, params: Record<string, string>) {
        const url = this.buildUrlWithParams(path, params)

        const { data } = await this.axios.get(url)
        return data
    }

    async fetchBcData({ signal, bcPath, params = {} }: DefaultApiParams & QueryApiRequest) {
        const noLimit = params._limit === '0'
        const queryStringObject = {
            ...params
        }
        if (!noLimit) {
            if ('_page' in params) {
                queryStringObject._page = params._page
            }
            if ('_limit' in params) {
                queryStringObject._limit = params._limit
            }
        } else {
            queryStringObject._page = '1'
            queryStringObject._limit = '30'
        }
        const url = this.buildUrlWithParams(`data/${bcPath}`, queryStringObject)
        const { data } = await this.axios.get<BcDataResponse>(url, { signal })
        return data
    }

    //`row-meta/${screenName}/` + bcUrl
    async fetchRowMeta({ params, signal, bcPath }: DefaultApiParams & QueryApiRequest) {
        const url = this.buildUrlWithParams(bcPath, params)
        const { data } = await this.axios.get<RowMetaResponse>(url, { signal })
        return data
    }

    //`row-meta-new/${screenName}/` + bcUrl
    async create({ bcPath, params }: DefaultApiParams) {
        const url = this.buildUrlWithParams(`row-meta-new/${bcPath}`, params)
        const { data } = await this.axios.get<RowMetaResponse>(url)
        return data
    }

    async save({ data, params, bcPath }: DefaultApiParams & MutationApiRequest<Record<string, DataValue> & { vstamp: number }>) {
        const url = this.buildUrlWithParams(`data/${bcPath}`, params)
        const { data: res } = await this.axios.put<DataItemResponse>(url, { data })
        return res
    }

    async delete({ params, bcPath }: DefaultApiParams) {
        const url = this.buildUrlWithParams(bcPath, params)
        const { data } = await this.axios.delete<DataItemResponse>(url)
        return data
    }

    async customAction({ bcPath, params, data }: DefaultApiParams & MutationApiRequest) {
        const url = this.buildUrlWithParams(`custom-action/${bcPath}`, params)
        const { data: res } = await this.axios.post<DataItemResponse>(url, { data: data || {} })
        return res
    }

    async associate({ params, bcPath, data }: DefaultApiParams & MutationApiRequest<AssociatedItem[] | Record<string, AssociatedItem[]>>) {
        // TODO: Why Cxbox API sends underscored `_associate` but expects `associated` in return?
        const processedData = Array.isArray(data)
            ? data.map(item => ({
                  id: item.id,
                  vstamp: item.vstamp,
                  associated: item._associate
              }))
            : data
        const url = this.buildUrlWithParams(bcPath, params)
        const { data: res } = await this.axios.post<DataItemResponse>(url, processedData)
        return res
    }
    /**
     * Get Cxbox API file upload endpoint based on baseURL of axios instance
     *
     * Handles empty baseURL and trailing slash
     *
     * @returns File upload endpoint
     */
    get fileUploadEndpoint() {
        const instance = this.axios

        if (!instance.defaults.baseURL) {
            return '/file'
        }

        return instance.defaults.baseURL.endsWith('/') ? `${instance.defaults.baseURL}file` : `${instance.defaults.baseURL}/file`
    }

    refreshMeta({ signal }: QueryApiRequest) {
        return this.axios.get(this.buildUrlWithParams(`bc-registry/refresh-meta`), { signal })
    }

    async loginByRoleRequest({ signal, role }: QueryApiRequest & { role: string }) {
        const url = this.buildUrlWithParams(`login`, { role: role })
        const { data } = await this.axios.get<AppMetaResponse>(url, { signal })
        return data
    }

    fetchBcCount(screenName: string, bcName: string, params: Record<string, string> = {}, signal?: GenericAbortSignal) {
        const url = this.buildUrlWithParams(`count/${screenName}/` + bcName)
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
        return this.axios.get<BcCountResponse>(url + (stringParams && `?${stringParams}`), { signal })
    }

    getBasicAuthRequest(login?: string, password?: string, signal?: GenericAbortSignal) {
        const hash = login && atob(`${login}:${password}`) //TODO delete?
        const tzOffset = -new Date().getTimezoneOffset() * 60
        const entrypointUrl = `/${window.location.hash}`
        const config: AxiosRequestConfig = hash
            ? { headers: { Authorization: `Basic ${hash}` } }
            : { headers: { Authorization: `Bearer ${keycloak.token}` } }
        return this.axios.get<AppMetaResponse>(this.buildUrlWithParams(`login?_tzoffset=${tzOffset}&_entrypointUrl=${entrypointUrl}`), {
            ...config,
            signal
        })
    }

    getNotificationList(page: number, limit: number, signal?: GenericAbortSignal) {
        const queryStringObject = {
            _page: page.toString(),
            _limit: limit.toString()
        }

        const url = this.buildUrlWithParams('notification/get-notifications', queryStringObject)

        return this.axios.get<NotificationsResponse>(url, { signal })
    }

    getNotificationCount(signal: GenericAbortSignal) {
        return this.axios.get<NotificationCountResponse>('notification/count-notifications', { signal })
    }

    setNotificationsRead(selectedRowKeys: (number | string)[]) {
        return this.axios.post('notification/mark-notification-as-read', selectedRowKeys)
    }

    checkNewNotification(signal: GenericAbortSignal) {
        return this.axios.get<NotificationCheckNewResponse>('/notification/check-new-notification', { signal })
    }

    /**
     * Uses for creation endpoint if file downloading from websocket message
     *
     * @param link
     */
    getMessageDownloadFileEndpoint(link: string) {
        const instance = this.axios

        return instance.defaults.baseURL?.endsWith('/')
            ? `${instance.defaults.baseURL}${fileControllerMapping}/${link}`
            : `${instance.defaults.baseURL}/${fileControllerMapping}/${link}`
    }

    deleteNotifications(selectedRowKeys: number[]) {
        return this.axios.delete(this.buildUrlWithParams('notification/delete-notification'), {
            headers: {
                Pragma: 'no-cache',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Content-type': 'application/json'
            },
            data: JSON.stringify(selectedRowKeys)
        })
    }

    createPersonalSetting(data: Omit<TableSettingsItem, 'id'>[]) {
        return this.axios.post<{
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
        return this.axios.put<{
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
        return this.axios.delete('/personalAdditionalFields', { data: { data: [id] } } as AxiosRequestConfig)
    }

    saveFilterGroup(data: { filterGroups: FilterGroup[] }) {
        return this.axios.post<{ data: { id: string }[] }>('personalFilterGroups', { data: data || {} }, undefined)
    }

    deleteFilterGroup(filterGroupId: number) {
        return this.axios.delete<{ data: unknown }>(`personalFilterGroups`, { data: [filterGroupId] } as AxiosRequestConfig)
    }
}
