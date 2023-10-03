import { ApplicationErrorType } from '@cxbox-ui/core/interfaces/view'

export interface NotificationState {
    data?: PageContent
    count?: NotificationCountData
    page: number
    limit: number
}

export interface Notifications {
    id: string
    fileId: string
    jmsId: string
    notificationType: string
    reportType: string
    createdDate: string
    description: string
    isDeleted: boolean
    isRead: boolean
}

export interface NotificationsResponse {
    data: PageContent
    success: boolean
}

export interface PageContent {
    content: Notifications[]
    totalElements: number
}

export interface NotificationCountResponse {
    data: NotificationCountData
}

export interface NotificationCountData {
    notificationCountUnread: number
    notificationCountTotal: number
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
