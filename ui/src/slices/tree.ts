import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BcMetaState, DataItem } from '@cxbox-ui/core'
import { actions } from '@actions'
import { FIELDS } from '@constants'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { isDefined } from '@utils/isDefined'
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT, MAIN_DEFAULT_PAGINATION_TYPE, PaginationMode } from '@constants/pagination'
import { AnyAction } from 'redux'
import { TreeExpandedStateAfterFilter, TreeSearchModes } from '@interfaces/widget'
import { DEFAULT_EXPANDED_STATE_AFTER_FILTER, DEFAULT_SEARCH_MODE, TREE_ROOT_ID } from '@constants/tree'
import {
    collectRootConnectedNodeIds,
    collectSubtreeNodeIds,
    DEFAULT_TREE_IS_LEAF_FIELD_KEY,
    DEFAULT_TREE_PARENT_FIELD_KEY,
    extractNodeIds,
    getAncestorNodeIds,
    getTreeNodeIsLeaf,
    getTreeNodeParentId,
    normalizeNodeId
} from '@utils/tree'
import { getTreePaginationControlsState } from '@components/widgets/Table/tree/utils/getTreePaginationControlsState'

export interface TreeNode extends CustomDataItem {
    id: string
    name: string
    hasChildren?: boolean
}

export interface BcTreeState {
    nodes: Record<string, TreeNode>
    childIdsByParent: Record<string, string[]>
    nodesState: Record<
        string,
        Pick<BcMetaState, 'loading' | 'page' | 'hasNext'> & { lastResponseCount?: number; count?: number; filterPage?: number }
    >
    errors: Record<string, string | null>
    expandedParents: string[]
    unallocatedNodeIds: string[]
    searchMode: TreeSearchModes
    paginationType: PaginationMode
    filterActive: boolean
    matchedNodeIds: string[]
    filterResultNodeIds: string[]
    visibleNodeIdsForHidden: string[]
    filterPagination: Pick<BcMetaState, 'loading' | 'page' | 'hasNext'> & {
        lastResponseCount?: number
        count?: number
    }
    parentFieldKey: string
    isLeafFieldKey: string
    expandedParentsBeforeFilter?: string[]
    expandedStateAfterFilter: TreeExpandedStateAfterFilter
}

type TreeSate = { [bcName: string]: BcTreeState | undefined }

const initialState: TreeSate = {}

export function createDictionaryFrom<T extends Record<string, any>>(recordKey: string, data: T[]): Record<string, T> {
    return data.reduce((acc: Record<string, any>, dataItem) => {
        if (dataItem[recordKey]) {
            acc[dataItem[recordKey]] = dataItem
        }

        return acc
    }, {})
}

export function dataByCategory<T extends Record<string, any>>(recordKey: string, data: T[]): Record<string, T[]> {
    return data.reduce((acc: Record<string, T[]>, dataItem) => {
        const key = dataItem[recordKey]

        if (key !== undefined) {
            if (!acc[key]) {
                acc[key] = []
            }

            acc[key].push(dataItem)
        }

        return acc
    }, {})
}

export const getUniqueValues = <T>(array: T[]): T[] => {
    return [...new Set(array)]
}

export const pick = <T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> =>
    keys.reduce((acc, key) => {
        if (key in obj) {
            acc[key] = obj[key]
        }
        return acc
    }, {} as Pick<T, K>)

const initBcTreeState = (initialTreeState?: Partial<BcTreeState>): BcTreeState => ({
    nodes: {},
    childIdsByParent: {},
    nodesState: {},
    errors: {},
    expandedParents: [TREE_ROOT_ID],
    unallocatedNodeIds: [],
    searchMode: DEFAULT_SEARCH_MODE,
    paginationType: MAIN_DEFAULT_PAGINATION_TYPE,
    filterActive: false,
    matchedNodeIds: [],
    filterResultNodeIds: [],
    visibleNodeIdsForHidden: [],
    filterPagination: {},
    parentFieldKey: DEFAULT_TREE_PARENT_FIELD_KEY,
    isLeafFieldKey: DEFAULT_TREE_IS_LEAF_FIELD_KEY,
    expandedStateAfterFilter: DEFAULT_EXPANDED_STATE_AFTER_FILTER,
    ...initialTreeState
})

const initializeUnloadedBranchState = (tree: BcTreeState, parentId: string) => {
    const nodeState = tree.nodesState[parentId] ?? (tree.nodesState[parentId] = {})

    if (!isDefined(nodeState.page)) {
        nodeState.page = 0

        if (!isDefined(nodeState.hasNext)) {
            nodeState.hasNext = true
        }
    }

    if (tree.filterActive && tree.searchMode === 'collapse' && !isDefined(nodeState.filterPage)) {
        nodeState.filterPage = 0
    }
}

