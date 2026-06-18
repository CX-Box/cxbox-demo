import queryString from 'query-string'
import { CxBoxApiInstance } from '../api'

type QueryParamsMap = Record<string, string | number | undefined>

export function addTailControlSequences(url: string) {
    return !url.includes('?') ? url + '?' : url + '&'
}

export function applyRawParams(url: string, qso: Record<string, unknown>) {
    if (!qso) {
        return url
    }
    const result = queryString.stringify(qso, { encode: true })
    return `${addTailControlSequences(url)}${result && `${result}`}`
}

function dropEmptyOrWrongParams(qso: QueryParamsMap) {
    const result: QueryParamsMap = { ...qso }

    return Object.keys(result).reduce((prev, paramKey) => {
        if (!prev[paramKey] && typeof prev[paramKey] !== 'number') {
            delete prev[paramKey]
        }
        return prev
    }, result)
}

export function applyParams(url: string, qso: QueryParamsMap) {
    if (!qso) {
        return url
    }
    return applyRawParams(url, dropEmptyOrWrongParams(qso))
}

/**
 * Get Cxbox API file upload endpoint based on baseURL of axios instance
 *
 * Handles empty baseURL and trailing slash
 *
 * @returns File upload endpoint
 */
export function getFileUploadEndpoint() {
    const axiosInstance = CxBoxApiInstance.api$.instance

    if (!axiosInstance.defaults.baseURL) {
        return '/file'
    }
    return axiosInstance.defaults.baseURL.endsWith('/') ? `${axiosInstance.defaults.baseURL}file` : `${axiosInstance.defaults.baseURL}/file`
}

/**
 * Combines parts of URLs, ensuring that there is only one slash between them.
 * @param paths
 * @returns
 */
export function joinPaths(...paths: string[]): string {
    return paths
        .filter(Boolean)
        .map((path, index) => {
            let processed = path

            const isFirst = index === 0
            if (!isFirst) {
                processed = processed.replace(/^\/+/, '')
            }

            const isLast = index === paths.length - 1
            if (!isLast) {
                processed = processed.replace(/\/+$/, '')
            }

            return processed
        })
        .join('/')
}

/**
 * Returns the normalized app route.
 *
 * @param url (default window.location.href)
 * @param appendTrailingSlash This is necessary for beautiful display (for example, so that /ui/#/ is formed instead of /ui#/). Defaults to true.
 * @returns (pathname + hash)
 */

export function getNormalizedAppRouteFromUrl(url: string = window.location.href, appendTrailingSlash: boolean = true): string {
    const currentUrl = new URL(url)

    if (appendTrailingSlash && !currentUrl.pathname.endsWith('/')) {
        currentUrl.pathname = currentUrl.pathname + '/'
    }

    return currentUrl.pathname + currentUrl.hash
}
