import { RootEpic, RootState } from '@store'
import { catchError, concat, concatWith, EMPTY, expand, filter, from, last, map, mergeMap, Observable, of, race, switchMap } from 'rxjs'
import { DataItem, OperationTypeCrud, utils, WidgetFieldBase } from '@cxbox-ui/core'
import { actions } from '@actions'
import { isAnyOf } from '@reduxjs/toolkit'
import { buildBcUrl } from '@utils/buildBcUrl'
import { selectBcFilters, selectWidgetByCondition } from '@selectors/selectors'
import { getUniqueValues, pick, treeActions } from '@slices/tree'
import { FilterType } from '@interfaces/filters'
import { FIELDS } from '@constants'
import { isDefined } from '@utils/isDefined'
import { buildBcFetchContext, getBcFetchSideEffects } from './data/bcFetchDataEpic'
import { DEFAULT_PAGE, MAIN_DEFAULT_PAGINATION_TYPE, PaginationMode } from '@constants/pagination'
import { isDataItemMatchedByFilters } from '@utils/filterMatch'
import { getTreeFieldKeys } from '@utils/tree'
import { isTreeWidget } from '@constants/widget'
import { AppWidgetMeta } from '@interfaces/widget'
import {
    DEFAULT_ON_FILTER_APPLY_NEST_LEVEL,
    TREE_SHOW_MORE_AUTO_FETCH_ENABLED,
    TREE_SHOW_MORE_AUTO_FETCH_MAX_REQUESTS,
    DEFAULT_PATH_RESTORE_NEST_LEVEL,
    normalizeTreeSearchModes
} from '@constants/tree'
import { getWidgetPaginationType } from '@features/pagination/utils/common'
import { getTreePaginationControlsState } from '@components/widgets/Table/tree/utils/getTreePaginationControlsState'
import { cancelRequestActionTypes, cancelRequestEpic } from '@utils/cancelRequestEpic'

interface PageResponse {
    data: DataItem[]
    hasNext?: boolean
}

interface FetchPagesUntilDataChangesOptions {
    fetchPage: (page: number) => Observable<PageResponse>
    initialPage: number
    knownIds: Set<string>
    paginationType: PaginationMode
    limit: number
    defaultLimit: number
    total?: number
    enabled: boolean
    requestLimit?: number
}

const fetchPagesUntilDataChanges = ({
    fetchPage,
    initialPage,
    knownIds,
    paginationType,
    limit,
    defaultLimit,
    total,
    enabled,
    requestLimit: requestedLimit
}: FetchPagesUntilDataChangesOptions) => {
    const requestLimit = enabled ? Math.max(1, requestedLimit ?? TREE_SHOW_MORE_AUTO_FETCH_MAX_REQUESTS) : 1

    const requestPage = (page: number, accumulatedData: DataItem[] = [], requestCount = 1) =>
        fetchPage(page).pipe(
            map(response => ({
                ...response,
                accumulatedData: [...accumulatedData, ...response.data],
                page,
                requestCount,
                dataChanged: response.data.some(item => !knownIds.has(String(item[FIELDS.TECHNICAL.ID])))
            }))
        )

    return requestPage(initialPage).pipe(
        expand(pageState => {
            const paginationState = getTreePaginationControlsState({
                type: paginationType,
                page: pageState.page,
                limit,
                defaultLimit,
                loadedCount: pageState.data.length,
                hasNext: pageState.hasNext,
                total
            })
            const canFetchNextPage = paginationState.visible && !paginationState.nextDisabled

            if (pageState.dataChanged || !canFetchNextPage || pageState.requestCount >= requestLimit) {
                return EMPTY
            }

            return requestPage(pageState.page + 1, pageState.accumulatedData, pageState.requestCount + 1)
        }),
        last()
    )
}

const getPaginationType = (state: RootState, widget?: AppWidgetMeta) =>
    widget ? state.screen.alternativePagination[widget.name] ?? getWidgetPaginationType(widget) : MAIN_DEFAULT_PAGINATION_TYPE

const getTreeWidget = (state: RootState, bcName: string) =>
    selectWidgetByCondition(state, widget => widget.bcName === bcName && isTreeWidget(widget)) as AppWidgetMeta | undefined

const getDataItemIds = (data: DataItem[]) => data.map(item => String(item[FIELDS.TECHNICAL.ID]))