const getExpandedPathIds = (tree: BcTreeState, nodeIds: string[]): Set<string> => {
    const expandedPathIds = new Set<string>()

    nodeIds.forEach(id => {
        const ancestorIds = getAncestorNodeIds(id, nodeId => tree.nodes[nodeId], tree.parentFieldKey)
        ancestorIds.forEach(ancestorId => expandedPathIds.add(ancestorId))
    })

    return expandedPathIds
}

const getExpandedVisibleParentIds = (tree: BcTreeState) => {
    const visibleNodeIds = new Set(tree.visibleNodeIdsForHidden)

    return new Set(
        Object.entries(tree.childIdsByParent)
            .filter(([parentId, childIds]) => visibleNodeIds.has(parentId) && childIds.some(childId => visibleNodeIds.has(childId)))
            .map(([parentId]) => parentId)
    )
}

const adjustKnownChildCount = (tree: BcTreeState, parentId: string, delta: number) => {
    const nodeState = tree.nodesState[parentId]

    if (typeof nodeState?.count === 'number') {
        nodeState.count = Math.max(0, nodeState.count + delta)
    }
}

const adjustKnownCount = (pagination: { count?: number }, delta: number) => {
    if (typeof pagination.count === 'number') {
        pagination.count = Math.max(0, pagination.count + delta)
    }
}

const hasUnloadedItems = (
    tree: BcTreeState,
    pagination: BcTreeState['nodesState'][string] | BcTreeState['filterPagination'],
    limit?: number
) => {
    const resolvedLimit = limit ?? DEFAULT_PAGE_LIMIT
    const controls = getTreePaginationControlsState({
        type: tree.paginationType,
        page: pagination.page ?? DEFAULT_PAGE,
        limit: resolvedLimit,
        defaultLimit: resolvedLimit,
        loadedCount: pagination.lastResponseCount ?? 0,
        hasNext: pagination.hasNext,
        total: pagination.count
    })

    return controls.visible && !controls.nextDisabled
}

const invalidatePaginationTail = (
    tree: BcTreeState,
    pagination: BcTreeState['nodesState'][string] | BcTreeState['filterPagination'],
    limit?: number
) => {
    const mayHaveUnloadedItems = hasUnloadedItems(tree, pagination, limit)

    if (!mayHaveUnloadedItems) {
        return
    }

    // The cached ids stay available, while the last confirmed server page is requested again.
    // This closes the offset gap without resetting the whole branch.
    pagination.page = Math.max(0, (pagination.page ?? DEFAULT_PAGE) - 1)
    if ('filterPage' in pagination && isDefined(pagination.filterPage)) {
        pagination.filterPage = Math.min(pagination.filterPage, pagination.page)
    }
}

const replaceId = (ids: string[], previousId: string, nextId: string) => getUniqueValues(ids.map(id => (id === previousId ? nextId : id)))

const replaceNodeIdInCollections = (tree: BcTreeState, previousId: string, nextId: string) => {
    tree.matchedNodeIds = replaceId(tree.matchedNodeIds, previousId, nextId)
    tree.filterResultNodeIds = replaceId(tree.filterResultNodeIds, previousId, nextId)
    tree.visibleNodeIdsForHidden = replaceId(tree.visibleNodeIdsForHidden, previousId, nextId)
}

const removeNodeIdsFromFilterCollections = (tree: BcTreeState, nodeIds: string[]) => {
    const idsToRemove = new Set(nodeIds)
    tree.matchedNodeIds = tree.matchedNodeIds.filter(id => !idsToRemove.has(id))
    tree.filterResultNodeIds = tree.filterResultNodeIds.filter(id => !idsToRemove.has(id))
    tree.visibleNodeIdsForHidden = tree.visibleNodeIdsForHidden.filter(id => !idsToRemove.has(id))
}

const detachNodeId = (tree: BcTreeState, nodeId: string) => {
    Object.keys(tree.childIdsByParent).forEach(parentId => {
        tree.childIdsByParent[parentId] = tree.childIdsByParent[parentId].filter(id => id !== nodeId)
    })
    tree.unallocatedNodeIds = tree.unallocatedNodeIds.filter(id => id !== nodeId)
}

const removeNodeIdFromCollections = (tree: BcTreeState, nodeId: string) => {
    detachNodeId(tree, nodeId)
    tree.expandedParents = tree.expandedParents.filter(id => id !== nodeId)
    removeNodeIdsFromFilterCollections(tree, [nodeId])
}

const removeNodeData = (tree: BcTreeState, nodeId: string) => {
    removeNodeIdFromCollections(tree, nodeId)
    delete tree.nodes[nodeId]
    delete tree.nodesState[nodeId]
    delete tree.errors[nodeId]
    delete tree.childIdsByParent[nodeId]
}

