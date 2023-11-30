import { ApplicationErrorType } from '@cxbox-ui/core/interfaces/view'

export interface NotificationState {
    data?: Notification[]
    count?: number
    page: number
    limit: number
    unreadCount?: number
}

export interface Notification {
    id: string
    createTime: string
    isRead: boolean
    text: string
}

export interface NotificationsResponse {
    data: Notification[]
    success: boolean
}

export interface NotificationCountResponse {
    data: number
    success: boolean
}

export interface NotificationCheckNewResponse {
    data: number
    success: boolean
}

export interface SocketNotification {
    errorType?: ApplicationErrorType.BusinessError | ApplicationErrorType.SystemError
    title?: string
    time?: string
    text?: string
    icon?: string
    iconColor?: string
    drillDownLink?: string
    drillDownType?: string
    drillDownLabel?: string
    page?: number
    limit?: number
}