const getIdsFilterParams = (ids: string[]) =>
    utils.getFilters([{ type: FilterType.equalsOneOf, fieldName: FIELDS.TECHNICAL.ID, value: ids }]) ?? {}

const getTreeUserFilters = (state: RootState, bcName: string, parentFieldKey: string) =>
    (selectBcFilters(state, bcName) ?? []).filter(filter => filter.fieldName !== parentFieldKey)

const getParentId = (node: DataItem | undefined, parentFieldKey: string) => {
    const parentId = node?.[parentFieldKey]

    return isDefined(parentId) ? String(parentId) : undefined
}

export const initTreeEpic: RootEpic = (action$, state$) =>
    action$.pipe(
        filter(actions.selectView.match),
        mergeMap(() => {
            const state = state$.value
            const widgets = state.view.widgets as AppWidgetMeta[] | undefined
            const treeWidgets = widgets?.filter(isTreeWidget)

            if (!treeWidgets || treeWidgets.length === 0) {
                return EMPTY
            }

            const treeBcNames = getUniqueValues(treeWidgets.map(w => w.bcName).filter(Boolean))

            const initActions = treeBcNames.map(bcName => {
                const treeWidget = treeWidgets.find(widget => widget.bcName === bcName)
                const treeFieldKeys = getTreeFieldKeys(treeWidget)

                return treeActions.initTree({
                    bcName,
                    nodeState: pick(state.screen.bo.bc[bcName], ['loading', 'page', 'hasNext']),
                    searchMode: normalizeTreeSearchModes(treeWidget?.options?.tree?.searchModes)[0],
                    paginationType: getPaginationType(state, treeWidget),
                    ...treeFieldKeys
                })
            })

            return from(initActions)
        })
    )

const changeTreePaginationTypeEpic: RootEpic = (action$, state$) =>
    action$.pipe(
        filter(actions.setAlternativePaginationType.match),
        mergeMap(action => {
            const widget = (state$.value.view.widgets as AppWidgetMeta[]).find(item => item.name === action.payload.widgetName)

            return widget && isTreeWidget(widget)
                ? of(treeActions.changePaginationType({ bcName: widget.bcName, paginationType: action.payload.type }))
                : EMPTY
        })
    )

interface TreePathRestoreState {
    data: DataItem[]
    restoredNodeIds: string[]
    nextIds: string[]
    requestDepth: number
}

type EpicApi = Parameters<RootEpic>[2]['api']

interface RestoreTreePathsOptions {
    api: EpicApi
    state: RootState
    bcName: string
    initialData?: DataItem[]
    requestedIds?: string[]
    maxNestLevel: number
    prefetchRequestedNodes?: boolean
}

const normalizeNestLevel = (value: number) => (Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0)

