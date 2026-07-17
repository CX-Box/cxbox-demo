import { useCallback } from 'react'
import { getPaginationControlsState } from '@features/pagination/utils/paginationControls'
import { BcTreeState } from '@slices/tree'
import { useAppSelector } from '@store'
import { useTreePagination } from '@components/widgets/Table/tree/hooks/useTreePagination'
import { AppWidgetMeta } from '@interfaces/widget'

export const useTreeShowMore = (widgetMeta?: AppWidgetMeta) => {
    const bcName = widgetMeta?.bcName
    const treeState = useAppSelector(state => state.tree[bcName!])
    const { limit, defaultLimit, paginationType } = useTreePagination(bcName, widgetMeta)

    return useCallback(
        (parentId: string, nodeStates: BcTreeState['nodesState'], loadedChildCount: number, visibleChildCount: number) => {
            const parentNodeState = nodeStates[parentId]
            if (!parentNodeState) {
                return { visible: false, disabled: false }
            }

            const collapseFilterActive = treeState?.filterActive && treeState.searchMode === 'collapse'
            const cachedPageAvailable = collapseFilterActive && (parentNodeState.filterPage ?? 0) < (parentNodeState.page ?? 0)
            const remainingCount =
                typeof parentNodeState.count === 'number'
                    ? Math.max(
                          0,
                          parentNodeState.count -
                              (collapseFilterActive
                                  ? visibleChildCount
                                  : treeState?.childIdsByParent[parentId]?.length ?? visibleChildCount)
                      )
                    : ''

            if (parentNodeState.page === 0) {
                return { visible: true, disabled: false, count: remainingCount }
            }

            const state = getPaginationControlsState({
                type: paginationType,
                page: parentNodeState.page ?? 1,
                limit,
                defaultLimit,
                loadedCount: loadedChildCount,
                hasNext: parentNodeState.hasNext,
                total: parentNodeState.count
            })

            return {
                visible: cachedPageAvailable || (state.visible && !state.nextDisabled),
                disabled: cachedPageAvailable ? false : state.nextDisabled,
                count: remainingCount
            }
        },
        [paginationType, limit, defaultLimit, treeState]
    )
}
