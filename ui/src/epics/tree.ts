import { RootEpic, RootState } from '@store'
import { catchError, concat, EMPTY, expand, filter, from, last, map, mergeMap, of, switchMap } from 'rxjs'
import { DataItem, utils, WidgetFieldBase } from '@cxbox-ui/core'
import { actions } from '@actions'
import { isAnyOf } from '@reduxjs/toolkit'
import { buildBcUrl } from '@utils/buildBcUrl'
import { selectBcFilters } from '@selectors/selectors'
import { getUniqueValues, pick, treeActions } from '@slices/tree'
import { FilterType } from '@interfaces/filters'
import { FIELDS } from '@constants'
import { isDefined } from '@utils/isDefined'
import { buildBcFetchContext, getBcFetchSideEffects } from './data/bcFetchDataEpic'
import { DEFAULT_PAGE } from '@constants/pagination'
import { isDataItemMatchedByFilters } from '@utils/filterMatch'
import { getTreeFieldKeys } from '@utils/tree'
import { isTreeWidget } from '@constants/widget'
import { AppWidgetMeta } from '@interfaces/widget'
import {
    DEFAULT_EXPANDED_STATE_AFTER_FILTER,
    DEFAULT_SEARCH_MODE,
    TREE_PATH_RESTORE_MAX_REQUESTS_AFTER_FILTRATION,
    TREE_PATH_RESTORE_MAX_REQUESTS_BEFORE_FILTRATION
} from '@constants/tree'

export const initTreeEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.selectView.match),
        mergeMap(action => {
            const state = state$.value
            const widgets = state.view.widgets as AppWidgetMeta[] | undefined
            const treeWidgets = widgets?.filter(isTreeWidget)

            if (!treeWidgets || treeWidgets.length === 0) {
                return EMPTY
            }

            const treeBcNames = getUniqueValues(treeWidgets.map(w => w.bcName).filter(Boolean))

            const initActions = treeBcNames.flatMap(bcName => {
                const treeWidget = treeWidgets.find(widget => widget.bcName === bcName)
                const treeFieldKeys = getTreeFieldKeys(treeWidget)

                return [
                    treeActions.initTree({
                        bcName,
                        nodeState: pick(state.screen.bo.bc[bcName], ['loading', 'page', 'hasNext']),
                        searchMode: treeWidget?.options?.tree?.searchMode ?? DEFAULT_SEARCH_MODE,
                        ...treeFieldKeys
                    })
                ]
            })

            return from(initActions)
        })
    )

interface TreePathRestoreState {
    data: DataItem[]
    restoredNodeIds: string[]
    nextIds: string[]
    requestCount: number
}

type EpicApi = Parameters<RootEpic>[2]['api']

interface RestoreTreePathsOptions {
    api: EpicApi
    state: RootState
    bcName: string
    initialData?: DataItem[]
    requestedIds?: string[]
    maxRequests: number
}

const normalizeMaxRestoreRequests = (value: number) => (Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0)

const restoreTreePaths = ({ api, state, bcName, initialData = [], requestedIds = [], maxRequests }: RestoreTreePathsOptions) => {
    const bc = state.screen.bo.bc[bcName]
    const widget = (state.view.widgets as AppWidgetMeta[]).find(item => item.bcName === bcName && isTreeWidget(item))

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
        requestCount: number
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
            requestCount
        }
    }

    const fetchNodesByIds = (ids: string[], restoreState: TreePathRestoreState) =>
        api
            .fetchBcData(state.screen.screenName, bcUrl, {
                _page: DEFAULT_PAGE,
                _limit: Math.max(limit, ids.length),
                [`${FIELDS.TECHNICAL.ID}.${FilterType.equalsOneOf}`]: JSON.stringify(ids)
            })
            .pipe(
                map(response => {
                    const dataById = new Map<string, DataItem>()

                    restoreState.data.forEach(item => dataById.set(String(item[FIELDS.TECHNICAL.ID]), item))
                    response.data.forEach(item => dataById.set(String(item[FIELDS.TECHNICAL.ID]), item))
                    const responseIds = response.data.map(item => String(item[FIELDS.TECHNICAL.ID]))

                    return resolveAncestors(
                        [...dataById.values()],
                        getUniqueValues([...restoreState.restoredNodeIds, ...responseIds]),
                        responseIds,
                        restoreState.requestCount + 1
                    )
                })
            )

    const uniqueRequestedIds = [...new Set(requestedIds.map(String))]
    const initialSeedIds = uniqueRequestedIds.length ? uniqueRequestedIds : initialData.map(item => String(item[FIELDS.TECHNICAL.ID]))
    const initialRestoreState: TreePathRestoreState =
        maxRequests > 0
            ? resolveAncestors(initialData, [], initialSeedIds, 0)
            : { data: initialData, restoredNodeIds: [], nextIds: [], requestCount: 0 }

    return of(initialRestoreState).pipe(
        expand(restoreState => {
            if (restoreState.requestCount >= maxRequests || restoreState.nextIds.length === 0) {
                return EMPTY
            }

            return fetchNodesByIds(restoreState.nextIds, restoreState)
        })
    )
}

