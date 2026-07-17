import { useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { AppWidgetMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { treeActions } from '@slices/tree'
import { getPaginationControlsState } from '@features/pagination/utils/paginationControls'
import { useTreePagination } from './useTreePagination'
import { selectBcFilters } from '@selectors/selectors'
import { FilterType } from '@interfaces/filters'
import { getFieldHighlightSearch } from '@utils/filterMatch'
import { WidgetFieldBase } from '@cxbox-ui/core'
import { TREE_SEARCH_MODES, TREE_SHOW_MORE_AUTO_FETCH_ENABLED, TREE_SHOW_MORE_AUTO_FETCH_MAX_REQUESTS } from '@constants/tree'
import { Lookup } from '@utils/Lookup'

export const useTreeFilterPagination = (widgetMeta?: AppWidgetMeta) => {
    const bcName = widgetMeta?.bcName
    const treeState = useAppSelector(state => state.tree[bcName!])
    const filters = useAppSelector(state => selectBcFilters(state, bcName))
    const { limit, defaultLimit, paginationType } = useTreePagination(bcName, widgetMeta)
    const dispatch = useDispatch()

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
    const highlightedNodeIds = useMemo(() => {
        const highlightedIds = new Set<string>()
        const visibleNodeIds = new Set(treeState?.visibleNodeIdsForHidden ?? [])
        const displayedById = new Map<string, boolean>()
        const isDisplayed = (nodeId: string, visited = new Set<string>()): boolean => {
            if (displayedById.has(nodeId)) {
                return displayedById.get(nodeId)!
            }
            if (visited.has(nodeId)) {
                return false
            }

            const node = treeState?.nodes[nodeId]
            if (
                !node ||
                (Lookup.has([TREE_SEARCH_MODES.collapse, TREE_SEARCH_MODES.hide], treeState.searchMode) && !visibleNodeIds.has(nodeId))
            ) {
                return false
            }

            const parentId = node[treeState.parentFieldKey]
            const normalizedParentId = parentId == null ? undefined : String(parentId)
            const displayed =
                !normalizedParentId ||
                !treeState.nodes[normalizedParentId] ||
                isDisplayed(normalizedParentId, new Set([...visited, nodeId]))

            displayedById.set(nodeId, displayed)

            return displayed
        }
        const bcFilters = filters ?? []

        Object.values(treeState?.nodes ?? {}).forEach(node => {
            if (!isDisplayed(String(node.id))) {
                return
            }

            const highlighted = ((widgetMeta?.fields ?? []) as WidgetFieldBase[]).some(field => {
                const filter = bcFilters.find(
                    item =>
                        item.fieldName === field.key ||
                        (item.type === FilterType.fullTextSearch &&
                            widgetMeta?.options?.fullTextSearch?.highLight?.fieldKeys?.includes(field.key))
                )

                return !!getFieldHighlightSearch(String(node[field.key] ?? ''), filter, field.type)
            })

            if (highlighted) {
                highlightedIds.add(String(node.id))
            }
        })

        return highlightedIds
    }, [filters, treeState, widgetMeta])

    const shownNodeIds = useMemo(
        () => new Set([...(treeState?.filterResultNodeIds ?? []).map(String), ...highlightedNodeIds]),
        [highlightedNodeIds, treeState?.filterResultNodeIds]
    )

    const shownCount = shownNodeIds.size

    const fetchNextFilterPage = useCallback(() => {
        if (bcName) {
            dispatch(
                treeActions.applyFilter({
                    bcName,
                    more: true,
                    fetchUntilDataChanges: true,
                    maxRequests: TREE_SHOW_MORE_AUTO_FETCH_ENABLED ? TREE_SHOW_MORE_AUTO_FETCH_MAX_REQUESTS : undefined,
                    knownNodeIds: [...shownNodeIds]
                })
            )
        }
    }, [bcName, dispatch, shownNodeIds])

    const remainingCount = typeof total === 'number' ? Math.max(0, total - shownCount) : undefined

    return {
        fetchNextFilterPage,
        filterActive: treeState?.filterActive ?? false,
        filterPagination: treeState?.filterPagination,
        filterHasNext: paginationControlState.visible && !paginationControlState.nextDisabled && remainingCount !== 0,
        shownCount,
        count: remainingCount ?? ''
    }
}