const restoreTreePaths = ({
    api,
    state,
    bcName,
    initialData = [],
    requestedIds = [],
    maxNestLevel,
    prefetchRequestedNodes = false
}: RestoreTreePathsOptions) => {
    const bc = state.screen.bo.bc[bcName]
    const widget = getTreeWidget(state, bcName)

    if (!bc || !widget) {
        return EMPTY
    }

    const bcUrl = buildBcUrl(bcName, false, state) ?? ''
    const { parentFieldKey } = getTreeFieldKeys(widget)
    const limit = widget.limit || bc.limit || requestedIds.length || initialData.length
    const cachedNodes = state.tree[bcName]?.nodes ?? {}

    const resolveAncestors = (
        accumulatedData: DataItem[],
        restoredNodeIds: string[],
        seedIds: string[],
        requestDepth: number
    ): TreePathRestoreState => {
        const dataById = new Map(accumulatedData.map(item => [String(item[FIELDS.TECHNICAL.ID]), item]))
        const restoredIds = new Set(restoredNodeIds)
        const missingIds = new Set<string>()
        const visitedIds = new Set<string>()
        const queue = [...seedIds]

        while (queue.length > 0) {
            const nodeId = queue.shift()!
            if (visitedIds.has(nodeId)) {
                continue
            }
            visitedIds.add(nodeId)

            let node = dataById.get(nodeId)
            if (!node && cachedNodes[nodeId]) {
                node = cachedNodes[nodeId]
                dataById.set(nodeId, node)
                restoredIds.add(nodeId)
            }
            if (!node) {
                missingIds.add(nodeId)
                continue
            }

            const parentId = node[parentFieldKey]
            if (!isDefined(parentId)) {
                continue
            }

            const normalizedParentId = String(parentId)
            if (dataById.has(normalizedParentId) || cachedNodes[normalizedParentId]) {
                queue.push(normalizedParentId)
            } else {
                missingIds.add(normalizedParentId)
            }
        }

        return {
            data: [...dataById.values()],
            restoredNodeIds: [...restoredIds],
            nextIds: [...missingIds],
            requestDepth
        }
    }

    const fetchDataByIds = (ids: string[]) =>
        api
            .fetchBcData(state.screen.screenName, bcUrl, {
                _page: DEFAULT_PAGE,
                _limit: Math.max(limit, ids.length),
                ...getIdsFilterParams(ids)
            })
            .pipe(map(response => response.data))

    const mergeData = (...sources: DataItem[][]) => {
        const dataById = new Map<string, DataItem>()
        sources.flat().forEach(item => dataById.set(String(item[FIELDS.TECHNICAL.ID]), item))

        return [...dataById.values()]
    }

    const fetchNodesByIds = (ids: string[], restoreState: TreePathRestoreState) =>
        fetchDataByIds(ids).pipe(
            map(data => {
                const responseIds = getDataItemIds(data)

                // One API round resolves one missing ancestor level.
                return resolveAncestors(
                    mergeData(restoreState.data, data),
                    getUniqueValues([...restoreState.restoredNodeIds, ...responseIds]),
                    responseIds,
                    restoreState.requestDepth + 1
                )
            })
        )

    const uniqueRequestedIds = [...new Set(requestedIds.map(String))]
    const initialNodeIds = new Set(getDataItemIds(initialData))
    const missingRequestedIds = prefetchRequestedNodes ? uniqueRequestedIds.filter(id => !initialNodeIds.has(id) && !cachedNodes[id]) : []
    const preparedData$ = missingRequestedIds.length
        ? fetchDataByIds(missingRequestedIds).pipe(
              map(data => ({ data: mergeData(initialData, data), restoredNodeIds: getDataItemIds(data) }))
          )
        : of({ data: initialData, restoredNodeIds: [] as string[] })

    return preparedData$.pipe(
        switchMap(({ data: preparedData, restoredNodeIds }) => {
            const availableNodeIds = new Set([...Object.keys(cachedNodes), ...getDataItemIds(preparedData)])
            const initialSeedIds = uniqueRequestedIds.length
                ? uniqueRequestedIds.filter(id => !prefetchRequestedNodes || availableNodeIds.has(id))
                : getDataItemIds(preparedData)
            const initialRestoreState: TreePathRestoreState =
                maxNestLevel > 0
                    ? resolveAncestors(preparedData, restoredNodeIds, initialSeedIds, 0)
                    : { data: preparedData, restoredNodeIds, nextIds: [], requestDepth: 0 }

            return of(initialRestoreState).pipe(
                expand(restoreState => {
                    if (restoreState.requestDepth >= maxNestLevel || restoreState.nextIds.length === 0) {
                        return EMPTY
                    }

                    return fetchNodesByIds(restoreState.nextIds, restoreState)
                })
            )
        })
    )
}

/**
 * Responsible for synchronizing tree data with the data slice
 * @param action$
 * @param state$
 */
const syncTreeNodesToBcDataEpic: RootEpic = (action$, state$) =>
    action$.pipe(
        filter(
            isAnyOf(
                treeActions.fetchChildNodeDataSuccess,
                treeActions.restoreNodePathsSuccess,
                treeActions.clearFilter,
                treeActions.removeNode,
                treeActions.reconcileNode,
                treeActions.removeDraftNodes,
                actions.bcNewDataSuccess
            )
        ),
        switchMap(action => {
            const { bcName } = action.payload
            const state = state$.value
            const nodes = state.tree[bcName]?.nodes
            const data = nodes ? Object.values(nodes) : []

            return of(actions.updateBcData({ bcName, data }))
        })
    )

