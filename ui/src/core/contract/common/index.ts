/**
 * Basic type for Cxbox API responses
 */
export interface ApiResponse {
    /**
     * If any response returs with this fields, browser should redirect on this address
     */
    redirectUrl?: string
}

type DataBaseRecord = object

export interface ApiDataResponse extends ApiResponse {
    data: DataBaseRecord
}

export function isApiDataResponse(res: ApiResponse): res is ApiDataResponse {
    return 'data' in res
}

/**
 * Types of notification messages
 */
export type AppNotificationType = 'success' | 'info' | 'warning' | 'error'

export interface SystemNotification {
    id: number
    type: AppNotificationType | (string & {})
    message: string
}

export * from './filter.ts'
export * from './drilldown.ts'
