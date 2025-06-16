import { AxiosError } from 'axios'

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

export enum ApplicationErrorType {
    BusinessError,
    SystemError,
    NetworkError
}

export interface ApplicationErrorBase {
    type: ApplicationErrorType
    code?: number
}

export interface BusinessError extends ApplicationErrorBase {
    type: ApplicationErrorType.BusinessError
    message: string
}

export interface SystemError extends ApplicationErrorBase {
    type: ApplicationErrorType.SystemError
    error?: AxiosError
    details: string
}

export interface NetworkError extends ApplicationErrorBase {
    type: ApplicationErrorType.NetworkError
}