const getTreeReconcileContext = (state: RootState, bcName: string, previousId: string, dataItem: DataItem) => {
    const tree = state.tree[bcName]
    const nextId = dataItem[FIELDS.TECHNICAL.ID]

    if (!tree || !isDefined(nextId)) {
        return null
    }

    const widget = getTreeWidget(state, bcName)
    const previousNode = tree.nodes[previousId] ?? tree.nodes[String(nextId)]
    const nextNode = { ...previousNode, ...dataItem }
    const userFilters = getTreeUserFilters(state, bcName, tree.parentFieldKey)
    const previousMatchesFilters =
        tree.filterActive && !!previousNode && isDataItemMatchedByFilters(previousNode, userFilters, widget?.fields as WidgetFieldBase[])
    const matchesFilters = !tree.filterActive || isDataItemMatchedByFilters(nextNode, userFilters, widget?.fields as WidgetFieldBase[])
    const previousParentId = getParentId(previousNode, tree.parentFieldKey)
    const parentId = getParentId(nextNode, tree.parentFieldKey)

    return {
        parentChanged: !!previousNode && previousParentId !== parentId,
        restoreParentPathAction: parentId && !tree.nodes[parentId] ? treeActions.restoreNodePaths({ bcName, ids: [parentId] }) : undefined,
        reconcileAction: treeActions.reconcileNode({
            bcName,
            previousId,
            dataItem,
            limit: widget?.limit || state.screen.bo.bc[bcName]?.limit,
            previousMatchesFilters,
            matchesFilters,
            insertPosition: widget?.options?.tree?.insertPosition ?? 'start'
        })
    }
}

const reconcileTreeNodeEpic: RootEpic = (action$, state$) =>
    action$.pipe(
        filter(isAnyOf(actions.bcSaveDataSuccess, actions.sendOperationSuccess)),
        mergeMap(action => {
            const { bcName, cursor, dataItem } = action.payload
            const state = state$.value
            const context = dataItem ? getTreeReconcileContext(state, bcName, String(cursor), dataItem) : null

            if (!context) {
                return EMPTY
            }

            return concat(of(context.reconcileAction), context.restoreParentPathAction ? of(context.restoreParentPathAction) : EMPTY)
        })
    )

export const refreshNodeEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.bcForceUpdate.match),
        filter(action => !!action.payload.nodeId),
        mergeMap(action => {
            const state = state$.value
            const { bcName, nodeId: payloadNodeId } = action.payload
            const nodeId = String(payloadNodeId)
            const tree = state.tree[bcName]
            const widget = getTreeWidget(state, bcName)

            if (!tree || !widget) {
                return EMPTY
            }

            const fetchContext = buildBcFetchContext(state, bcName, {
                widgetName: widget.name,
                page: DEFAULT_PAGE,
                limit: 1,
                filters: [],
                limitBySelfCursor: false,
                additionalParams: getIdsFilterParams([nodeId])
            })

            if (!fetchContext) {
                return EMPTY
            }

            const canceler = api.createCanceler()
            const failAction = actions.bcFetchDataFail({ bcName, bcUrl: fetchContext.bcUrl })
            const cancelFlow = cancelRequestEpic(action$, cancelRequestActionTypes, canceler.cancel, failAction)
            const normalFlow = api
                .fetchBcData(state.screen.screenName, fetchContext.bcUrl, fetchContext.fetchParams, canceler.cancelToken)
                .pipe(
                    mergeMap(response => {
                        const dataItem = response.data.find(item => String(item[FIELDS.TECHNICAL.ID]) === nodeId)

                        if (!dataItem) {
                            return of(
                                treeActions.removeNode({
                                    bcName,
                                    nodeId,
                                    limit: widget.limit || state.screen.bo.bc[bcName]?.limit
                                })
                            )
                        }

                        const context = getTreeReconcileContext(state, bcName, nodeId, dataItem)
                        if (!context) {
                            return EMPTY
                        }

                        return concat(
                            of(context.reconcileAction),
                            context.parentChanged && context.restoreParentPathAction ? of(context.restoreParentPathAction) : EMPTY,
                            of(actions.bcFetchRowMeta({ widgetName: widget.name, bcName }))
                        )
                    }),
                    catchError(error => {
                        console.error(error)
                        return concat(of(failAction), utils.createApiErrorObservable(error))
                    })
                )

            return race(cancelFlow, normalFlow)
        })
    )

const removeCanceledTreeDraftEpic: RootEpic = action$ =>
    action$.pipe(
        filter(actions.setOperationFinished.match),
        filter(action => action.payload.operationType === OperationTypeCrud.cancelCreate),
        map(action => treeActions.removeDraftNodes({ bcName: action.payload.bcName }))
    )

