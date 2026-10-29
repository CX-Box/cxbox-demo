import axios, { AxiosError } from 'axios'

export const FILE_RETRY_DELAY_MS = 250

const RETRY_STATUSES = [502, 503, 504]

// no location in tests (node): any base works there, the result is compared with the same base
const ownOrigin = () => globalThis.location?.origin ?? 'http://localhost'

const parseUrl = (url: string) => new URL(url, ownOrigin())

/**
 * The file controller of this app: a request to another origin is not retried, it would send the token there once more
 */
export function isFileDownloadUrl(url: string) {
    try {
        const { origin, pathname } = parseUrl(url)
        return origin === ownOrigin() && /\/file\/?$/.test(pathname)
    } catch {
        // a malformed url goes to axios without a retry and fails there, as before
        return false
    }
}

/**
 * Path and file id for the log: the rest of the query is not needed and may carry a token
 */
export function fileRequestLabel(url: string) {
    const { pathname, searchParams } = parseUrl(url)
    const id = searchParams.get('id')
    return id ? `${pathname}?id=${encodeURIComponent(id)}` : pathname
}

const isRetryable = (error: unknown): error is AxiosError =>
    axios.isAxiosError(error) && (error.response ? RETRY_STATUSES.includes(error.response.status) : error.code === AxiosError.ERR_NETWORK)

/**
 * One retry of a file download after a network error or 502/503/504
 *
 * TODO Remove when Spring Security fixes the bug: with StreamingResponseBody, HeaderWriterFilter writes the headers
 * from two threads at once, the response breaks and the proxy answers 502.
 * https://jira.phoenixit.ru/browse/CXBOX-1438
 * https://github.com/spring-projects/spring-security/issues/15510
 *
 * @param request File request; it is called again for the retry
 * @param label Url for the log, without the token
 * @returns The result of the first successful attempt; otherwise the error of the last attempt
 */
export async function withFileRetry<T>(request: () => Promise<T>, label: string): Promise<T> {
    try {
        return await request()
    } catch (error) {
        if (!isRetryable(error)) {
            throw error
        }
        console.warn('[file retry]', label, error.response?.status ?? error.code, 'attempt 2/2')
        await new Promise(resolve => setTimeout(resolve, FILE_RETRY_DELAY_MS))
        return request()
    }
}
