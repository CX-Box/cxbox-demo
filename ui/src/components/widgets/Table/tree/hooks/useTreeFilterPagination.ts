import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { AppWidgetMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { treeActions } from '@slices/tree'
import { getPaginationControlsState } from '@features/pagination/utils/paginationControls'
import { useTreePagination } from './useTreePagination'

export const useTreeFilterPagination = (widgetMeta?: AppWidgetMeta) => {
    const bcName = widgetMeta?.bcName
    const treeState = useAppSelector(state => state.tree[bcName!])
    const { limit, defaultLimit, paginationType } = useTreePagination(bcName, widgetMeta)
    const dispatch = useDispatch()

    const fetchNextFilterPage = useCallback(() => {
        if (bcName) {
            dispatch(treeActions.applyFilter({ bcName, more: true }))
        }
    }, [bcName, dispatch])

    const paginationControlState = getPaginationControlsState({
        type: paginationType,
        page: treeState?.filterPagination.page ?? 1,
        limit,
        defaultLimit,
        loadedCount: treeState?.filterPagination.lastResponseCount ?? 0,
        hasNext: treeState?.filterPagination.hasNext,
        total: treeState?.filterPagination.count
    })

    const total = treeState?.filterPagination.count
    const loadedCount = treeState?.filterResultNodeIds.length ?? 0

    return {
        fetchNextFilterPage,
        filterActive: treeState?.filterActive ?? false,
        filterPagination: treeState?.filterPagination,
        filterHasNext: paginationControlState.visible && !paginationControlState.nextDisabled,
        shownCount: treeState?.filterResultNodeIds.length ?? 0,
        count: typeof total === 'number' ? total - loadedCount : ''
    }
}
