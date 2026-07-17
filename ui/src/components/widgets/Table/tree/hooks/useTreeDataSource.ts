import { useCallback, useMemo } from 'react'
import { TreeNode, BcTreeState } from '@slices/tree'
import { RESTORE_ANCESTORS_ID } from '@components/widgets/Table/constants'

export type RestoreAncestorsPosition = 'start' | 'end'

export type TableTreeNode = TreeNode & {
    children?: TableTreeNode[]
    _recordType?: 'node' | 'show-more' | 'loading' | 'error' | 'empty' | 'restore-ancestors'
    _disabled?: boolean
    _loading?: boolean
    _level: number
    _matchesFilter?: boolean
    _restorePath?: boolean
    _treeParentId?: string | null
    _remainingNumberOfRecords?: string | number | undefined
    _treeIsLeaf?: boolean
}

export const useTreeDataSource = (
    bcTreeState: BcTreeState | undefined,
    calculateShowMoreState: (
        parentId: string,
        nodeStates: BcTreeState['nodesState'],
        loadedChildCount: number,
        visibleChildCount: number
    ) => {
        visible: boolean
        disabled: boolean
        count?: string | number | undefined
    },
    restoreAncestorsPosition: RestoreAncestorsPosition = 'end',
    showBranchPagination = true
) => {
    const convertTreeStateToDataSource = useCallback(
        (
            nodesById: Record<string, TreeNode>,
            childIdsByParentId: Record<string, string[]>,
            nodeStates: BcTreeState['nodesState'],
            visibleNodeIds?: Set<string>,
            matchedNodeIds?: Set<string>
        ): TableTreeNode[] => {
            const appendPseudoNodes = (childNodes: TableTreeNode[], parentId: string | null, isLoading: boolean, level: number) => {
                if (!showBranchPagination || (visibleNodeIds && parentId === null)) {
                    return
                }
                const hasChildren = childNodes.length > 0
                const normalizedParentId = String(parentId)
                const { visible, disabled, count } = calculateShowMoreState(
                    normalizedParentId,
                    nodeStates,
                    nodeStates[normalizedParentId]?.lastResponseCount ?? childNodes.length,
                    childNodes.length
                )

                if (!hasChildren && isLoading && level !== 0) {
                    childNodes.push({
                        id: `loading-${parentId}`,
                        vstamp: 0,
                        parentId: parentId,
                        name: 'loading',
                        _recordType: 'loading',
                        _level: level
                    } as TableTreeNode)
                } else if (visible) {
                    const hideShowMore = bcTreeState?.filterActive && bcTreeState.searchMode === 'collapse' && parentId === null

                    if (hideShowMore) {
                        return
                    }

                    childNodes.push({
                        id: `show-more-${parentId}`,
                        vstamp: 0,
                        parentId: parentId,
                        name: 'show-more',
                        _remainingNumberOfRecords: count,
                        _recordType: 'show-more',
                        _disabled: disabled || isLoading,
                        _loading: isLoading,
                        _level: level
                    } as TableTreeNode)
                } else if (!hasChildren && level !== 0) {
                    childNodes.push({
                        id: `empty-${parentId}`,
                        vstamp: 0,
                        parentId: parentId,
                        name: 'empty',
                        _recordType: 'empty',
                        _level: level
                    } as TableTreeNode)
                }
            }

            const getChildNodesWithPseudoNodes = (
                parentId: string | null,
                buildNode: (nodeId: string, level: number) => TableTreeNode | null,
                level: number
            ) => {
                const normalizedParentId = String(parentId)
                const childIds = childIdsByParentId[normalizedParentId] || []
                const childNodes = childIds
                    .filter(childId => !visibleNodeIds || visibleNodeIds.has(String(childId)))
                    .map(childId => buildNode(childId, level))
                    .filter(Boolean) as TableTreeNode[]

                const parentNodeState = nodeStates[normalizedParentId]
                const isLoading = parentNodeState?.loading || false

                appendPseudoNodes(childNodes, parentId, isLoading, level)

                return childNodes
            }

            const buildTreeNode = (nodeId: string, currentLevel: number): TableTreeNode | null => {
                const node = nodesById[nodeId]

                if (!node) {
                    return null
                }

                const parentId = node[bcTreeState?.parentFieldKey ?? 'parentId'] as string | null | undefined
                const isLeaf = node[bcTreeState?.isLeafFieldKey ?? 'isLeaf'] === true
                const childNodes = getChildNodesWithPseudoNodes(nodeId, buildTreeNode, currentLevel + 1)
                const hasActualChildren = childNodes.some(child => child._recordType === 'node')
                const technicalIsLeaf = isLeaf && !hasActualChildren

                if (isLeaf && hasActualChildren) {
                    console.error(`Tree node "${nodeId}" is marked as leaf but has children`)
                }

                return {
                    ...node,
                    _recordType: 'node',
                    _level: currentLevel,
                    _matchesFilter: matchedNodeIds?.has(String(node.id)),
                    _treeParentId: parentId,
                    _treeIsLeaf: technicalIsLeaf,
                    children: technicalIsLeaf ? undefined : childNodes
                }
            }

            const rootNodes = getChildNodesWithPseudoNodes(null, buildTreeNode, 0)
            const orphanRootIds = Object.values(nodesById)
                .filter(node => {
                    const parentId = node[bcTreeState?.parentFieldKey ?? 'parentId']

                    return (
                        parentId != null &&
                        (!nodesById[String(parentId)] || (visibleNodeIds && !visibleNodeIds.has(String(parentId)))) &&
                        (!visibleNodeIds || visibleNodeIds.has(String(node.id)))
                    )
                })
                .map(node => String(node.id))
            const orphanNodes = orphanRootIds
                .map(nodeId => buildTreeNode(nodeId, 1))
                .filter(Boolean)
                .map(node => ({ ...node!, _restorePath: true })) as TableTreeNode[]

            if (orphanNodes.length === 0) {
                return rootNodes
            }

            const restoreAncestorsNode = {
                id: RESTORE_ANCESTORS_ID,
                vstamp: 0,
                parentId: null,
                name: 'restore-ancestors',
                isLeaf: false,
                _recordType: 'restore-ancestors',
                _level: 0,
                children: orphanNodes
            } as TableTreeNode

            return restoreAncestorsPosition === 'start' ? [restoreAncestorsNode, ...rootNodes] : [...rootNodes, restoreAncestorsNode]
        },
        [
            bcTreeState?.filterActive,
            bcTreeState?.isLeafFieldKey,
            bcTreeState?.parentFieldKey,
            bcTreeState?.searchMode,
            calculateShowMoreState,
            restoreAncestorsPosition,
            showBranchPagination
        ]
    )

    return useMemo(() => {
        if (!bcTreeState) {
            return []
        }

        const matchedNodeIds = bcTreeState.filterActive ? new Set(bcTreeState.matchedNodeIds) : undefined
        let visibleNodeIds: Set<string> | undefined

        if (bcTreeState.filterActive && (bcTreeState.searchMode === 'hide' || bcTreeState.searchMode === 'collapse')) {
            visibleNodeIds = new Set(bcTreeState.visibleNodeIdsForHidden)
        }

        return convertTreeStateToDataSource(
            bcTreeState.nodes,
            bcTreeState.childIdsByParent,
            bcTreeState.nodesState,
            visibleNodeIds,
            matchedNodeIds
        )
    }, [bcTreeState, convertTreeStateToDataSource])
}
