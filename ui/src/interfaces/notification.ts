import { ApplicationErrorType, DrillDownType } from '@cxbox-ui/core'

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
    links?: NotificationLink[]
}

export interface NotificationLink {
    drillDownLink: string
    drillDownLabel: string
    drillDownType: DrillDownType
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
    links?: NotificationLink[]
    page?: number
    limit?: number
}
