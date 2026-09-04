import { useCallback } from 'react'
import { getPaginationControlsState } from '@features/pagination/utils/paginationControls'
import { BcTreeState } from '@slices/tree'
import { useAppSelector } from '@store'
import { useTreePagination } from '@components/widgets/Table/tree/hooks/useTreePagination'
import { AppWidgetMeta } from '@interfaces/widget'
import { PAGINATION_MODES } from '@constants/pagination'
import { useTranslation } from 'react-i18next'

export const useTreeShowMore = (widgetMeta?: AppWidgetMeta) => {
    const bcName = widgetMeta?.bcName
    const treeState = useAppSelector(state => state.tree[bcName!])
    const { limit, defaultLimit, paginationType } = useTreePagination(bcName, widgetMeta)
    const { t } = useTranslation()

    return useCallback(
        (parentId: string, nodeStates: BcTreeState['nodesState'], loadedChildCount: number, visibleChildCount: number) => {
            const parentNodeState = nodeStates[parentId]
            if (!parentNodeState) {
                return { visible: false, disabled: false }
            }

            const collapseFilterActive = treeState?.filterActive && treeState.searchMode === 'collapse'
            const cachedPageAvailable = collapseFilterActive && (parentNodeState.filterPage ?? 0) < (parentNodeState.page ?? 0)
            const calculatedRemainingCount =
                typeof parentNodeState.count === 'number'
                    ? Math.max(
                          0,
                          parentNodeState.count -
                              (collapseFilterActive
                                  ? visibleChildCount
                                  : treeState?.childIdsByParent[parentId]?.length ?? visibleChildCount)
                      )
                    : undefined

            const isUnknownCount = paginationType === PAGINATION_MODES.nextAndPreviousWithCount && typeof parentNodeState.count !== 'number'
            const isRemainingCountZero = calculatedRemainingCount === 0

            let countInfoMessage: string | undefined

            if (isUnknownCount) {
                countInfoMessage = t('Load more and show count')
            } else if (isRemainingCountZero) {
                countInfoMessage = t('Load more')
            }

            const remainingCount = calculatedRemainingCount || ''

            if (parentNodeState.page === 0) {
                return { visible: true, disabled: false, count: remainingCount, countInfoMessage }
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
                count: remainingCount,
                countInfoMessage
            }
        },
        [paginationType, limit, defaultLimit, treeState, t]
    )
}
