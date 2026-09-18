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
    /** What the browser is, and the two things of it the token renewal stands on (see `auth/rotationSafeUserManager`) */
    browser?: string
    /** Without Web Locks the tabs do not queue their renewals: safe, but a tab may go for the SSO cookie while another one renews */
    webLocks?: boolean
    /** Without IndexedDB a refresh token cannot be recorded as sent, so it is never sent: the session lives by the SSO cookie alone */
    indexedDb?: boolean
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
        responseData,
        browser: typeof navigator === 'undefined' ? undefined : navigator.userAgent,
        webLocks: typeof navigator === 'undefined' ? undefined : 'locks' in navigator,
        indexedDb: typeof window === 'undefined' ? undefined : 'indexedDB' in window
    }
}