export const fetchTreeChildNodesEpic: RootEpic = (action$, state$, { api, utils: internalUtils }) =>
    action$.pipe(
        filter(treeActions.fetchChildNodeData.match),
        mergeMap(action => {
            const { bcName, parentId } = action.payload
            const state = state$.value
            const treeState = state.tree[bcName]
            const widget = getTreeWidget(state, bcName)
            const { parentFieldKey } = getTreeFieldKeys(widget)
            const nodeState = treeState?.nodesState[String(parentId)]
            const parentFilter = {
                fieldName: parentFieldKey,
                type: parentId === null ? FilterType.specified : FilterType.equals,
                value: parentId === null ? false : parentId
            }
            const fetchContext = buildBcFetchContext(state, bcName, {
                widgetName: widget?.name,
                page: nodeState?.page ?? DEFAULT_PAGE,
                limit: action.payload.limit,
                filters: [parentFilter]
            })

            if (!fetchContext) {
                return of(treeActions.fetchChildNodeDataFail({ bcName, parentId }))
            }

            const canceler = api.createCanceler()
            const treeFetchFailAction = treeActions.fetchChildNodeDataFail({ bcName, parentId })
            const bcFetchFail = action.payload.bcDataRequestAction
                ? of(actions.bcFetchDataFail({ bcName, bcUrl: fetchContext.bcUrl }))
                : EMPTY
            const cancelFlow = cancelRequestEpic(action$, cancelRequestActionTypes, canceler.cancel, treeFetchFailAction).pipe(
                concatWith(bcFetchFail)
            )
            const cancelByParentBc = cancelRequestEpic(
                action$,
                [actions.bcSelectRecord],
                canceler.cancel,
                treeFetchFailAction,
                filteredAction => {
                    return fetchContext.bc.parentName === filteredAction.payload.bcName
                }
            ).pipe(concatWith(bcFetchFail))

            const userFilters = getTreeUserFilters(state, bcName, parentFieldKey)
            const hasUserFilters = userFilters.length > 0
            const localSideEffects = {
                applyFilter:
                    hasUserFilters && !treeState?.filterActive && widget?.bcName
                        ? of(treeActions.applyFilter({ bcName: widget.bcName }))
                        : EMPTY
            }

            const normalFlow = fetchPagesUntilDataChanges({
                fetchPage: page =>
                    api.fetchBcData(
                        state.screen.screenName,
                        fetchContext.bcUrl,
                        { ...fetchContext.fetchParams, _page: page },
                        canceler.cancelToken
                    ),
                initialPage: fetchContext.page,
                knownIds: new Set((treeState?.childIdsByParent[String(parentId)] ?? []).map(String)),
                paginationType: getPaginationType(state, widget),
                limit: fetchContext.limit,
                defaultLimit: fetchContext.bc.defaultLimit ?? fetchContext.limit,
                total: nodeState?.count,
                enabled: TREE_SHOW_MORE_AUTO_FETCH_ENABLED && action.payload.fetchUntilDataChanges === true,
                requestLimit: action.payload.maxRequests
            }).pipe(
                mergeMap(pageSequence => {
                    const setTreeData = of(
                        treeActions.fetchChildNodeDataSuccess({
                            bcName,
                            parentId,
                            data: pageSequence.accumulatedData,
                            hasNext: pageSequence.hasNext,
                            page: pageSequence.page,
                            lastResponseCount: pageSequence.data.length
                        })
                    )
                    const sourceAction = action.payload.bcDataRequestAction

                    if (!sourceAction) {
                        return setTreeData
                    }

                    const sideEffects = getBcFetchSideEffects({
                        action: sourceAction,
                        state,
                        data: pageSequence.accumulatedData,
                        bcName,
                        widgetName: sourceAction.payload.widgetName ?? '',
                        widget: fetchContext.widget,
                        internalUtils
                    })

                    if (!sideEffects.widgetIsUsed) {
                        return concat(sideEffects.cursorChange, setTreeData, sideEffects.fetchRowMeta)
                    }

                    return concat(
                        sideEffects.cursorChange,
                        sideEffects.resetOutdatedData,
                        setTreeData,
                        sideEffects.fetchRowMeta,
                        sideEffects.fetchChildren,
                        localSideEffects.applyFilter
                    )
                }),
                catchError(error => {
                    console.error(error)
                    return concat(of(treeFetchFailAction), bcFetchFail, utils.createApiErrorObservable(error))
                })
            )

            return race(cancelFlow, cancelByParentBc, normalFlow)
        })
    )

