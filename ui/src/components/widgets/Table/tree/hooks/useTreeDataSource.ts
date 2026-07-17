import { useCallback, useMemo } from 'react'
import { TreeNode, BcTreeState } from '@slices/tree'
import { RESTORE_ANCESTORS_ID, TREE_ROOT_ID, UNALLOCATED_NODES_ID } from '@components/widgets/Table/constants'
import { TEXT_SEPARATOR_FOR_NEST_LEVEL } from '@constants/tree'

export type RestoreAncestorsPosition = 'start' | 'end'

export type TableTreeNode = TreeNode & {
    children?: TableTreeNode[]
    _recordType?: 'node' | 'show-more' | 'loading' | 'error' | 'empty' | 'restore-ancestors' | 'unallocated-nodes'
    _disabled?: boolean
    _loading?: boolean
    _level: number
    _matchesFilter?: boolean
    _restorePath?: boolean
    _branchType?: 'restore-ancestors' | 'unallocated-nodes' | string
    _treeParentId?: string | null
    _remainingNumberOfRecords?: string | number | undefined
    _countInfoMessage?: string
    _treeIsLeaf?: boolean
    _nestingLevel?: number
    _separatorText?: string
}

export const isRestoreAncestorsBranch = ({ _branchType }: Pick<TableTreeNode, '_branchType'>) => {
    return _branchType === 'restore-ancestors'
}

export const isUnallocatedNodesBranch = ({ _branchType }: Pick<TableTreeNode, '_branchType'>) => {
    return _branchType === 'unallocated-nodes'
}