const removeSubtree = (tree: BcTreeState, nodeId: string, includeRoot: boolean) => {
    const idsToRemove = collectSubtreeNodeIds(nodeId, id => tree.childIdsByParent[id], { includeSelf: includeRoot })

    idsToRemove.forEach(id => removeNodeData(tree, id))

    if (!includeRoot) {
        delete tree.childIdsByParent[nodeId]
        delete tree.nodesState[nodeId]
        delete tree.errors[nodeId]
        tree.expandedParents = tree.expandedParents.filter(id => id !== nodeId)
    }

    return idsToRemove
}

const removeDraftNodes = (tree: BcTreeState) => {
    Object.values(tree.nodes)
        .filter(node => node.vstamp === -1)
        .forEach(node => removeSubtree(tree, String(node.id), true))
}

const upsertTreeNode = (
    tree: BcTreeState,
    previousId: string,
    dataItem: DataItem,
    limit?: number,
    previousMatchesFilters = false,
    matchesFilters = true,
    insertPosition: 'start' | 'end' = 'start'
) => {
    if (!isDefined(dataItem[FIELDS.TECHNICAL.ID])) {
        return
    }

    const nextId = String(dataItem[FIELDS.TECHNICAL.ID])
    const previousNode = tree.nodes[previousId] ?? tree.nodes[nextId]
    const previousNodeId = tree.nodes[previousId] ? previousId : nextId
    const nextNode = { ...previousNode, ...dataItem, id: nextId } as TreeNode
    const wasUnallocated = tree.unallocatedNodeIds.includes(previousId) || tree.unallocatedNodeIds.includes(nextId)
    const previousParentId = previousNode ? normalizeNodeId(getTreeNodeParentId(previousNode, tree.parentFieldKey)) : undefined
    const nextParentId = normalizeNodeId(getTreeNodeParentId(nextNode, tree.parentFieldKey))
    const previousIndex = previousParentId ? tree.childIdsByParent[previousParentId]?.indexOf(previousId) ?? -1 : -1
    const wasFilterResult = tree.filterResultNodeIds.includes(previousId) || tree.filterResultNodeIds.includes(nextId)
    const filterHasUnloadedItems = hasUnloadedItems(tree, tree.filterPagination, limit)

    if (!wasUnallocated && previousParentId && previousIndex >= 0) {
        const previousParentState = tree.nodesState[previousParentId]
        if (previousParentState) {
            invalidatePaginationTail(tree, previousParentState, limit)
        }
    }

    if (tree.filterActive && wasFilterResult) {
        invalidatePaginationTail(tree, tree.filterPagination, limit)
    }

    removeSubtree(tree, previousNodeId, false)
    detachNodeId(tree, previousId)
    if (nextId !== previousId) {
        detachNodeId(tree, nextId)
        delete tree.nodes[previousId]

        replaceNodeIdInCollections(tree, previousId, nextId)
    }

    tree.nodes[nextId] = nextNode
    const nextSiblings = tree.childIdsByParent[nextParentId] ?? []
    const insertionIndex = insertPosition === 'end' ? nextSiblings.length : 0
    nextSiblings.splice(insertionIndex, 0, nextId)
    tree.childIdsByParent[nextParentId] = getUniqueValues(nextSiblings)

    if (wasUnallocated) {
        adjustKnownChildCount(tree, nextParentId, 1)
    } else if (previousParentId && previousParentId !== nextParentId) {
        adjustKnownChildCount(tree, previousParentId, -1)
        adjustKnownChildCount(tree, nextParentId, 1)
    }

    if (tree.filterActive) {
        const parentState = tree.nodesState[nextParentId]
        const firstPageVisible =
            nextParentId === TREE_ROOT_ID
                ? (tree.filterPagination.page ?? 0) > 0
                : (parentState?.page ?? 0) > 0 &&
                  tree.expandedParents.includes(nextParentId) &&
                  (tree.searchMode !== 'collapse' || (parentState?.filterPage ?? 0) > 0)
        const showImmediately = matchesFilters && (!filterHasUnloadedItems || (insertPosition === 'start' && firstPageVisible))

        removeNodeIdsFromFilterCollections(tree, [previousId, nextId])

        if (showImmediately) {
            const targetCollections = [tree.matchedNodeIds, tree.filterResultNodeIds, tree.visibleNodeIdsForHidden]
            targetCollections.forEach(ids => (insertPosition === 'start' ? ids.unshift(nextId) : ids.push(nextId)))
        }

        if (previousMatchesFilters !== matchesFilters) {
            adjustKnownCount(tree.filterPagination, matchesFilters ? 1 : -1)
        }
    }
}

