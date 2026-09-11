import { AxiosError } from 'axios'
import { TimedRequestConfig } from '../api'

/**
 * Technical details of a failed HTTP request.
 *
 * Shown collapsed in error popups (what is needed to find the request in the server log from a screenshot)
 * and copied to clipboard in full by "Copy details to clipboard".
 */
export interface RequestErrorInfo {
    statusCode?: number
    method?: string
    url?: string
    startedAt?: string
    finishedAt?: string
    responseStatusText?: string
    responseHeaders?: Record<string, string>
    responseData?: string
}

const toIso = (timestamp?: number) => (timestamp ? new Date(timestamp).toISOString() : undefined)

/**
 * Pure: timestamps are taken from the request config (see interceptors in `api/index.ts`), so it can be used inside reducers
 */
export function toRequestErrorInfo(error: AxiosError): RequestErrorInfo {
    const config = error.config as TimedRequestConfig | undefined
    const response = error.response
    let responseData: string | undefined

    try {
        responseData =
            response?.data == null ? undefined : typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
    } catch {
        responseData = String(response?.data)
    }

    return {
        statusCode: response?.status,
        method: config?.method?.toUpperCase(),
        url: error.request?.responseURL || [config?.baseURL, config?.url].filter(Boolean).join('') || undefined,
        startedAt: toIso(config?.requestStartedAt),
        finishedAt: toIso(config?.requestFinishedAt),
        responseStatusText: response?.statusText || undefined,
        responseHeaders: response?.headers
            ? Object.fromEntries(Object.entries(response.headers).map(([key, value]) => [key, String(value)]))
            : undefined,
        responseData
    }
}
