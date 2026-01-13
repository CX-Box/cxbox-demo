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