const removeTreeNode = (tree: BcTreeState, nodeId: string, limit?: number) => {
    const node = tree.nodes[nodeId]
    if (!node) {
        return
    }

    const parentId = normalizeNodeId(getTreeNodeParentId(node, tree.parentFieldKey))
    const parentNodeState = tree.nodesState[parentId]
    const filterResultIds = new Set(tree.filterResultNodeIds)
    const idsToRemove = removeSubtree(tree, nodeId, true)
    const removedFilterResultCount = [...idsToRemove].filter(id => filterResultIds.has(id)).length

    adjustKnownChildCount(tree, parentId, -1)
    if (parentNodeState) {
        invalidatePaginationTail(tree, parentNodeState, limit)
    }
    if (tree.filterActive && removedFilterResultCount > 0) {
        adjustKnownCount(tree.filterPagination, -removedFilterResultCount)
        invalidatePaginationTail(tree, tree.filterPagination, limit)
    }
}

const treeSlice = createSlice({
    name: 'tree',
    initialState,
    reducers: {
        initTree(
            state,
            action: PayloadAction<{
                bcName: string
                nodeState?: BcTreeState['nodesState'][string]
                reset?: boolean
                searchMode?: TreeSearchModes
                paginationType?: PaginationMode
                parentFieldKey?: string
                isLeafFieldKey?: string
                expandedStateAfterFilter?: TreeExpandedStateAfterFilter
            }>
        ) {
            const { bcName, nodeState, reset, searchMode, paginationType, parentFieldKey, isLeafFieldKey, expandedStateAfterFilter } =
                action.payload
            if (!state[bcName] || reset) {
                state[bcName] = initBcTreeState({
                    ...(nodeState ? { nodesState: { null: nodeState } } : undefined),
                    searchMode: searchMode ?? state[bcName]?.searchMode ?? DEFAULT_SEARCH_MODE,
                    paginationType: paginationType ?? state[bcName]?.paginationType ?? MAIN_DEFAULT_PAGINATION_TYPE,
                    parentFieldKey: parentFieldKey ?? state[bcName]?.parentFieldKey ?? DEFAULT_TREE_PARENT_FIELD_KEY,
                    isLeafFieldKey: isLeafFieldKey ?? state[bcName]?.isLeafFieldKey ?? DEFAULT_TREE_IS_LEAF_FIELD_KEY,
                    expandedStateAfterFilter:
                        expandedStateAfterFilter ?? state[bcName]?.expandedStateAfterFilter ?? DEFAULT_EXPANDED_STATE_AFTER_FILTER
                })
            }
        },
        fetchChildNodeData(
            state,
            action: PayloadAction<{
                bcName: string
                parentId?: string | null
                page?: number
                more?: boolean
                fetchUntilDataChanges?: boolean
                maxRequests?: number
                limit?: number
                bcDataRequestAction?: AnyAction
            }>
        ) {
            const { bcName, page: newPage, more, parentId } = action.payload

            if (!state[bcName]) {
                state[bcName] = initBcTreeState()
            }

            const currentTree = state[bcName]!

            if (parentId === undefined) {
                if (!more) {
                    if (!currentTree.filterActive && !currentTree.expandedParentsBeforeFilter) {
                        currentTree.expandedParentsBeforeFilter = [...currentTree.expandedParents]
                    }
                    currentTree.expandedParents = currentTree.expandedParents.filter(id => id !== TREE_ROOT_ID)
                }
                currentTree.filterPagination.loading = true
                if (!currentTree.nodesState['null']) {
                    currentTree.nodesState['null'] = {
                        page: 0,
                        hasNext: true
                    }
                }
            } else {
                const safeParentId = String(parentId)
                const nodesState = currentTree.nodesState

                if (!nodesState[safeParentId]) {
                    nodesState[safeParentId] = {}
                }

                nodesState[safeParentId].loading = true

                if (isDefined(newPage)) {
                    nodesState[safeParentId].page = newPage
                }

                const currentPage = nodesState[safeParentId].page

                if (more) {
                    nodesState[safeParentId].page = isDefined(currentPage) ? currentPage + 1 : DEFAULT_PAGE
                }
            }
        },
        fetchChildNodeDataSuccess(
            state,
            action: PayloadAction<{
                bcName: string
                parentId: string | null | undefined
                data: DataItem[]
                hasNext?: boolean
                page?: number
                lastResponseCount?: number
            }>
        ) {
            const { bcName, data, hasNext, page, lastResponseCount, parentId: requestedParentId } = action.payload

            if (!state[bcName]) {
                state[bcName] = initBcTreeState()
            }

            const currentTree = state[bcName]!
            const nodesState = currentTree.nodesState

            const mutateBcTreeByParentId = (
                nodeId: string | null,
                options: { data: DataItem[]; loading: boolean; hasNext?: boolean; lastResponseCount?: number }
            ) => {
                const safeNodeId = String(nodeId)

                if (!nodesState[safeNodeId]) {
                    nodesState[safeNodeId] = {}
                }

                if (!currentTree.childIdsByParent[safeNodeId]) {
                    currentTree.childIdsByParent[safeNodeId] = []
                }

                const nodeState = nodesState[safeNodeId]

                nodeState.loading = options.loading

                if (options.hasNext !== undefined) {
                    nodeState.hasNext = options.hasNext
                }

                if (options.lastResponseCount !== undefined) {
                    nodeState.lastResponseCount = options.lastResponseCount
                }

                const existingChildIds = currentTree.childIdsByParent[safeNodeId]
                const newChildIds = extractNodeIds(options.data)

                currentTree.childIdsByParent[safeNodeId] = getUniqueValues([...existingChildIds, ...newChildIds])
            }

            if (requestedParentId !== undefined) {
                currentTree.errors[String(requestedParentId)] = null
                mutateBcTreeByParentId(requestedParentId, {
                    data: [],
                    loading: false,
                    hasNext,
                    lastResponseCount: lastResponseCount ?? data.length
                })
                if (isDefined(page)) {
                    nodesState[String(requestedParentId)].page = page
                }
            }

            const recordsByParentId = dataByCategory(currentTree.parentFieldKey, data)

            Object.entries(recordsByParentId).forEach(([actualParentId, groupData]) => {
                mutateBcTreeByParentId(actualParentId, {
                    data: groupData,
                    loading: false
                })
            })

            const newNodes = createDictionaryFrom(FIELDS.TECHNICAL.ID, data)
            Object.assign(currentTree.nodes, newNodes)

            if (currentTree.filterActive && currentTree.searchMode === 'collapse') {
                currentTree.visibleNodeIdsForHidden = getUniqueValues([...currentTree.visibleNodeIdsForHidden, ...extractNodeIds(data)])
                if (requestedParentId !== undefined) {
                    const nodeState = nodesState[String(requestedParentId)]
                    nodeState.filterPage = nodeState.page ?? 0
                }
            }

            if (currentTree.filterActive) {
                const hasVisibleRootNode =
                    currentTree.visibleNodeIdsForHidden.some(id => {
                        const node = currentTree.nodes[id]
                        return node && !isDefined(node[currentTree.parentFieldKey])
                    }) || data.some(node => !isDefined(node[currentTree.parentFieldKey]))

                if (hasVisibleRootNode) {
                    currentTree.expandedParents = getUniqueValues([...currentTree.expandedParents, TREE_ROOT_ID])
                }
            }
        },
        fetchChildNodeDataFail(state, action: PayloadAction<{ bcName: string; parentId?: string | null; error?: string }>) {
            const { bcName, parentId, error } = action.payload
            const currentTree = state[bcName]

            if (parentId === undefined) {
                if (currentTree) {
                    currentTree.filterPagination.loading = false
                }
                return
            }

            const safeParentId = String(parentId)
            const nodesState = currentTree?.nodesState

            if (nodesState?.[safeParentId]) {
                nodesState[safeParentId].loading = false
            }
            if (currentTree) {
                currentTree.errors[safeParentId] = error ?? null
            }
        },
        setTreeChildCount(state, action: PayloadAction<{ bcName: string; parentId: string | null; count: number }>) {
            const { bcName, parentId, count } = action.payload

            if (!state[bcName]) {
                state[bcName] = initBcTreeState()
            }

            const currentTree = state[bcName]!
            const nodesState = currentTree.nodesState
            const safeParentId = String(parentId)

            if (!nodesState[safeParentId]) {
                nodesState[safeParentId] = {}
            }

            nodesState[safeParentId].count = count
        },
        removeNode(state, action: PayloadAction<{ bcName: string; nodeId: string; limit?: number }>) {
            const currentTree = state[action.payload.bcName]
            if (currentTree) {
                removeTreeNode(currentTree, String(action.payload.nodeId), action.payload.limit)
            }
        },
        reconcileNode(
            state,
            action: PayloadAction<{
                bcName: string
                previousId: string
                dataItem: DataItem
                limit?: number
                previousMatchesFilters?: boolean
                matchesFilters?: boolean
                insertPosition?: 'start' | 'end'
            }>
        ) {
            const { bcName, previousId, dataItem, limit, previousMatchesFilters, matchesFilters, insertPosition } = action.payload
            const currentTree = state[bcName]
            if (currentTree) {
                upsertTreeNode(currentTree, previousId, dataItem, limit, previousMatchesFilters, matchesFilters, insertPosition)
            }
        },
        removeDraftNodes(state, action: PayloadAction<{ bcName: string }>) {
            const currentTree = state[action.payload.bcName]
            if (currentTree) {
                removeDraftNodes(currentTree)
            }
        },
        applyFilter(
            state,
            action: PayloadAction<{
                bcName: string
                more?: boolean
                fetchUntilDataChanges?: boolean
                maxRequests?: number
                knownNodeIds?: string[]
            }>
        ) {
            const { bcName, more } = action.payload

            if (!state[bcName]) {
                state[bcName] = initBcTreeState()
            }

            const currentTree = state[bcName]!
            if (!more) {
                if (!currentTree.filterActive && !currentTree.expandedParentsBeforeFilter) {
                    currentTree.expandedParentsBeforeFilter = [...currentTree.expandedParents]
                }
                currentTree.expandedParents = currentTree.expandedParents.filter(id => id !== TREE_ROOT_ID)
                currentTree.visibleNodeIdsForHidden = []
                Object.values(currentTree.nodesState).forEach(nodeState => {
                    if (currentTree.searchMode === 'collapse') {
                        nodeState.filterPage = 0
                    } else {
                        delete nodeState.filterPage
                    }
                })
            }
            currentTree.filterPagination = more
                ? {
                      ...currentTree.filterPagination,
                      loading: true,
                      page: (currentTree.filterPagination.page ?? DEFAULT_PAGE) + 1
                  }
                : { loading: true, page: DEFAULT_PAGE }
        },
        applyFilterSuccess(
            state,
            action: PayloadAction<{
                bcName: string
                data: DataItem[]
                matchedNodeIds: string[]
                filterResultNodeIds: string[]
                restoredNodeIds: string[]
                hasNext?: boolean
                more?: boolean
                page?: number
                lastResponseCount?: number
            }>
        ) {
            const { bcName, data, matchedNodeIds, filterResultNodeIds, restoredNodeIds, hasNext, more, page, lastResponseCount } =
                action.payload
            const currentTree = state[bcName] ?? initBcTreeState()
            state[bcName] = currentTree

            if (!currentTree.filterActive && !currentTree.expandedParentsBeforeFilter) {
                currentTree.expandedParentsBeforeFilter = [...currentTree.expandedParents]
            }

            currentTree.filterActive = true
            currentTree.filterPagination.loading = false
            currentTree.filterPagination.hasNext = hasNext
            currentTree.filterPagination.lastResponseCount = lastResponseCount ?? filterResultNodeIds.length
            if (isDefined(page)) {
                currentTree.filterPagination.page = page
            }
            currentTree.matchedNodeIds = getUniqueValues([...(more ? currentTree.matchedNodeIds : []), ...matchedNodeIds.map(String)])
            currentTree.filterResultNodeIds = getUniqueValues([
                ...(more ? currentTree.filterResultNodeIds : []),
                ...filterResultNodeIds.map(String)
            ])
            currentTree.visibleNodeIdsForHidden = getUniqueValues([
                ...(more ? currentTree.visibleNodeIdsForHidden : []),
                ...filterResultNodeIds.map(String),
                ...restoredNodeIds.map(String)
            ])

            const recordsByParentId = dataByCategory(currentTree.parentFieldKey, data)
            Object.entries(recordsByParentId).forEach(([parentId, children]) => {
                currentTree.childIdsByParent[parentId] = getUniqueValues([
                    ...(currentTree.childIdsByParent[parentId] ?? []),
                    ...extractNodeIds(children)
                ])
            })
            Object.assign(currentTree.nodes, createDictionaryFrom(FIELDS.TECHNICAL.ID, data))

            const hidePreviouslyLoadedNodes = currentTree.searchMode === 'hide' || currentTree.searchMode === 'collapse'
            const expandedPathIds = hidePreviouslyLoadedNodes
                ? getExpandedVisibleParentIds(currentTree)
                : getExpandedPathIds(currentTree, currentTree.matchedNodeIds)

            const restoredParentIds = data
                .map(item => item[currentTree.parentFieldKey])
                .filter((parentId): parentId is string => isDefined(parentId))
                .map(String)

            currentTree.expandedParents = hidePreviouslyLoadedNodes
                ? getUniqueValues([...(more ? currentTree.expandedParents : []), ...expandedPathIds, ...restoredParentIds])
                : getUniqueValues([...currentTree.expandedParents, ...expandedPathIds, ...restoredParentIds])

            const hasVisibleRootNode =
                currentTree.visibleNodeIdsForHidden.some(id => {
                    const node = currentTree.nodes[id]
                    return node && !isDefined(node[currentTree.parentFieldKey])
                }) || data.some(node => !isDefined(node[currentTree.parentFieldKey]))

            if (hasVisibleRootNode) {
                currentTree.expandedParents = getUniqueValues([...currentTree.expandedParents, TREE_ROOT_ID])
            }

            if (currentTree.searchMode === 'collapse') {
                const visibleParentIds = new Set<string>([TREE_ROOT_ID, ...expandedPathIds, ...restoredParentIds])

                filterResultNodeIds.forEach(id => {
                    if (!getTreeNodeIsLeaf(currentTree.nodes[id], currentTree.isLeafFieldKey)) {
                        visibleParentIds.add(id)
                    }
                })

                visibleParentIds.forEach(parentId => {
                    // Page zero means that this branch has not been requested in the current mode yet.
                    // It also keeps the show-more control visible until the first response provides hasNext.
                    initializeUnloadedBranchState(currentTree, parentId)
                })
            }
        },
        showCachedFilterPage(state, action: PayloadAction<{ bcName: string; parentId: string; limit: number; pageCount?: number }>) {
            const { bcName, parentId, limit, pageCount = 1 } = action.payload
            const currentTree = state[bcName]
            const nodeState = currentTree?.nodesState[parentId]

            if (!currentTree?.filterActive || currentTree.searchMode !== 'collapse' || !nodeState) {
                return
            }

            const loadedPage = nodeState.page ?? 0
            const filterPage = nodeState.filterPage ?? 0
            if (filterPage >= loadedPage) {
                return
            }

            const loadedCount = (loadedPage - 1) * limit + (nodeState.lastResponseCount ?? limit)
            const nextFilterPage = Math.min(filterPage + Math.max(1, pageCount), loadedPage)
            const cachedIds = (currentTree.childIdsByParent[parentId] ?? []).slice(
                filterPage * limit,
                Math.min(nextFilterPage * limit, loadedCount)
            )

            currentTree.visibleNodeIdsForHidden = getUniqueValues([...currentTree.visibleNodeIdsForHidden, ...cachedIds])
            nodeState.filterPage = nextFilterPage
        },
        applyFilterFail(state, action: PayloadAction<{ bcName: string; more?: boolean }>) {
            const currentTree = state[action.payload.bcName]
            if (currentTree) {
                currentTree.filterPagination.loading = false
                if (!currentTree.filterActive) {
                    Object.values(currentTree.nodesState).forEach(nodeState => delete nodeState.filterPage)
                }
                if (action.payload.more && currentTree.filterPagination.page) {
                    currentTree.filterPagination.page -= 1
                }
            }
        },
        setFilterCount(state, action: PayloadAction<{ bcName: string; count: number }>) {
            const currentTree = state[action.payload.bcName]
            if (currentTree) {
                currentTree.filterPagination.count = action.payload.count
            }
        },
        clearFilter(state, action: PayloadAction<{ bcName: string }>) {
            const currentTree = state[action.payload.bcName]
            if (!currentTree) {
                return
            }
            const connectedNodeIds = new Set([
                ...collectRootConnectedNodeIds(currentTree.nodes, currentTree.parentFieldKey),
                ...currentTree.unallocatedNodeIds
            ])
            Object.keys(currentTree.nodes).forEach(nodeId => {
                if (!connectedNodeIds.has(nodeId)) {
                    delete currentTree.nodes[nodeId]
                    delete currentTree.nodesState[nodeId]
                    delete currentTree.errors[nodeId]
                    delete currentTree.childIdsByParent[nodeId]
                }
            })
            Object.keys(currentTree.childIdsByParent).forEach(parentId => {
                currentTree.childIdsByParent[parentId] = currentTree.childIdsByParent[parentId].filter(id => connectedNodeIds.has(id))
            })
            currentTree.filterActive = false
            currentTree.matchedNodeIds = []
            currentTree.filterResultNodeIds = []
            currentTree.visibleNodeIdsForHidden = []
            currentTree.filterPagination = {}
            Object.values(currentTree.nodesState).forEach(nodeState => delete nodeState.filterPage)
            if (currentTree.expandedParentsBeforeFilter) {
                currentTree.expandedParents =
                    currentTree.expandedStateAfterFilter === 'merge'
                        ? getUniqueValues([...currentTree.expandedParentsBeforeFilter, ...currentTree.expandedParents])
                        : currentTree.expandedParentsBeforeFilter
            }
            currentTree.expandedParents = getUniqueValues([
                ...currentTree.expandedParents.filter(id => connectedNodeIds.has(id)),
                TREE_ROOT_ID
            ])
            delete currentTree.expandedParentsBeforeFilter
        },
        applySorter(state, action: PayloadAction<{ bcName: string }>) {
            return
        },
        expandNode(state, action: PayloadAction<{ bcName: string; nodeId: string; value: boolean }>) {
            const { bcName, nodeId, value } = action.payload
            const currentTree = state[bcName]!

            currentTree.expandedParents = value
                ? [...new Set([...currentTree.expandedParents, nodeId])]
                : currentTree.expandedParents.filter(item => item !== nodeId)
        },
        restoreNodePaths(state, action: PayloadAction<{ bcName: string; ids: string[] }>) {
            return
        },
        restoreNodePathsSuccess(state, action: PayloadAction<{ bcName: string; data: DataItem[]; restoredNodeIds: string[] }>) {
            const { bcName, data, restoredNodeIds } = action.payload

            if (!state[bcName]) {
                state[bcName] = initBcTreeState()
            }

            const currentTree = state[bcName]!
            const recordsByParentId = dataByCategory(currentTree.parentFieldKey, data)

            Object.entries(recordsByParentId).forEach(([parentId, children]) => {
                if (!currentTree.nodesState[parentId]) {
                    currentTree.nodesState[parentId] = {}
                }
                if (!currentTree.childIdsByParent[parentId]) {
                    currentTree.childIdsByParent[parentId] = []
                }

                const nodeState = currentTree.nodesState[parentId]
                nodeState.loading = false
                initializeUnloadedBranchState(currentTree, parentId)

                const childIds = extractNodeIds(children)
                currentTree.childIdsByParent[parentId] = getUniqueValues([...currentTree.childIdsByParent[parentId], ...childIds])
            })

            Object.assign(currentTree.nodes, createDictionaryFrom(FIELDS.TECHNICAL.ID, data))

            data.forEach(node => {
                if (!getTreeNodeIsLeaf(node, currentTree.isLeafFieldKey)) {
                    initializeUnloadedBranchState(currentTree, String(node[FIELDS.TECHNICAL.ID]))
                }
            })

            const hiddenFilterActive =
                currentTree.filterActive && (currentTree.searchMode === 'hide' || currentTree.searchMode === 'collapse')

            if (hiddenFilterActive) {
                currentTree.visibleNodeIdsForHidden = getUniqueValues([
                    ...currentTree.visibleNodeIdsForHidden,
                    ...restoredNodeIds.map(String)
                ])
                currentTree.expandedParents = getUniqueValues([...currentTree.expandedParents, ...getExpandedVisibleParentIds(currentTree)])
            }

            const restoredParentIds = data
                .map(item => item[currentTree.parentFieldKey])
                .filter((parentId): parentId is string => isDefined(parentId))
                .map(String)

            currentTree.expandedParents = getUniqueValues([...currentTree.expandedParents, ...restoredParentIds])

            const hasVisibleRootNode =
                currentTree.visibleNodeIdsForHidden.some(id => {
                    const node = currentTree.nodes[id]
                    return node && !isDefined(node[currentTree.parentFieldKey])
                }) || data.some(node => !isDefined(node[currentTree.parentFieldKey]))

            if (hasVisibleRootNode) {
                currentTree.expandedParents = getUniqueValues([...currentTree.expandedParents, TREE_ROOT_ID])
            }
        },
        changeSearchMode(state, action: PayloadAction<{ bcName: string; searchMode: TreeSearchModes }>) {
            const { bcName, searchMode } = action.payload

            if (!state[bcName]) {
                state[bcName] = initBcTreeState()
            }

            state[bcName]!.searchMode = searchMode
            Object.values(state[bcName]!.nodesState).forEach(nodeState => delete nodeState.filterPage)
        },
        changePaginationType(state, action: PayloadAction<{ bcName: string; paginationType: PaginationMode }>) {
            const currentTree = state[action.payload.bcName]
            if (currentTree) {
                currentTree.paginationType = action.payload.paginationType
            }
        }
    },
    extraReducers: builder => {
        builder.addCase(actions.selectScreen, (state, action) => {
            return {}
        })
        builder.addCase(actions.selectView, (state, action) => {
            if (!action.payload.isTab) {
                return {}
            }
        })
        builder.addCase(actions.bcNewDataSuccess, (state, action) => {
            const currentTree = state[action.payload.bcName]
            const nodeId = action.payload.dataItem[FIELDS.TECHNICAL.ID]

            if (!currentTree || !isDefined(nodeId)) {
                return
            }

            const normalizedNodeId = String(nodeId)
            removeDraftNodes(currentTree)
            removeNodeIdFromCollections(currentTree, normalizedNodeId)
            currentTree.nodes[normalizedNodeId] = { ...action.payload.dataItem, id: normalizedNodeId } as TreeNode
            currentTree.unallocatedNodeIds = [normalizedNodeId, ...currentTree.unallocatedNodeIds]
        })
    }
})

export const treeActions = treeSlice.actions
export const treeReducer = treeSlice.reducer
