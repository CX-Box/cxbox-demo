/*
 * © OOO "SI IKS LAB", 2022-2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { catchError, concat, EMPTY, filter, mergeMap, of, race } from 'rxjs'
import { AnyAction } from 'redux'
import { DataItem, WidgetTypes } from '@cxbox-ui/schema'
import { isAnyOf } from '@reduxjs/toolkit'
import { BcFilter, BcMetaState, EpicDependencyInjection, PopupWidgetTypes, utils, WidgetMeta } from '@cxbox-ui/core'
import { actions } from '@actions'
import { PopupData } from '@interfaces/view'
import { cancelRequestActionTypes, cancelRequestEpic } from '@utils/cancelRequestEpic'
import { RootEpic, RootState } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { treeActions } from '@slices/tree'
import { isTreeWidget } from '@constants/widget'
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '@constants/pagination'

const {
    checkShowCondition,
    cursorStrategyManager,
    getEagerBcChildren,
    getFilters,
    getSorters,
    getWidgetsForLazyLoad,
    isEagerWidget,
    createApiErrorObservable
} = utils
const {
    bcChangeCursors,
    bcChangePage,
    bcClearData,
    bcFetchDataFail,
    bcFetchDataPages,
    bcFetchDataRequest,
    bcFetchDataSuccess,
    bcFetchRowMeta,
    bcForceUpdate,
    bcSelectRecord,
    showViewPopup
} = actions

interface BcFetchContextOptions {
    widgetName?: string
    page?: number
    limit?: number
    filters?: BcFilter[]
    additionalParams?: Record<string, any>
    limitBySelfCursor?: boolean
}

export const buildBcFetchContext = (state: RootState, bcName: string, options: BcFetchContextOptions = {}) => {
    const { widgets } = state.view
    const widget =
        (options.widgetName ? widgets?.find(item => item.name === options.widgetName) : undefined) ??
        widgets?.find(item => item.bcName === bcName)
    const bc = state.screen.bo.bc[bcName]

    if (!widget || !bc) {
        return null
    }

    const page = options.page ?? bc.page ?? DEFAULT_PAGE
    const limit = options.limit ?? bc.limit ?? DEFAULT_PAGE_LIMIT
    const fullHierarchyWidget = widgets?.find(
        item => item.bcName === widget.bcName && item.type === WidgetTypes.AssocListPopup && item.options?.hierarchyFull
    )
    const filters = options.filters ?? (fullHierarchyWidget ? [] : state.screen.filters[bcName] || [])
    const limitBySelfCursor = options.limitBySelfCursor ?? state.router.bcPath?.includes(`${bcName}/${bc.cursor}`)
    const bcUrl = buildBcUrl(bcName, !!limitBySelfCursor, state) ?? ''

    const fetchParams: Record<string, any> = {
        _page: page,
        _limit: limit,
        ...getFilters(filters),
        ...getSorters(state.screen.sorters[bcName]),
        ...options.additionalParams
    }

    return { bc, widget, bcUrl, fetchParams, page, limit }
}

interface BcFetchSideEffectsOptions {
    action: AnyAction
    state: RootState
    data: DataItem[]
    bcName: string
    widgetName: string
    widget: WidgetMeta
    internalUtils?: EpicDependencyInjection['utils']
}

/** Builds reusable side-effect flows for a full BC load. */
export const getBcFetchSideEffects = ({ action, state, data, bcName, widgetName, widget, internalUtils }: BcFetchSideEffectsOptions) => {
    const bc = state.screen.bo.bc[bcName]
    const anyHierarchyWidget = state.view.widgets?.find(item => {
        return item.bcName === widget.bcName && item.type === WidgetTypes.AssocListPopup && isHierarchyWidget(item)
    })
    const cursorSelectionStrategy = (items: DataItem[], prevCursor: string | undefined) =>
        (internalUtils?.cursorStrategyManager ?? cursorStrategyManager).get(bc.cursorSelectionStrategy)(
            items,
            prevCursor,
            bcName,
            state as any
        )
    const isWidgetVisible = (candidate: WidgetMeta) => {
        if (candidate.showCondition?.bcName === state.screen.bo.bc[candidate.bcName]?.parentName) {
            let parentName = state.screen.bo.bc[candidate.showCondition?.bcName]?.parentName
            let parent = parentName === bcName
            while (!parent && parentName) {
                parentName = state.screen.bo.bc[parentName]?.parentName
                parent = parentName === bcName
            }
            if (parent) {
                return true
            }
        }
        const dataToCheck = bcName === candidate.showCondition?.bcName ? data : state.data[candidate.showCondition?.bcName as string]
        const currentCursor = dataToCheck
            ? cursorSelectionStrategy(dataToCheck, state.screen.bo.bc[candidate.showCondition?.bcName as string]?.cursor!)
            : null

        return checkShowCondition(candidate.showCondition, currentCursor!, dataToCheck, state.view.pendingDataChanges)
    }
    const cursorChange = getCursorChange(action, data, bc.cursor!, !!anyHierarchyWidget, cursorSelectionStrategy)
    const fetchRowMeta = of(bcFetchRowMeta({ widgetName, bcName }))
    const fetchChildren = data.length
        ? getChildrenData(
              action,
              state.view.widgets,
              state.screen.bo.bc,
              !!anyHierarchyWidget,
              isWidgetVisible,
              internalUtils?.getInternalWidgets
          )
        : EMPTY
    const widgetIsUsed = widgetIsUsedOnView(bcName, state.view.widgets, state.screen.bo.bc, state.view.popupData!, isWidgetVisible)
    const popupWidgetBcNames = state.view.widgets.filter(item => isPopupWidget(item.type)).map(item => item.bcName)
    const resetOutdatedData = widgetIsUsed ? resetOutdatedChildrenData(bcName, state.screen.bo.bc, state.data, popupWidgetBcNames) : EMPTY

    return { cursorChange, fetchRowMeta, fetchChildren, resetOutdatedData, widgetIsUsed }
}
/**
 *
 *
 * Loads BC's dataEpics.ts.
 * In case successful download:
 * - dispatches action to store
 * - initializes rowMeta load
 * - initializes child BCs dataEpics.ts load
 *
 * action.payload.bcName BC's name for dataEpics.ts load
 *
 * @category Epics
 */
