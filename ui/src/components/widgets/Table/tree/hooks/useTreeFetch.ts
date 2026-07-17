import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { treeActions, BcTreeState } from '@slices/tree'
import { PaginationMode } from '@constants/pagination'
import { TREE_SHOW_MORE_AUTO_FETCH_ENABLED, TREE_SHOW_MORE_AUTO_FETCH_MAX_REQUESTS } from '@constants/tree'
import { getTreePaginationControlsState } from '@components/widgets/Table/tree/utils/getTreePaginationControlsState'

export const useTreeFetch = (
    bcName?: string,
    bcTreeState?: BcTreeState,
    limit?: number,
    defaultLimit?: number,
    paginationType?: PaginationMode
) => {
    const dispatch = useDispatch()

    const fetchChildNodes = useCallback(
        (parentId: string | null = null, more: boolean, fetchUntilDataChanges = false) => {
            if (!bcTreeState || !bcName) {
                return
            }
            // Do not request data again unless otherwise specified
            if (!more && bcTreeState.nodesState[parentId!]?.page) {
                return
            }

            const nodeState = bcTreeState.nodesState[String(parentId)]
            if (
                more &&
                limit &&
                bcTreeState.filterActive &&
                bcTreeState.searchMode === 'collapse' &&
                (nodeState?.filterPage ?? 0) < (nodeState?.page ?? 0)
            ) {
                const autoFetchEnabled = fetchUntilDataChanges && TREE_SHOW_MORE_AUTO_FETCH_ENABLED
                const pageLimit = autoFetchEnabled ? Math.max(1, TREE_SHOW_MORE_AUTO_FETCH_MAX_REQUESTS) : 1
                const loadedPage = nodeState?.page ?? 0
                const loadedCount = (loadedPage - 1) * limit + (nodeState?.lastResponseCount ?? limit)
                const visibleNodeIds = new Set(bcTreeState.visibleNodeIdsForHidden.map(String))
                const childIds = bcTreeState.childIdsByParent[String(parentId)] ?? []
                let filterPage = nodeState?.filterPage ?? 0
                let cachedPageCount = 0
                let dataChanged = false

                while (filterPage < loadedPage && cachedPageCount < pageLimit) {
                    const cachedIds = childIds.slice(filterPage * limit, Math.min((filterPage + 1) * limit, loadedCount))
                    filterPage += 1
                    cachedPageCount += 1
                    dataChanged = cachedIds.some(id => !visibleNodeIds.has(String(id)))

                    if (dataChanged) {
                        break
                    }
                }

                dispatch(
                    treeActions.showCachedFilterPage({
                        bcName,
                        parentId: String(parentId),
                        limit,
                        pageCount: cachedPageCount
                    })
                )

                const remainingRequestCount = pageLimit - cachedPageCount
                const cacheExhausted = filterPage >= loadedPage
                if (!autoFetchEnabled || dataChanged || !cacheExhausted || remainingRequestCount <= 0 || !paginationType) {
                    return
                }

                const paginationState = getTreePaginationControlsState({
                    type: paginationType,
                    page: loadedPage,
                    limit,
                    defaultLimit: defaultLimit ?? limit,
                    loadedCount: nodeState?.lastResponseCount ?? 0,
                    hasNext: nodeState?.hasNext,
                    total: nodeState?.count
                })

                if (!paginationState.visible || paginationState.nextDisabled) {
                    return
                }

                dispatch(
                    treeActions.fetchChildNodeData({
                        bcName,
                        parentId,
                        more,
                        fetchUntilDataChanges: true,
                        maxRequests: remainingRequestCount
                    })
                )
                return
            }

            dispatch(
                treeActions.fetchChildNodeData({
                    bcName,
                    parentId,
                    more,
                    fetchUntilDataChanges,
                    maxRequests:
                        fetchUntilDataChanges && TREE_SHOW_MORE_AUTO_FETCH_ENABLED ? TREE_SHOW_MORE_AUTO_FETCH_MAX_REQUESTS : undefined
                })
            )
        },
        [bcName, bcTreeState, defaultLimit, dispatch, limit, paginationType]
    )

    const createFetchChildNodesHandler = useCallback(
        (parentId: string | null = null, more: boolean) => {
            return () => fetchChildNodes(parentId, more, true)
        },
        [fetchChildNodes]
    )

    return { fetchChildNodes, createFetchChildNodesHandler }
}
