import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BcMetaState, DataItem } from '@cxbox-ui/core'
import { actions } from '@actions'
import { FIELDS } from '@constants'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { isDefined } from '@utils/isDefined'
import { DEFAULT_PAGE } from '@constants/pagination'
import { AnyAction } from 'redux'
import { TreeExpandedStateAfterFilter, TreeSearchModes } from '@interfaces/widget'
import { DEFAULT_EXPANDED_STATE_AFTER_FILTER, DEFAULT_SEARCH_MODE } from '@constants/tree'
import { DEFAULT_TREE_IS_LEAF_FIELD_KEY, DEFAULT_TREE_PARENT_FIELD_KEY, getTreeNodeIsLeaf } from '@utils/tree'

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
    searchMode: TreeSearchModes
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

export const extractIds = <T extends { id: string }>(data: T[] = []): string[] => {
    return data.map(item => item[FIELDS.TECHNICAL.ID] as string)
}

const initBcTreeState = (initialTreeState?: Partial<BcTreeState>): BcTreeState => ({
    nodes: {},
    childIdsByParent: {},
    nodesState: {},
    errors: {},
    expandedParents: [],
    searchMode: DEFAULT_SEARCH_MODE,
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
                parentFieldKey?: string
                isLeafFieldKey?: string
                expandedStateAfterFilter?: TreeExpandedStateAfterFilter
            }>
        ) {
            const { bcName, nodeState, reset, searchMode, parentFieldKey, isLeafFieldKey, expandedStateAfterFilter } = action.payload
            if (!state[bcName] || reset) {
                state[bcName] = initBcTreeState({
                    ...(nodeState ? { nodesState: { null: nodeState } } : undefined),
                    searchMode: searchMode ?? state[bcName]?.searchMode ?? DEFAULT_SEARCH_MODE,
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
                parentId: string | null
                page?: number
                more?: boolean
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
            }>
        ) {
            const { bcName, data, hasNext, parentId: requestedParentId } = action.payload

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
                    lastResponseCount: data.length
                })
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
        applyFilter(state, action: PayloadAction<{ bcName: string; more?: boolean }>) {
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
            }>
        ) {
            const { bcName, data, matchedNodeIds, filterResultNodeIds, restoredNodeIds, hasNext, more } = action.payload
            const currentTree = state[bcName] ?? initBcTreeState()
            state[bcName] = currentTree

            if (!currentTree.filterActive) {
                currentTree.expandedParentsBeforeFilter = [...currentTree.expandedParents]
            }

            currentTree.filterActive = true
            currentTree.filterPagination.loading = false
            currentTree.filterPagination.hasNext = hasNext
            currentTree.filterPagination.lastResponseCount = filterResultNodeIds.length
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

            if (currentTree.searchMode === 'collapse' || currentTree.searchMode === 'highlight') {
                const visibleParentIds = new Set<string>([String(null), ...expandedPathIds])

                const filterNodeIds = currentTree.searchMode === 'collapse' ? filterResultNodeIds : currentTree.matchedNodeIds
                filterNodeIds.forEach(id => {
                    if (!getTreeNodeIsLeaf(currentTree.nodes[id], currentTree.isLeafFieldKey)) {
                        visibleParentIds.add(id)
                    }
                })

                visibleParentIds.forEach(parentId => {
                    if (!currentTree.nodesState[parentId]) {
                        // Page zero means that this branch has not been requested in the current mode yet.
                        // It also keeps the show-more control visible until the first response provides hasNext.
                        currentTree.nodesState[parentId] = {
                            page: 0,
                            hasNext: true,
                            ...(currentTree.searchMode === 'collapse' ? { filterPage: 0 } : undefined)
                        }
                    }
                })
            }
        },
        showCachedFilterPage(state, action: PayloadAction<{ bcName: string; parentId: string; limit: number }>) {
            const { bcName, parentId, limit } = action.payload
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
            const cachedIds = (currentTree.childIdsByParent[parentId] ?? []).slice(
                filterPage * limit,
                Math.min((filterPage + 1) * limit, loadedCount)
            )

            currentTree.visibleNodeIdsForHidden = getUniqueValues([...currentTree.visibleNodeIdsForHidden, ...cachedIds])
            nodeState.filterPage = filterPage + 1
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

                const childIds = extractIds(children)
                currentTree.childIdsByParent[parentId] = getUniqueValues([...currentTree.childIdsByParent[parentId], ...childIds])
            })

            Object.assign(currentTree.nodes, createDictionaryFrom(FIELDS.TECHNICAL.ID, data))

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
        }
    },
    extraReducers: builder => {
        builder.addCase(actions.selectScreen, (state, action) => {
            return {}
        })
        builder.addCase(actions.selectView, (state, action) => {
            return {}
        })
    }
})

export const treeActions = treeSlice.actions
export const treeReducer = treeSlice.reducer