export const bcFetchDataEpic: RootEpic = (action$, state$, { api, utils }) =>
    action$.pipe(
        filter(isAnyOf(bcFetchDataRequest, bcFetchDataPages, showViewPopup, bcForceUpdate, bcChangePage)),
        mergeMap(action => {
            const state = state$.value
            const { widgetName = '' } = action.payload
            const { widgets, infiniteWidgets } = state.view

            if (!action.payload.bcName) {
                console.warn(`No bc value found for refresh operation`)
                return EMPTY
            }
            const bcName = action.payload.bcName as string
            const fetchContext = buildBcFetchContext(state, bcName, { widgetName })

            if (!fetchContext) {
                return EMPTY
            }

            const { bc, widget, bcUrl, fetchParams, page, limit } = fetchContext
            /**
             * If popup has the same bc as initiator no dataEpics.ts fetching required, it will be
             * handled by initiator widget instead
             */
            if (showViewPopup.match(action) && bcName === action.payload.calleeBCName) {
                return EMPTY
            }

            const treeEnabled = widgets?.some(candidate => candidate.bcName === bcName && isTreeWidget(candidate))

            if (treeEnabled) {
                const resetTree = bcForceUpdate.match(action) || bcChangePage.match(action) || showViewPopup.match(action)
                const withBcDataSideEffects = bcFetchDataRequest.match(action) || resetTree

                return concat(
                    resetTree ? of(treeActions.initTree({ bcName, reset: true })) : EMPTY,
                    of(
                        treeActions.fetchChildNodeData({
                            bcName,
                            parentId: null,
                            page: fetchParams._page,
                            limit: fetchParams._limit,
                            bcDataRequestAction: withBcDataSideEffects ? action : undefined
                        })
                    )
                )
            }

            const anyHierarchyWidget = widgets?.find(item => {
                return item.bcName === widget.bcName && item.type === WidgetTypes.AssocListPopup && isHierarchyWidget(item)
            })

            if (bcForceUpdate.match(action)) {
                const infinityPaginationWidget =
                    (widgetName && infiniteWidgets?.includes(widgetName)) ||
                    widgets?.filter(item => item.bcName === bcName)?.find(item => infiniteWidgets?.includes(item.name))?.name
                if (infinityPaginationWidget) {
                    fetchParams._page = 1
                    fetchParams._limit = limit * page
                }
            }

            if (bcFetchDataPages.match(action)) {
                fetchParams._page = action.payload.from || 1
                fetchParams._limit = (action.payload.to || page - fetchParams._page) * limit
            }
            if ((bcFetchDataRequest.match(action) && action.payload.ignorePageLimit) || anyHierarchyWidget?.options?.hierarchyFull) {
                fetchParams._limit = 0
            }

            const canceler = api.createCanceler()
            const cancelFlow = cancelRequestEpic(action$, cancelRequestActionTypes, canceler.cancel, bcFetchDataFail({ bcName, bcUrl }))
            const cancelByParentBc = cancelRequestEpic(
                action$,
                [bcSelectRecord],
                canceler.cancel,
                bcFetchDataFail({ bcName, bcUrl }),
                filteredAction => {
                    const actionBc = filteredAction.payload.bcName
                    return bc.parentName === actionBc
                }
            )
            const normalFlow = api.fetchBcData(state.screen.screenName, bcUrl, fetchParams, canceler.cancelToken).pipe(
                mergeMap(response => {
                    const setDataSuccess = of(
                        bcFetchDataSuccess({
                            bcName,
                            data: response.data,
                            bcUrl,
                            hasNext: response.hasNext
                        })
                    )
                    const sideEffects = getBcFetchSideEffects({
                        action,
                        state,
                        data: response.data,
                        bcName,
                        widgetName,
                        widget,
                        internalUtils: utils
                    })

                    if (!sideEffects.widgetIsUsed) {
                        return concat(sideEffects.cursorChange, setDataSuccess, sideEffects.fetchRowMeta)
                    }
                    return concat(
                        sideEffects.cursorChange,
                        sideEffects.resetOutdatedData,
                        setDataSuccess,
                        sideEffects.fetchRowMeta,
                        sideEffects.fetchChildren
                    )
                }),
                catchError((error: any) => {
                    console.error(error)
                    return concat(of(bcFetchDataFail({ bcName: action.payload.bcName as string, bcUrl })), createApiErrorObservable(error))
                })
            )

            return race(cancelFlow, cancelByParentBc, normalFlow)
        })
    )

