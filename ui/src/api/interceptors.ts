import { InternalAxiosRequestConfig } from 'axios'
import { store } from '@store'

const EMPTY_ARRAY: unknown[] = []

/**
 * Sets `_fullTextSearch` parameter for get requests
 */
export function useFullTextInterceptor(rqConfig: InternalAxiosRequestConfig) {
    const state = store.getState()
    const isGetDataRequest =
        (rqConfig.url?.startsWith('data') || rqConfig.url?.startsWith('count/')) && rqConfig.method?.toUpperCase() === 'GET'
    const isCustomActionRequest = rqConfig.url?.startsWith('custom-action') && rqConfig.method?.toUpperCase() === 'POST'
    let bcName = null
    if (isGetDataRequest) {
        const bcHierarchy = rqConfig.url?.split('?')[0].split('/').slice(2)
        if (bcHierarchy && bcHierarchy.length % 2 !== 0) {
            bcName = bcHierarchy?.pop()
        }
    }
    if (isCustomActionRequest) {
        const bcHierarchy = rqConfig.url?.split('?')[0].split('/').slice(-2)
        bcName = bcHierarchy?.shift()
    }
    const isStoreContainFilter = (bcName && state.screen.fullTextFilter[bcName]) || EMPTY_ARRAY
    if (isStoreContainFilter) {
        rqConfig.params = rqConfig.params || {}
        rqConfig.params._fullTextSearch = state.screen.fullTextFilter[bcName as string]
    }
    return rqConfig
}
