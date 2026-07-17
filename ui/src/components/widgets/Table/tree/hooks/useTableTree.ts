import { useAppSelector } from '@store'
import React from 'react'
import { AppWidgetMeta } from '@interfaces/widget'
import { ROW_KEY } from '@components/widgets/Table/constants'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { useTreePagination } from './useTreePagination'
import { useTreeShowMore } from './useTreeShowMore'
import { useTreeFetch } from './useTreeFetch'
import { useTreeDataSource, TableTreeNode } from './useTreeDataSource'
import { selectBcTree } from '@selectors/selectors'
import { useDispatch } from 'react-redux'
import { treeActions } from '@slices/tree'
import { Lookup } from '@utils/Lookup'
import { TREE_SEARCH_MODES } from '@constants/tree'

export type { TableTreeNode }

export const useTableTree = (widgetMeta: AppWidgetMeta | undefined) => {
    const bcName = widgetMeta?.bcName
    const bcTreeState = useAppSelector(state => state.tree[bcName!])
    const { limit, defaultLimit, paginationType } = useTreePagination(bcName, widgetMeta)

    const calculateShowMoreState = useTreeShowMore(widgetMeta)

    const { fetchChildNodes, createFetchChildNodesHandler } = useTreeFetch(bcName, bcTreeState, limit, defaultLimit, paginationType)

    const dataSource = useTreeDataSource(
        bcTreeState,
        calculateShowMoreState,
        'end',
        !(bcTreeState?.filterActive && bcTreeState.searchMode === 'hide')
    )

    const expandedRowKeys = useAppSelector(state => selectBcTree(state, bcName)?.expandedParents) ?? []
    const dispatch = useDispatch()

    const handleExpand = React.useCallback(
        (expanded: boolean, record: CustomDataItem) => {
            if (expanded) {
                const nodeState = bcTreeState?.nodesState[record.id]
                const hidePagination = bcTreeState?.filterActive && bcTreeState.searchMode === 'hide'
                const needFetchFirstPage =
                    !nodeState ||
                    (bcTreeState.filterActive && Lookup.has([TREE_SEARCH_MODES.collapse], bcTreeState.searchMode)
                        ? nodeState?.filterPage === 0
                        : nodeState.page === 0)
                if (!hidePagination && needFetchFirstPage) {
                    fetchChildNodes(record.id as string, true, false)
                }
            }

            dispatch(treeActions.expandNode({ bcName: bcName!, nodeId: String(record[ROW_KEY]), value: expanded }))
        },
        [dispatch, bcName, bcTreeState?.searchMode, bcTreeState?.filterActive, bcTreeState?.nodesState, fetchChildNodes]
    )

    const restoreAncestorPaths = React.useCallback(
        (ids: string[]) => {
            if (bcName && ids.length > 0) {
                dispatch(treeActions.restoreNodePaths({ bcName, ids }))
            }
        },
        [bcName, dispatch]
    )

    return {
        expandedRowKeys,
        handleExpand,
        dataSource,
        createFetchNodesHandler: createFetchChildNodesHandler,
        restoreAncestorPaths,
        filterActive: bcTreeState?.filterActive
    }
}