/**
 * Determines if the argument is hierarchy widget
 *
 * TODO: Should be typeguard when hierarchy widgets will have actual distinct interfaces
 *
 * @param widget Widget to check
 * @returns `true` if widget option `hierarchy` or `hierarchyFull` is set; `else` otherwise
 */
function isHierarchyWidget(widget: WidgetMeta) {
    return widget.options?.hierarchy || widget.options?.hierarchyFull
}

const getCursorChange = (
    action: AnyAction,
    data: DataItem[],
    prevCursor: string,
    isHierarchy: boolean,
    strategy: (data: DataItem[], prevCursor: string | undefined) => string | null | undefined
) => {
    const { bcName } = action.payload
    const keepDelta = bcFetchDataRequest.match(action) ? action.payload.keepDelta : undefined
    const updatedCursor = !prevCursor || !data?.some(i => i.id === prevCursor)

    return updatedCursor
        ? of(
              bcChangeCursors({
                  cursorsMap: {
                      [bcName as string]: strategy(data, prevCursor)!
                  },
                  keepDelta: isHierarchy || keepDelta
              })
          )
        : EMPTY
}

const isPopupWidget = (type: string) => PopupWidgetTypes.includes(type)

const getChildrenData = (
    action: AnyAction,
    widgets: WidgetMeta[],
    bcDictionary: Record<string, BcMetaState>,
    isHierarchy: boolean,
    showConditionCheck: (widget: WidgetMeta) => boolean,
    getInternalWidgets: NonNullable<EpicDependencyInjection['utils']>['getInternalWidgets']
) => {
    const { bcName, widgetName } = action.payload

    const lazyWidgetNames = getWidgetsForLazyLoad(
        widgets,
        getInternalWidgets,
        showViewPopup.match(action) ? bcName ?? widgets.find(widget => widget.name === widgetName)?.bcName : undefined
    )
    const eagerChildren = getEagerBcChildren(bcName as string, widgets, bcDictionary, lazyWidgetNames, showConditionCheck)

    return concat(
        ...Object.entries(eagerChildren).map(([childBcName, widgetNames]) => {
            const nonLazyWidget = widgets.find(item => {
                return widgetNames.includes(item.name) && isEagerWidget(item, lazyWidgetNames, showConditionCheck)
            })

            return of(
                bcFetchDataRequest({
                    bcName: childBcName,
                    widgetName: nonLazyWidget?.name ?? widgetNames[0],
                    ignorePageLimit: action.payload?.ignorePageLimit || showViewPopup.match(action),
                    keepDelta: isHierarchy || action.payload?.keepDelta
                })
            )
        })
    )
}