const getMaxNestingLevel = (nodes: TableTreeNode[]): number =>
    nodes.reduce((maxLevel, node) => {
        const nodeLevel = node._recordType === 'node' ? node._level : 0
        const childrenLevel = node.children ? getMaxNestingLevel(node.children) : 0

        return Math.max(maxLevel, nodeLevel, childrenLevel)
    }, 0)

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
        countInfoMessage?: string
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
            const appendPseudoNodes = (
                childNodes: TableTreeNode[],
                parentId: string | null,
                isLoading: boolean,
                level: number,
                branchType?: string
            ) => {
                if (!showBranchPagination) {
                    return
                }
                const hasChildren = childNodes.length > 0
                const normalizedParentId = String(parentId)
                const { visible, disabled, count, countInfoMessage } = calculateShowMoreState(
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
                        _level: level,
                        _branchType: branchType
                    } as TableTreeNode)
                } else if (visible) {
                    childNodes.push({
                        id: `show-more-${parentId}`,
                        vstamp: 0,
                        parentId: parentId,
                        name: 'show-more',
                        _remainingNumberOfRecords: count,
                        _countInfoMessage: countInfoMessage,
                        _recordType: 'show-more',
                        _disabled: disabled || isLoading,
                        _loading: isLoading,
                        _level: level,
                        _branchType: branchType
                    } as TableTreeNode)
                } else if (!hasChildren && level !== 0) {
                    childNodes.push({
                        id: `empty-${parentId}`,
                        vstamp: 0,
                        parentId: parentId,
                        name: 'empty',
                        _recordType: 'empty',
                        _level: level,
                        _branchType: branchType
                    } as TableTreeNode)
                }
            }

            const getChildNodesWithPseudoNodes = (
                parentId: string | null,
                buildNode: (nodeId: string, level: number, branchType?: string) => TableTreeNode | null,
                level: number,
                branchType?: string
            ) => {
                const normalizedParentId = String(parentId)
                const childIds = childIdsByParentId[normalizedParentId] || []
                const childNodes = childIds
                    .filter(childId => !visibleNodeIds || visibleNodeIds.has(String(childId)))
                    .map(childId => buildNode(childId, level, branchType))
                    .filter(Boolean) as TableTreeNode[]

                const parentNodeState = nodeStates[normalizedParentId]
                const isLoading = parentNodeState?.loading || false

                appendPseudoNodes(childNodes, parentId, isLoading, level, branchType)

                return childNodes
            }

            const buildTreeNode = (nodeId: string, currentLevel: number, branchType?: string): TableTreeNode | null => {
                const node = nodesById[nodeId]

                if (!node) {
                    return null
                }

                const parentId = node[bcTreeState?.parentFieldKey ?? 'parentId'] as string | null | undefined
                const isLeaf = node[bcTreeState?.isLeafFieldKey ?? 'isLeaf'] === true
                const childNodes = getChildNodesWithPseudoNodes(nodeId, buildTreeNode, currentLevel + 1, branchType)
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
                    _branchType: branchType,
                    children: technicalIsLeaf ? undefined : childNodes
                }
            }

            const rootNodes = getChildNodesWithPseudoNodes(null, buildTreeNode, 0)
            const unallocatedNodeIds = new Set(bcTreeState?.unallocatedNodeIds ?? [])
            const unallocatedNodes = [...unallocatedNodeIds]
                .map(nodeId => buildTreeNode(nodeId, 0, 'unallocated-nodes'))
                .filter(Boolean)
                .map(node => ({ ...node, _branchType: 'unallocated-nodes' })) as TableTreeNode[]

            const orphanRootIds = Object.values(nodesById)
                .filter(node => {
                    const parentId = node[bcTreeState?.parentFieldKey ?? 'parentId']

                    return (
                        !unallocatedNodeIds.has(String(node.id)) &&
                        parentId != null &&
                        (!nodesById[String(parentId)] || (visibleNodeIds && !visibleNodeIds.has(String(parentId)))) &&
                        (!visibleNodeIds || visibleNodeIds.has(String(node.id)))
                    )
                })
                .map(node => String(node.id))
            const orphanNodes = orphanRootIds
                .map(nodeId => buildTreeNode(nodeId, 0, 'restore-ancestors'))
                .filter(Boolean)
                .map(node => ({ ...node!, _restorePath: true, _branchType: 'restore-ancestors' })) as TableTreeNode[]

            const unallocatedNodesGroup = unallocatedNodes.length
                ? ([
                      {
                          id: UNALLOCATED_NODES_ID,
                          vstamp: 0,
                          name: 'unallocated-nodes',
                          _recordType: 'unallocated-nodes',
                          _level: 0,
                          _branchType: 'unallocated-nodes',
                          children: unallocatedNodes
                      } as TableTreeNode
                  ] as TableTreeNode[])
                : []

            const filterHasNoVisibleData =
                bcTreeState?.filterActive &&
                !bcTreeState.filterPagination.loading &&
                !rootNodes.some(node => node._recordType === 'node') &&
                orphanNodes.length === 0

            const restoreAncestorsNode = {
                id: RESTORE_ANCESTORS_ID,
                vstamp: 0,
                parentId: null,
                name: 'restore-ancestors',
                isLeaf: false,
                _recordType: 'restore-ancestors',
                _level: 0,
                _nestingLevel: TEXT_SEPARATOR_FOR_NEST_LEVEL?.includes('{{limit}}') ? getMaxNestingLevel(orphanNodes) : undefined,
                _separatorText: TEXT_SEPARATOR_FOR_NEST_LEVEL ?? undefined,
                _branchType: 'restore-ancestors',
                children: orphanNodes
            } as TableTreeNode

            if (filterHasNoVisibleData) {
                restoreAncestorsNode.children = [
                    {
                        id: 'empty-null',
                        vstamp: 0,
                        parentId: null,
                        name: 'empty',
                        _recordType: 'empty',
                        _level: 0,
                        _branchType: 'restore-ancestors'
                    } as TableTreeNode
                ]
            }

            const isRootExpanded = bcTreeState?.expandedParents ? bcTreeState.expandedParents.includes(TREE_ROOT_ID) : true
            const visibleRootNodes = isRootExpanded ? rootNodes : []

            if (restoreAncestorsNode.children?.length === 0) {
                return [...unallocatedNodesGroup, ...visibleRootNodes]
            }

            return restoreAncestorsPosition === 'start'
                ? [...unallocatedNodesGroup, restoreAncestorsNode, ...visibleRootNodes]
                : [...unallocatedNodesGroup, ...visibleRootNodes, restoreAncestorsNode]
        },
        [
            bcTreeState?.filterActive,
            bcTreeState?.filterPagination.loading,
            bcTreeState?.isLeafFieldKey,
            bcTreeState?.parentFieldKey,
            bcTreeState?.unallocatedNodeIds,
            bcTreeState?.expandedParents,
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
