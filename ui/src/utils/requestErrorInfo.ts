import { AxiosError } from 'axios'
import { TimedRequestConfig } from '../api'

/** For the support team: it finds the failed request in the server log by these details */
export interface RequestErrorInfo {
    statusCode?: number
    method?: string
    url?: string
    startedAt?: string
    finishedAt?: string
    responseStatusText?: string
    responseHeaders?: Record<string, string>
    responseData?: string
    browser?: string
    /**
     * What the token renewal uses in the browser, see "Requirements" in `auth/rotationSafeUserManager/README.md`
     */
    webLocks?: boolean
    indexedDb?: boolean
}

const toIso = (timestamp?: number) => (timestamp ? new Date(timestamp).toISOString() : undefined)

/**
 * Takes the times from the request, not from `Date.now()`: the function is pure and is called in reducers
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