const resetOutdatedChildrenData = (
    bcName: string,
    bcDictionary: Record<string, BcMetaState>,
    data: Record<string, DataItem[]>,
    popupWidgetBcNames: string[]
) => {
    if (popupWidgetBcNames.includes(bcName)) {
        return EMPTY
    }

    const parentBcNames = [bcName]
    const parentsBcUrls = parentBcNames.map(parentBcName => `${bcDictionary[parentBcName].url}/:id`)
    const childBcNamesWithData = Object.keys(data).reduce<string[]>((acc, bcNameWithData) => {
        const bc = bcDictionary[bcNameWithData]

        if (!popupWidgetBcNames.includes(bcNameWithData) && parentsBcUrls.some(item => bc.url.includes(item))) {
            acc.push(bc.name)
        }

        return acc
    }, [])

    return childBcNamesWithData.length
        ? of(
              bcClearData({
                  bcNames: childBcNamesWithData
              })
          )
        : EMPTY
}

/**
 * Checks if there is at least one visible widget with originBc or any child bc to it.
 * The check takes into account the visibility of popup widgets.
 */
function widgetIsUsedOnView(
    originBcName: string,
    widgets: WidgetMeta[],
    bcDictionary: Record<string, BcMetaState>,
    popupData: PopupData,
    showConditionCheck: (widget: WidgetMeta) => boolean
) {
    const bcWidgetsMap = widgets.reduce<Record<string, WidgetMeta[]>>((acc, widget) => {
        if (!widget.bcName) {
            return acc
        }

        if (!Array.isArray(acc[widget.bcName])) {
            acc[widget.bcName] = []
        }

        acc[widget.bcName].push(widget)

        return acc
    }, {})
    const bcListOnCurrentView = Object.keys(bcWidgetsMap)
    const originBcIsOnCurrentView = bcListOnCurrentView.includes(originBcName)

    const leastOneWidgetIsVisible = (currentBcName: string) =>
        !!bcWidgetsMap[currentBcName]?.some(widget => {
            const isVisiblePopup = popupData?.bcName === widget.bcName

            return (showConditionCheck(widget) && !isPopupWidget(widget.type)) || isVisiblePopup
        })

    const bcIsUsedInShowCondition = (currentBcName: string) =>
        !!bcWidgetsMap[currentBcName]?.some(widget => {
            return widget.showCondition?.bcName === originBcName
        })

    if ((originBcIsOnCurrentView && leastOneWidgetIsVisible(originBcName)) || bcIsUsedInShowCondition(originBcName)) {
        return true
    }

    const isChildBcForOriginBc = (bcName: string) => {
        const partUrlOfChildBc = `${bcDictionary[originBcName].url}/:id`
        return bcDictionary[bcName].url.includes(partUrlOfChildBc)
    }

    return bcListOnCurrentView.some(bcName => {
        return isChildBcForOriginBc(bcName) ? leastOneWidgetIsVisible(bcName) || bcIsUsedInShowCondition(originBcName) : false
    })
}