export const applyTreeFilterEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(treeActions.applyFilter.match),
        switchMap(action => {
            const { bcName } = action.payload
            const state = state$.value

            const widget = getTreeWidget(state, bcName)
            const { parentFieldKey } = getTreeFieldKeys(widget)
            const userFilters = getTreeUserFilters(state, bcName, parentFieldKey)
            const hasUserFilters = userFilters.length > 0

            if (!hasUserFilters) {
                return of(treeActions.clearFilter({ bcName }))
            }

            const filterPage = state.tree[bcName]?.filterPagination.page ?? DEFAULT_PAGE
            const fetchContext = buildBcFetchContext(state, bcName, {
                widgetName: widget?.name,
                page: filterPage,
                filters: userFilters
            })

            if (!fetchContext) {
                return of(treeActions.applyFilterFail({ bcName, more: action.payload.more }))
            }

            return fetchPagesUntilDataChanges({
                fetchPage: page =>
                    api.fetchBcData(state.screen.screenName, fetchContext.bcUrl, { ...fetchContext.fetchParams, _page: page }),
                initialPage: fetchContext.page,
                knownIds: new Set(action.payload.knownNodeIds ?? []),
                paginationType: getPaginationType(state, widget),
                limit: fetchContext.limit,
                defaultLimit: fetchContext.bc.defaultLimit ?? fetchContext.limit,
                total: state.tree[bcName]?.filterPagination.count,
                enabled: TREE_SHOW_MORE_AUTO_FETCH_ENABLED && action.payload.fetchUntilDataChanges === true,
                requestLimit: action.payload.maxRequests
            }).pipe(
                switchMap(pageSequence => {
                    const maxNestLevel = normalizeNestLevel(
                        widget?.options?.tree?.onFilterApplyNestLevel ?? DEFAULT_ON_FILTER_APPLY_NEST_LEVEL
                    )

                    return restoreTreePaths({ api, state, bcName, initialData: pageSequence.accumulatedData, maxNestLevel }).pipe(
                        last(),
                        map(restoreState =>
                            treeActions.applyFilterSuccess({
                                bcName,
                                data: restoreState.data,
                                filterResultNodeIds: getDataItemIds(pageSequence.accumulatedData),
                                matchedNodeIds: getDataItemIds(
                                    pageSequence.accumulatedData.filter(item =>
                                        isDataItemMatchedByFilters(item, userFilters, widget?.fields as WidgetFieldBase[])
                                    )
                                ),
                                restoredNodeIds: restoreState.restoredNodeIds,
                                hasNext: pageSequence.hasNext,
                                more: action.payload.more,
                                page: pageSequence.page,
                                lastResponseCount: pageSequence.data.length
                            })
                        )
                    )
                }),
                catchError(error => {
                    console.error(error)
                    return concat(
                        of(treeActions.applyFilterFail({ bcName, more: action.payload.more })),
                        utils.createApiErrorObservable(error)
                    )
                })
            )
        })
    )

export const applyTreeSortEpic: RootEpic = action$ =>
    action$.pipe(
        filter(treeActions.applySorter.match),
        mergeMap(action => {
            const { bcName } = action.payload

            return concat(
                of(treeActions.initTree({ bcName, reset: true })),
                of(treeActions.fetchChildNodeData({ bcName, parentId: null, page: DEFAULT_PAGE }))
            )
        })
    )

const restoreNodePathsEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(isAnyOf(treeActions.restoreNodePaths)),
        mergeMap(action => {
            const state = state$.value
            const { bcName } = action.payload
            const requestedIds = [...new Set(action.payload.ids.map(String))]
            if (!requestedIds.length) {
                return EMPTY
            }

            return restoreTreePaths({
                api,
                state,
                bcName,
                initialData: [],
                requestedIds: requestedIds,
                maxNestLevel: normalizeNestLevel(DEFAULT_PATH_RESTORE_NEST_LEVEL)
            }).pipe(
                last(),
                map(restoreState =>
                    treeActions.restoreNodePathsSuccess({
                        bcName,
                        data: restoreState.data,
                        restoredNodeIds: restoreState.restoredNodeIds
                    })
                ),
                catchError(error => {
                    console.error(error)
                    return utils.createApiErrorObservable(error)
                })
            )
        })
    )

export const treeEpics = {
    initTreeEpic,
    changeTreePaginationTypeEpic,
    syncTreeNodesToBcDataEpic,
    reconcileTreeNodeEpic,
    refreshNodeEpic,
    removeCanceledTreeDraftEpic,
    fetchTreeChildNodesEpic,
    restoreNodePathsEpic,
    applyTreeFilterEpic,
    applyTreeSortEpic
}