/**
 * Responsible for synchronizing tree data with the data slice
 * @param action$
 * @param state$
 * @param api
 */
const syncTreeNodesToBcDataEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(isAnyOf(treeActions.fetchChildNodeDataSuccess, treeActions.restoreNodePathsSuccess)),
        switchMap(action => {
            const { bcName } = action.payload
            const state = state$.value
            const nodes = state.tree[bcName]?.nodes
            const data = nodes ? Object.values(nodes) : []

            return concat(of(actions.updateBcData({ bcName, data })))
        })
    )

export const fetchTreeChildNodesEpic: RootEpic = (action$, state$, { api, utils: internalUtils }) =>
    action$.pipe(
        filter(treeActions.fetchChildNodeData.match),
        mergeMap(action => {
            const { bcName, parentId } = action.payload
            const state = state$.value
            const treeState = state.tree[bcName]
            const widget = (state.view.widgets as AppWidgetMeta[]).find(item => item.bcName === bcName && isTreeWidget(item))
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

            const currentFilters = selectBcFilters(state, bcName) || []
            const userFilters = currentFilters?.filter(filter => filter.fieldName !== parentFieldKey)
            const hasUserFilters = userFilters.length > 0
            const localSideEffects = {
                applyFilter:
                    hasUserFilters && !treeState?.filterActive && widget?.bcName
                        ? of(treeActions.applyFilter({ bcName: widget.bcName }))
                        : EMPTY
            }

            return api.fetchBcData(state.screen.screenName, fetchContext.bcUrl, fetchContext.fetchParams).pipe(
                mergeMap(response => {
                    const setTreeData = of(
                        treeActions.fetchChildNodeDataSuccess({
                            bcName,
                            parentId,
                            data: response.data,
                            hasNext: response.hasNext
                        })
                    )
                    const sourceAction = action.payload.bcDataRequestAction

                    if (!sourceAction) {
                        return setTreeData
                    }

                    const sideEffects = getBcFetchSideEffects({
                        action: sourceAction,
                        state,
                        data: response.data,
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
                    return concat(of(treeActions.fetchChildNodeDataFail({ bcName, parentId })), utils.createApiErrorObservable(error))
                })
            )
        })
    )

export const applyTreeFilterEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(treeActions.applyFilter.match),
        switchMap(action => {
            const { bcName } = action.payload
            const state = state$.value

            const currentFilters = selectBcFilters(state, bcName) || []
            const widget = (state.view.widgets as AppWidgetMeta[]).find(item => item.bcName === bcName && isTreeWidget(item))
            const { parentFieldKey } = getTreeFieldKeys(widget)
            const userFilters = currentFilters?.filter(filter => filter.fieldName !== parentFieldKey)
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

            return api.fetchBcData(state.screen.screenName, fetchContext.bcUrl, fetchContext.fetchParams).pipe(
                switchMap(response => {
                    const maxRequests = normalizeMaxRestoreRequests(
                        widget?.options?.tree?.treePathRestoreMaxRequestsBeforeFiltration ??
                            TREE_PATH_RESTORE_MAX_REQUESTS_BEFORE_FILTRATION
                    )

                    return restoreTreePaths({ api, state, bcName, initialData: response.data, maxRequests }).pipe(
                        last(),
                        map(restoreState =>
                            treeActions.applyFilterSuccess({
                                bcName,
                                data: restoreState.data,
                                filterResultNodeIds: response.data.map(item => String(item[FIELDS.TECHNICAL.ID])),
                                matchedNodeIds: response.data
                                    .filter(item => isDataItemMatchedByFilters(item, userFilters, widget?.fields as WidgetFieldBase[]))
                                    .map(item => String(item[FIELDS.TECHNICAL.ID])),
                                restoredNodeIds: restoreState.restoredNodeIds,
                                hasNext: response.hasNext,
                                more: action.payload.more
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
            const widget = (state.view.widgets as AppWidgetMeta[]).find(item => item.bcName === bcName && isTreeWidget(item))

            if (!requestedIds.length) {
                return EMPTY
            }

            return restoreTreePaths({
                api,
                state,
                bcName,
                initialData: [],
                requestedIds: requestedIds,
                maxRequests: normalizeMaxRestoreRequests(
                    widget?.options?.tree?.treePathRestoreMaxRequestsAfterFiltration ?? TREE_PATH_RESTORE_MAX_REQUESTS_AFTER_FILTRATION
                )
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
    syncTreeNodesToBcDataEpic,
    fetchTreeChildNodesEpic,
    restoreNodePathsEpic,
    applyTreeFilterEpic,
    applyTreeSortEpic
}
