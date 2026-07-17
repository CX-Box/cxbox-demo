import { useCallback } from 'react'
import { Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@store'
import { selectBcTree, selectWidget } from '@selectors/selectors'
import { useRowSelection } from '@components/widgets/Table/massOperations/hooks/useRowSelection'
import { TREE_ROOT_ID } from '@components/widgets/Table/constants'
import { TableTreeNode } from '@components/widgets/Table/tree/hooks/useTreeDataSource'
import { useTreeShowMore } from '@components/widgets/Table/tree/hooks/useTreeShowMore'
import { isDefined } from '@utils/isDefined'
import { TreeNode } from '@slices/tree'
import { AppWidgetMeta } from '@interfaces/widget'
import { getTreeNodeIsLeaf, getTreeNodeParentId } from '@utils/tree'

export interface TreeRowSelectionSource {
    selectItems: (selected: boolean, changedRows: Array<Record<string, any>>) => void
    selectedRowKeys?: Array<string | number>
}

interface NodeSelectionState {
    checked: boolean
    indeterminate: boolean
    implicit: boolean
    disabled: boolean
}

type NodeId = string | number | null | undefined
type NodeRecordOrId = NodeId | Record<string, any>

const SELECTED_STATE: NodeSelectionState = { checked: true, indeterminate: false, implicit: false, disabled: false }
const UNSELECTED_STATE: NodeSelectionState = { checked: false, indeterminate: false, implicit: false, disabled: false }
const IMPLICITLY_SELECTED_STATE: NodeSelectionState = { checked: true, indeterminate: false, implicit: true, disabled: false }
const INDETERMINATE_IMPLICITLY_SELECTED_STATE: NodeSelectionState = {
    checked: false,
    indeterminate: true,
    implicit: true,
    disabled: false
}
const INDETERMINATE_SELECTED_STATE: NodeSelectionState = INDETERMINATE_IMPLICITLY_SELECTED_STATE // { checked: false, indeterminate: true, implicit: false, disabled: false }
const UNSELECTABLE_STATE: NodeSelectionState = { checked: false, indeterminate: false, implicit: false, disabled: true }
const PAGINATION_UNSELECT_WARNING =
    'Some items in this group are hidden behind "More" and haven\'t loaded yet. Unchecking this item will also deselect all hidden items - only the items currently visible will stay selected.'
const IMPLICIT_UNSELECT_WARNING = PAGINATION_UNSELECT_WARNING
const SELECT_ALL_WARNING = 'You\'re selecting this entire group, including items hidden behind "More".'
const DEFAULT_TREE_CONFIRMS = ['paginationUnselect', 'paginationSelect'] as const

/**
 * A nullish id points to the virtual root of the tree
 */
const normalizeNodeId = (nodeId: NodeId): string => (isDefined(nodeId) ? String(nodeId) : TREE_ROOT_ID)

const asNodeRecord = (recordOrId: NodeRecordOrId): Record<string, any> | null =>
    isDefined(recordOrId) && typeof recordOrId === 'object' ? recordOrId : null

const getNodeId = (recordOrId: NodeRecordOrId): string => {
    const record = asNodeRecord(recordOrId)

    return record ? normalizeNodeId(record.id) : normalizeNodeId(recordOrId as NodeId)
}

const getNodeRecordType = (recordOrId: NodeRecordOrId): TableTreeNode['_recordType'] => asNodeRecord(recordOrId)?._recordType

/**
 * Pseudo rows ('show-more'/'loading'/'empty'/'error') have no record behind them,
 * so they cannot be selected on their own.
 */
const isSelectableNode = (recordOrId: NodeRecordOrId): boolean => {
    const recordType = getNodeRecordType(recordOrId)

    return !isDefined(recordType) || recordType === 'node'
}

/**
 * A 'show-more' row stands for the not yet loaded rest of the parent group. `_disabled` is raised both when
 * there is nothing left to load and while the next page is loading, in the latter case the rest still exists.
 */
const hasUnloadedRest = (record: Record<string, any>): boolean => !record._disabled || record._loading === true

export const useTreeRowSelection = (widgetName: string, selectionSource?: TreeRowSelectionSource) => {
    const { t } = useTranslation()
    const defaultSelection = useRowSelection(widgetName)
    const baseSelection = selectionSource ?? defaultSelection
    const { selectItems, selectedRowKeys = [] } = baseSelection

    const widget = useAppSelector(state => selectWidget(state, widgetName)) as AppWidgetMeta | undefined
    const bcName = widget?.bcName
    const selectionMode = widget?.options?.tree?.selection ?? 'nodeAndLeaf'
    const confirms = widget?.options?.tree?.confirms ?? DEFAULT_TREE_CONFIRMS
    const treeState = useAppSelector(state => selectBcTree(state, bcName))
    const calculateShowMoreState = useTreeShowMore(widget)

    const hasEnabledShowMore = useCallback(
        (parentId: string): boolean => {
            if (!treeState) {
                return false
            }

            if (treeState.filterActive && treeState.searchMode === 'hide') {
                return false
            }

            const nodesState = treeState.nodesState
            const parentNodeState = nodesState[parentId]
            const childIds = treeState.childIdsByParent[parentId] ?? []
            const visibleChildCount =
                treeState.filterActive && treeState.searchMode === 'collapse'
                    ? childIds.filter(id => treeState.visibleNodeIdsForHidden.includes(String(id))).length
                    : childIds.length

            return calculateShowMoreState(parentId, nodesState, parentNodeState?.lastResponseCount ?? 0, visibleChildCount).visible
        },
        [calculateShowMoreState, treeState]
    )

    const resolveNodeRecord = useCallback(
        (nodeId: NodeId) => {
            const normalizedNodeId = normalizeNodeId(nodeId)

            // the virtual root has no record of its own
            return treeState?.nodes[normalizedNodeId] ?? { id: normalizedNodeId === 'null' ? null : normalizedNodeId }
        },
        [treeState]
    )

    const getLoadedDescendantIds = useCallback(
        (nodeId: NodeId): string[] => {
            if (!treeState) {
                return []
            }
            const childIds = treeState.childIdsByParent[normalizeNodeId(nodeId)] || []
            let descendantIds = [...childIds]

            childIds.forEach(childId => {
                descendantIds = descendantIds.concat(getLoadedDescendantIds(childId))
            })

            return descendantIds
        },
        [treeState]
    )

    const hasUnloadedDescendants = useCallback(
        (nodeId: string) => hasEnabledShowMore(nodeId) || getLoadedDescendantIds(nodeId).some(hasEnabledShowMore),
        [getLoadedDescendantIds, hasEnabledShowMore]
    )

    /**
     * Returns the highest loaded nodes that remain selectable after exclusions.
     * Once a node is included, its descendants are covered implicitly and must not be selected explicitly.
     */
    const getLoadedSelectionFrontierIds = useCallback(
        (nodeId: NodeId, excludedNodeIds: Set<string>): string[] => {
            if (!treeState) {
                return []
            }

            const selectionFrontierIds: string[] = []
            const pendingNodeIds = [...(treeState.childIdsByParent[normalizeNodeId(nodeId)] ?? [])]

            for (let index = 0; index < pendingNodeIds.length; index++) {
                const currentNodeId = pendingNodeIds[index]

                if (excludedNodeIds.has(currentNodeId)) {
                    pendingNodeIds.push(...(treeState.childIdsByParent[currentNodeId] ?? []))
                } else {
                    selectionFrontierIds.push(currentNodeId)
                }
            }

            return selectionFrontierIds
        },
        [treeState]
    )

    /**
     * Finds the closest loaded descendant matching the predicate.
     */
    const findClosestLoadedDescendantId = useCallback(
        (nodeId: NodeId, predicate: (descendant: TreeNode) => boolean): string | null => {
            if (!treeState) {
                return null
            }

            const descendantIds = [...(treeState.childIdsByParent[normalizeNodeId(nodeId)] ?? [])]
            const visitedNodeIds = new Set<string>()

            for (let index = 0; index < descendantIds.length; index++) {
                const descendantId = descendantIds[index]

                if (visitedNodeIds.has(descendantId)) {
                    continue
                }

                visitedNodeIds.add(descendantId)

                const descendant = treeState.nodes[descendantId]

                if (descendant && predicate(descendant)) {
                    return descendantId
                }

                descendantIds.push(...(treeState.childIdsByParent[descendantId] ?? []))
            }

            return null
        },
        [treeState]
    )

    /**
     * Ancestors of the node from the closest one up to the virtual root
     */
    const getAncestorIds = useCallback(
        (nodeId: NodeId): string[] => {
            if (!treeState) {
                return []
            }

            const ancestorIds: string[] = []
            let currentNodeId = normalizeNodeId(nodeId)

            while (currentNodeId !== TREE_ROOT_ID) {
                const parentId = normalizeNodeId(getTreeNodeParentId(treeState.nodes[currentNodeId], treeState.parentFieldKey))

                ancestorIds.push(parentId)
                currentNodeId = parentId
            }

            return ancestorIds
        },
        [treeState]
    )

    const getClosestExplicitlySelectedAncestorId = useCallback(
        (nodeId: NodeId): string | null => {
            return getAncestorIds(nodeId).find(ancestorId => selectedRowKeys.includes(ancestorId)) ?? null
        },
        [getAncestorIds, selectedRowKeys]
    )

    const getExplicitSelectionSourceId = useCallback(
        (nodeId: NodeId): string | null => {
            const normalizedNodeId = normalizeNodeId(nodeId)

            return selectedRowKeys.includes(normalizedNodeId) ? normalizedNodeId : getClosestExplicitlySelectedAncestorId(normalizedNodeId)
        },
        [getClosestExplicitlySelectedAncestorId, selectedRowKeys]
    )

    const isCoveredByExplicitSelection = useCallback(
        (nodeId: NodeId): boolean => {
            return isDefined(getExplicitSelectionSourceId(nodeId))
        },
        [getExplicitSelectionSourceId]
    )

    const hasExplicitlySelectedChildren = useCallback(
        (nodeId: NodeId): boolean => {
            const childIds = treeState?.childIdsByParent[normalizeNodeId(nodeId)] ?? []

            return childIds.some(childId => selectedRowKeys.includes(childId))
        },
        [selectedRowKeys, treeState]
    )

    const checkNodeSelectionState = useCallback(
        (nodeId: string): NodeSelectionState => {
            const isExplicitlySelected = selectedRowKeys.includes(nodeId)

            if (isExplicitlySelected) {
                return SELECTED_STATE
            }

            if (getClosestExplicitlySelectedAncestorId(nodeId)) {
                return IMPLICITLY_SELECTED_STATE
            }

            if (!treeState) {
                return UNSELECTED_STATE
            }

            const childIds = treeState.childIdsByParent[nodeId]

            if (childIds?.length > 0) {
                let allChecked = true
                let anyCheckedOrIndeterminate = false
                let hasImplicitlySelectedChild = false

                for (const childId of childIds) {
                    const childState = checkNodeSelectionState(childId)

                    if (!childState.checked) {
                        allChecked = false
                    }

                    if (childState.checked || childState.indeterminate) {
                        anyCheckedOrIndeterminate = true
                    }

                    if (childState.implicit) {
                        hasImplicitlySelectedChild = true
                    }
                }

                if (allChecked) {
                    if (hasEnabledShowMore(nodeId)) {
                        return hasImplicitlySelectedChild ? INDETERMINATE_IMPLICITLY_SELECTED_STATE : INDETERMINATE_SELECTED_STATE
                    }

                    return IMPLICITLY_SELECTED_STATE
                }

                if (anyCheckedOrIndeterminate) {
                    return hasImplicitlySelectedChild ? INDETERMINATE_IMPLICITLY_SELECTED_STATE : INDETERMINATE_SELECTED_STATE
                }
            }

            return UNSELECTED_STATE
        },
        [getClosestExplicitlySelectedAncestorId, hasEnabledShowMore, selectedRowKeys, treeState]
    )

    const isSelectionAggregatedFromChildren = useCallback(
        (nodeId: string): boolean => {
            const { implicit } = checkNodeSelectionState(nodeId)

            return implicit && !isCoveredByExplicitSelection(nodeId)
        },
        [checkNodeSelectionState, isCoveredByExplicitSelection]
    )

    const checkShowMoreSelectionState = useCallback(
        (record: Record<string, any>): NodeSelectionState => {
            const isRestSelected =
                hasUnloadedRest(record) && isCoveredByExplicitSelection(record.parentId) && !hasExplicitlySelectedChildren(record.parentId)

            return isRestSelected ? IMPLICITLY_SELECTED_STATE : UNSELECTABLE_STATE
        },
        [hasExplicitlySelectedChildren, isCoveredByExplicitSelection]
    )

    const getNodeSelectionState = useCallback(
        (recordOrId: NodeRecordOrId): NodeSelectionState => {
            const recordType = getNodeRecordType(recordOrId)

            if (recordType === 'show-more') {
                return checkShowMoreSelectionState(recordOrId as Record<string, any>)
            }

            if (!isSelectableNode(recordOrId)) {
                return UNSELECTABLE_STATE
            }

            const nodeId = getNodeId(recordOrId)
            const state = checkNodeSelectionState(nodeId)
            const record = asNodeRecord(recordOrId) ?? treeState?.nodes[nodeId]
            const selectionAllowed =
                selectionMode === 'nodeAndLeaf' ||
                (selectionMode === 'leaf' && getTreeNodeIsLeaf(record, treeState?.isLeafFieldKey ?? 'isLeaf')) ||
                (selectionMode === 'node' && !getTreeNodeIsLeaf(record, treeState?.isLeafFieldKey ?? 'isLeaf'))

            return selectionAllowed ? state : { ...state, disabled: true }
        },
        [checkNodeSelectionState, checkShowMoreSelectionState, selectionMode, treeState?.isLeafFieldKey, treeState?.nodes]
    )

    const handleSelectNode = useCallback(
        (nodeId: string) => {
            const nodeRecord = resolveNodeRecord(nodeId)
            const loadedDescendantIds = getLoadedDescendantIds(nodeId)
            const descendantRecordsToDeselect = loadedDescendantIds
                .filter(descendantId => selectedRowKeys.includes(descendantId))
                .map(resolveNodeRecord)

            if (descendantRecordsToDeselect.length > 0) {
                selectItems(false, descendantRecordsToDeselect)
            }

            selectItems(true, [nodeRecord])
        },
        [getLoadedDescendantIds, resolveNodeRecord, selectedRowKeys, selectItems]
    )

    const switchToManualSelection = useCallback(
        (selectedAncestorId: string, excludedNodeIds: Set<string>) => {
            const loadedDescendantIds = getLoadedDescendantIds(selectedAncestorId)
            const selectedRecordsToDeselect = [selectedAncestorId, ...loadedDescendantIds]
                .filter(nodeId => selectedRowKeys.includes(nodeId))
                .map(resolveNodeRecord)
            const selectionFrontierRecords = getLoadedSelectionFrontierIds(selectedAncestorId, excludedNodeIds).map(resolveNodeRecord)

            if (selectedRecordsToDeselect.length > 0) {
                selectItems(false, selectedRecordsToDeselect)
            }
            if (selectionFrontierRecords.length > 0) {
                selectItems(true, selectionFrontierRecords)
            }
        },
        [getLoadedDescendantIds, getLoadedSelectionFrontierIds, resolveNodeRecord, selectItems, selectedRowKeys]
    )

    const requestPaginationUnselect = useCallback(
        (selectedAncestorId: string, excludedNodeIds: Set<string>, warning: string) => {
            if (!confirms.includes('paginationUnselect')) {
                switchToManualSelection(selectedAncestorId, excludedNodeIds)
                return
            }

            Modal.confirm({
                title: t(warning),
                onOk: () => switchToManualSelection(selectedAncestorId, excludedNodeIds)
            })
        },
        [confirms, switchToManualSelection, t]
    )

    const requestSelectGroup = useCallback(
        (nodeId: string) => {
            if (!confirms.includes('paginationSelect') || !hasUnloadedDescendants(nodeId)) {
                handleSelectNode(nodeId)
                return
            }

            Modal.confirm({
                title: t(SELECT_ALL_WARNING),
                onOk: () => handleSelectNode(nodeId)
            })
        },
        [confirms, handleSelectNode, hasUnloadedDescendants, t]
    )

    const handleUnselectNode = useCallback(
        (nodeId: string) => {
            const selectedAncestorId = getClosestExplicitlySelectedAncestorId(nodeId)

            if (!selectedAncestorId) {
                selectItems(false, [resolveNodeRecord(nodeId)])

                return
            }

            // ancestors of the unchecked node stay out of the selection, otherwise the node would be
            // covered by them again, its own descendants stay out because unchecking a group excludes them
            requestPaginationUnselect(
                selectedAncestorId,
                new Set([nodeId, ...getAncestorIds(nodeId), ...getLoadedDescendantIds(nodeId)]),
                IMPLICIT_UNSELECT_WARNING
            )
        },
        [
            getAncestorIds,
            getClosestExplicitlySelectedAncestorId,
            getLoadedDescendantIds,
            resolveNodeRecord,
            selectItems,
            requestPaginationUnselect
        ]
    )

    /**
     * The not loaded rest of a group can only be covered by the group selection itself, so unchecking it
     * keeps the loaded records of the group selected and leaves the group and everything above it out.
     */
    const handleUnselectShowMore = useCallback(
        (record: Record<string, any>) => {
            const parentId = normalizeNodeId(record.parentId)
            const selectionSourceId = getExplicitSelectionSourceId(parentId)

            if (!selectionSourceId) {
                return
            }

            requestPaginationUnselect(selectionSourceId, new Set([parentId, ...getAncestorIds(parentId)]), PAGINATION_UNSELECT_WARNING)
        },
        [getAncestorIds, getExplicitSelectionSourceId, requestPaginationUnselect]
    )

    const selectNode = useCallback(
        (recordOrId: NodeRecordOrId, checked: boolean) => {
            if (getNodeRecordType(recordOrId) === 'show-more') {
                if (!checked) {
                    handleUnselectShowMore(recordOrId as Record<string, any>)
                }

                return
            }

            if (!isSelectableNode(recordOrId)) {
                return
            }

            const nodeId = getNodeId(recordOrId)
            const record = asNodeRecord(recordOrId) ?? treeState?.nodes[nodeId]
            const selectionAllowed =
                selectionMode === 'nodeAndLeaf' ||
                (selectionMode === 'leaf' && getTreeNodeIsLeaf(record, treeState?.isLeafFieldKey ?? 'isLeaf')) ||
                (selectionMode === 'node' && !getTreeNodeIsLeaf(record, treeState?.isLeafFieldKey ?? 'isLeaf'))

            if (!selectionAllowed) {
                return
            }

            if (checked || isSelectionAggregatedFromChildren(nodeId)) {
                if (!getTreeNodeIsLeaf(record, treeState?.isLeafFieldKey ?? 'isLeaf')) {
                    requestSelectGroup(nodeId)
                } else {
                    handleSelectNode(nodeId)
                }
            } else {
                handleUnselectNode(nodeId)
            }
        },
        [
            handleSelectNode,
            handleUnselectNode,
            handleUnselectShowMore,
            isSelectionAggregatedFromChildren,
            requestSelectGroup,
            selectionMode,
            treeState?.isLeafFieldKey,
            treeState?.nodes
        ]
    )

    return {
        ...baseSelection,
        selectNode,
        getNodeSelectionState,
        findClosestLoadedDescendantId
    }
}
