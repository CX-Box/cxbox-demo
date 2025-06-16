/* eslint-disable react-hooks/rules-of-hooks */
import { Store } from '../data/Store.ts'
import { Api } from '../data/Api.ts'
import { keepPreviousData, QueryClient, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { AppMeta } from './AppMeta.ts'
import { BcTree } from './BcTree.ts'
import { UnionState } from '../data/slices'
import { Navigation } from '../data/Navigation.ts'
import { BcDataResponse } from '../contract/data.ts'

const dataKeys = {
    data: ['data'] as const,
    emptyPathData: () => [...dataKeys.data, '' as string, {} as Record<string, string>] as const,
    pathData: (screenName: string, path: string, params: Record<string, string> = {}) =>
        [...dataKeys.data, [screenName, path].join('/'), params] as const,
    pathWithCursorData: (screenName: string, path: string, cursor: string, params: Record<string, string> = {}) =>
        [...dataKeys.data, [screenName, path, cursor].join('/'), params] as const
}

export class Data<State extends UnionState> {
    constructor(
        private api: Api,
        private navigation: Navigation,
        protected queryClient: QueryClient,
        private store: Store<State>,
        private AppMeta: AppMeta<State>,
        private BcTree: BcTree<State>
    ) {}

    useData(bcName: string) {
        const queryClient = this.queryClient
        const screenName = this.AppMeta.useScreenName()
        const { bcPaths, thisBcPath, cursor } = this.BcTree.useScreenBcPath(bcName)
        const { bcMap } = this.navigation.useBcLocation()
        const bcTree = this.store.useStore(state => state.bcTree)
        const setBcCursor = this.store.useStore(state => state.setBcCursor)

        const prefetchPath = useMemo(() => {
            // exclude from bcPath this bc path
            const prefetchPaths = bcPaths.slice(0, -1)
            // if null was finded, set prefetch path to last accesible, if -1 return prefetch to null
            const firstNullishPath = prefetchPaths.findIndex(path => path === null)
            if (firstNullishPath === -1) {
                return null
            }
            return prefetchPaths[firstNullishPath - 1]
        }, [bcPaths])

        /**
         * The only case of prefetching data is to collect intermediate cursors
         * If prefetchPaths includes null, we must load last not null path and set bc cursor
         */

        useEffect(() => {
            if (prefetchPath !== null) {
                queryClient.prefetchQuery({
                    queryKey: dataKeys.pathData(screenName, prefetchPath),
                    queryFn: async ({ signal, queryKey }) => {
                        const res = await this.api.fetchBcData({ bcPath: queryKey.join('/'), signal })
                        const bcName = prefetchPath?.split('/').slice(-1)[0]
                        const bc = bcTree.find(bc => bc.name === bcName)
                        if (bc && !bc.cursor) {
                            setBcCursor(bcName, res.data?.[0].id)
                        }
                    }
                })
            }
        }, [bcTree, prefetchPath, queryClient, screenName, setBcCursor])

        const key = (() => {
            const bc = bcTree.find(bc => bc.name === bcName)
            if (thisBcPath && bc) {
                const additionalParams: Record<string, string> = {}
                if (bc.filters) {
                    bc.filters.forEach(filter => {
                        additionalParams[`${filter.fieldKey}.${filter.type}`] = filter.value
                    })
                }
                if (bc.pagination) {
                    additionalParams['page'] = bc.pagination.page.toString()
                    if (bc.pagination.limit) {
                        additionalParams['limit'] = bc.pagination.limit.toString()
                    }
                }
                const isSingleRecord = bcMap.get(bcName) === cursor
                if (isSingleRecord) {
                    return dataKeys.pathWithCursorData(screenName, thisBcPath, cursor, additionalParams)
                }
                return dataKeys.pathData(screenName, thisBcPath, additionalParams)
            }

            return dataKeys.emptyPathData()
        })()

        const query = useQuery({
            queryKey: key,
            queryFn: async ({ signal, queryKey }) => await this.api.fetchBcData({ bcPath: queryKey[1], signal, params: queryKey[2] }),
            enabled: thisBcPath !== null,
            refetchOnMount: false,
            gcTime: 0,
            placeholderData: keepPreviousData
        })

        useEffect(() => {
            if (query.isFetchedAfterMount && cursor === null) {
                setBcCursor(bcName, (query.data as BcDataResponse)?.data?.[0]?.id)
            }
        }, [bcName, cursor, query.data, query.isFetchedAfterMount, setBcCursor])

        return query
    }
}
