import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { treeActions, BcTreeState } from '@slices/tree'

export const useTreeFetch = (bcName?: string, bcTreeState?: BcTreeState, limit?: number) => {
    const dispatch = useDispatch()

    const fetchChildNodes = useCallback(
        (parentId: string | null = null, more: boolean) => {
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
                dispatch(treeActions.showCachedFilterPage({ bcName, parentId: String(parentId), limit }))
                return
            }

            dispatch(treeActions.fetchChildNodeData({ bcName, parentId, more }))
        },
        [bcName, bcTreeState, dispatch, limit]
    )

    const createFetchChildNodesHandler = useCallback(
        (parentId: string | null = null, more: boolean) => {
            return () => fetchChildNodes(parentId, more)
        },
        [fetchChildNodes]
    )

    return { fetchChildNodes, createFetchChildNodesHandler }
}
