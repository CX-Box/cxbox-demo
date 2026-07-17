import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BcFilter, BcMetaState, DataItem, utils } from '@cxbox-ui/core'
import { actions } from '@actions'
import { FIELDS } from '@constants'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { isDefined } from '@utils/isDefined'
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT, MAIN_DEFAULT_PAGINATION_TYPE, PaginationMode } from '@constants/pagination'
import { AnyAction } from 'redux'
import { TreeExpandedStateAfterFilter, TreeSearchModes } from '@interfaces/widget'
import { DEFAULT_EXPANDED_STATE_AFTER_FILTER, DEFAULT_SEARCH_MODE } from '@constants/tree'
import { DEFAULT_TREE_IS_LEAF_FIELD_KEY, DEFAULT_TREE_PARENT_FIELD_KEY, getTreeNodeIsLeaf } from '@utils/tree'
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
    defaultFilter?: string
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

export const extractIds = <T extends { id: string }>(data: T[] = []): string[] => {
    return data.map(item => item[FIELDS.TECHNICAL.ID] as string)
}

const initBcTreeState = (initialTreeState?: Partial<BcTreeState>): BcTreeState => ({
    nodes: {},
    childIdsByParent: {},
    nodesState: {},
    errors: {},
    expandedParents: [],
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

const getExpandedPathIds = (tree: BcTreeState, nodeIds: string[]) => {
    const expandedPathIds = new Set<string>()

    nodeIds.forEach(id => {
        let node = tree.nodes[id]
        const visited = new Set<string>()

        while (isDefined(node?.[tree.parentFieldKey])) {
            const parentId = String(node[tree.parentFieldKey])
            if (visited.has(parentId)) {
                break
            }
            visited.add(parentId)
            expandedPathIds.add(parentId)
            node = tree.nodes[parentId]
        }
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

const getRootConnectedNodeIds = (tree: BcTreeState) => {
    const connectedNodeIds = new Set<string>()

    Object.keys(tree.nodes).forEach(nodeId => {
        let currentId: string | undefined = nodeId
        const path: string[] = []
        const visited = new Set<string>()

        while (currentId && tree.nodes[currentId] && !visited.has(currentId)) {
            if (connectedNodeIds.has(currentId)) {
                path.forEach(id => connectedNodeIds.add(id))
                return
            }

            visited.add(currentId)
            path.push(currentId)
            const parentId: unknown = tree.nodes[currentId][tree.parentFieldKey]

            if (!isDefined(parentId)) {
                path.forEach(id => connectedNodeIds.add(id))
                return
            }

            currentId = String(parentId)
        }
    })

    return connectedNodeIds
}

const normalizeId = (id: unknown) => (isDefined(id) ? String(id) : String(null))

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

const detachNodeId = (tree: BcTreeState, nodeId: string) => {
    Object.keys(tree.childIdsByParent).forEach(parentId => {
        tree.childIdsByParent[parentId] = tree.childIdsByParent[parentId].filter(id => id !== nodeId)
    })
    tree.unallocatedNodeIds = tree.unallocatedNodeIds.filter(id => id !== nodeId)
}

const removeNodeIdFromCollections = (tree: BcTreeState, nodeId: string) => {
    detachNodeId(tree, nodeId)
    tree.expandedParents = tree.expandedParents.filter(id => id !== nodeId)
    tree.matchedNodeIds = tree.matchedNodeIds.filter(id => id !== nodeId)
    tree.filterResultNodeIds = tree.filterResultNodeIds.filter(id => id !== nodeId)
    tree.visibleNodeIdsForHidden = tree.visibleNodeIdsForHidden.filter(id => id !== nodeId)
}

const removeNodeData = (tree: BcTreeState, nodeId: string) => {
    removeNodeIdFromCollections(tree, nodeId)
    delete tree.nodes[nodeId]
    delete tree.nodesState[nodeId]
    delete tree.errors[nodeId]
    delete tree.childIdsByParent[nodeId]
}

const removeSubtree = (tree: BcTreeState, nodeId: string, includeRoot: boolean) => {
    const idsToRemove = new Set<string>()
    const pendingIds = includeRoot ? [nodeId] : [...(tree.childIdsByParent[nodeId] ?? [])]

    while (pendingIds.length) {
        const currentId = pendingIds.pop()!
        if (idsToRemove.has(currentId)) {
            continue
        }

        idsToRemove.add(currentId)
        pendingIds.push(...(tree.childIdsByParent[currentId] ?? []))
    }

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
    const previousParentId = previousNode ? normalizeId(previousNode[tree.parentFieldKey]) : undefined
    const nextParentId = normalizeId(nextNode[tree.parentFieldKey])
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

        tree.matchedNodeIds = replaceId(tree.matchedNodeIds, previousId, nextId)
        tree.filterResultNodeIds = replaceId(tree.filterResultNodeIds, previousId, nextId)
        tree.visibleNodeIdsForHidden = replaceId(tree.visibleNodeIdsForHidden, previousId, nextId)
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
            nextParentId === String(null)
                ? (tree.filterPagination.page ?? 0) > 0
                : (parentState?.page ?? 0) > 0 &&
                  tree.expandedParents.includes(nextParentId) &&
                  (tree.searchMode !== 'collapse' || (parentState?.filterPage ?? 0) > 0)
        const showImmediately = matchesFilters && (!filterHasUnloadedItems || (insertPosition === 'start' && firstPageVisible))

        tree.matchedNodeIds = tree.matchedNodeIds.filter(id => id !== previousId && id !== nextId)
        tree.filterResultNodeIds = tree.filterResultNodeIds.filter(id => id !== previousId && id !== nextId)
        tree.visibleNodeIdsForHidden = tree.visibleNodeIdsForHidden.filter(id => id !== previousId && id !== nextId)

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

    const parentId = normalizeId(node[tree.parentFieldKey])
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
        setTreeDefaultFilter(state, action: PayloadAction<{ bcName: string; filters: BcFilter[] }>) {
            const { bcName, filters } = action.payload
            const currentTree = state[bcName] ?? (state[bcName] = initBcTreeState())

            currentTree.defaultFilter = new URLSearchParams(utils.getFilters(filters)).toString()
        },
        fetchChildNodeData(
            state,
            action: PayloadAction<{
                bcName: string
                parentId: string | null
                page?: number
                more?: boolean
                fetchUntilDataChanges?: boolean
                maxRequests?: number
                limit?: number
                bcDataRequestAction?: AnyAction
            }>
        ) {
            const { bcName, page: newPage, more } = action.payload
            const parentId = action.payload.parentId as string

            if (!state[bcName]) {
                state[bcName] = initBcTreeState()
            }

            const currentTree = state[bcName]!

            const nodesState = currentTree.nodesState

            if (!nodesState[parentId]) {
                nodesState[parentId] = {}
            }

            nodesState[parentId].loading = true

            if (isDefined(newPage)) {
                nodesState[parentId].page = newPage
            }

            const currentPage = nodesState[parentId].page

            if (more) {
                nodesState[parentId].page = isDefined(currentPage) ? currentPage + 1 : DEFAULT_PAGE
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
                const newChildIds = extractIds(options.data)

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
                currentTree.visibleNodeIdsForHidden = getUniqueValues([...currentTree.visibleNodeIdsForHidden, ...extractIds(data)])
                if (requestedParentId !== undefined) {
                    const nodeState = nodesState[String(requestedParentId)]
                    nodeState.filterPage = nodeState.page ?? 0
                }
            }
        },
        fetchChildNodeDataFail(state, action: PayloadAction<{ bcName: string; parentId: string | null; error?: string }>) {
            const { bcName, parentId, error } = action.payload
            const currentTree = state[bcName]
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

            if (!currentTree.filterActive) {
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
                    ...extractIds(children)
                ])
            })
            Object.assign(currentTree.nodes, createDictionaryFrom(FIELDS.TECHNICAL.ID, data))

            const hidePreviouslyLoadedNodes = currentTree.searchMode === 'hide' || currentTree.searchMode === 'collapse'
            const expandedPathIds = hidePreviouslyLoadedNodes
                ? getExpandedVisibleParentIds(currentTree)
                : getExpandedPathIds(currentTree, currentTree.matchedNodeIds)

            currentTree.expandedParents = hidePreviouslyLoadedNodes
                ? getUniqueValues([...(more ? currentTree.expandedParents : []), ...expandedPathIds])
                : getUniqueValues([...currentTree.expandedParents, ...expandedPathIds])

            if (currentTree.searchMode === 'collapse') {
                const visibleParentIds = new Set<string>([String(null), ...expandedPathIds])

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
            const connectedNodeIds = new Set([...getRootConnectedNodeIds(currentTree), ...currentTree.unallocatedNodeIds])
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
            currentTree.expandedParents = currentTree.expandedParents.filter(id => connectedNodeIds.has(id))
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

                const childIds = extractIds(children)
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

            if (!hiddenFilterActive) {
                currentTree.expandedParents = getUniqueValues([...currentTree.expandedParents, ...restoredParentIds])
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
