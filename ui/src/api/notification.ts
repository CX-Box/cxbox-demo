import { axiosInstance, HEADERS } from './session'
import { axiosGet, buildUrl, axiosPost } from '@cxbox-ui/core'
import { NotificationCountResponse, NotificationsResponse } from '../interfaces/notification'
import { __API__ } from '../constants/constants'
import { applyParams } from '../utils/api'
import { fileControllerMapping } from '../constants/notification'

export function getNotificationList(page: number, limit: number) {
    const queryStringObject = {
        _page: page,
        _limit: limit
    }

    const url = applyParams(buildUrl` notification/get-notifications`, queryStringObject)

    return axiosGet<NotificationsResponse>(url).toPromise()
}

export function getNotificationCount() {
    return axiosGet<NotificationCountResponse>(buildUrl`notification/count-notifications`).toPromise()
}

export function setNotificationsRead(selectedRowKeys: (number | string)[]) {
    return axiosPost<any>(buildUrl`notification/mark-notification-as-read`, selectedRowKeys).toPromise()
}

/**
 * Uses for creation endpoint if file downloading from websocket message
 *
 * @param link
 */
export function getMessageDownloadFileEndpoint(link: string) {
    return axiosInstance.defaults.baseURL?.endsWith('/')
        ? `${axiosInstance.defaults.baseURL}${fileControllerMapping}/${link}`
        : `${axiosInstance.defaults.baseURL}/${fileControllerMapping}/${link}`
}

export function deleteNotifications(selectedRowKeys: number[]) {
    return fetch(`${__API__}notification/delete-notification`, {
        headers: {
            ...HEADERS,
            'Content-type': 'application/json'
        },
        method: 'DELETE',
        body: JSON.stringify(selectedRowKeys)
    })
}
