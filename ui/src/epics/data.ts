import { RootEpic } from '@store'
import { catchError, concat, EMPTY, filter, mergeMap, Observable, of, race } from 'rxjs'
import {
    BcMetaState,
    OperationError,
    OperationErrorEntity,
    OperationTypeCrud,
    PopupWidgetTypes,
    utils,
    WidgetMeta,
    WidgetTypes
} from '@cxbox-ui/core'
import { actions, showViewPopup } from '@actions'
import { AxiosError } from 'axios'
import { AnyAction, isAnyOf } from '@reduxjs/toolkit'
import { buildBcUrl } from '@utils/buildBcUrl'
import { DataItem } from '@interfaces/core'
import { cancelRequestActionTypes, cancelRequestEpic } from '@utils/cancelRequestEpic'

// TODO update this epic in the kernel to the current implementation
/**
 * Post record's pending changes to `save dataEpics.ts` API endpoint.
 * Pending changes for fields disabled through row meta are not send; please notice that fields are
 * disabled by default.
 *
 * On success following actions are dispatched:
 * - {@link bcSaveDataSuccess}
 * - {@link bcFetchRowMeta}
 * - one {@link bcFetchDataRequest} for each child of saved business component
 * - optional {@link ActionPayloadTypes.processPostInvokeEpic | processPostInvokeEpic } if present in response
 * - optional `onSuccessAction` callback if provided in payload.
 *
 * On failure, console\.error called and {@link ActionPayloadTypes.bcSaveDataFail | bcSaveDataFail} action
 * dispatched.
 *
 * If there was a `onSuccessAction` callback provided in action payload (and widget option
 * {@link WidgetOptions.disableNotification} was not set)
 * then a notification will be shown on failure with suggestion to cancel pending changes and a button that fires
 * {@link bcCancelPendingChanges}
 *
 * @category Epics
 */
export const bcSaveDataEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.sendOperation.match),
        filter(action => utils.matchOperationRole(OperationTypeCrud.save, action.payload, state$.value as any)), // TODO remove as any
        mergeMap(action => {
            /**
             * Default implementation for `bcSaveData` epic
             *
             * Post record's pending changes to `save dataEpics.ts` API endpoint.
             * Pending changes for fields disabled through row meta are not send; pleace notice that fields are
             * disabled by default.
             *
             * On success following actions are dispatched:
             * - {@link ActionPayloadTypes.bcSaveDataSuccess | bcSaveDataSuccess}
             * - {@link ActionPayloadTypes.bcFetchRowMeta | bcFetchRowMeta}
             * - one {@link ActionPayloadTypes.bcFetchDataRequest | bcFetchDataRequest } for each children of saved
             * business component
             * - optional {@link ActionPayloadTypes.processPostInvokeEpic | processPostInvokeEpic } if present in response
             * - optional `onSuccessAction` callback if provided in payload.
             *
             * On failure, console\.error called and {@link ActionPayloadTypes.bcSaveDataFail | bcSaveDataFail} action
             * dispatched.
             *
             * If there was a `onSuccessAction` callback provided in action payload (and widget option
             * {@link WidgetOptions.disableNotification | disableNotification } was not set)
             * then a notification will be shown on failure with suggestion to cancel pending changes and a button that fires
             * {@link ActionPayloadTypes.bcCancelPendingChanges | bcCancelPendingChanges}
             */
            const state = state$.value
            const bcName = action.payload.bcName
            const bcUrl = buildBcUrl(bcName, true, state) ?? ''
            const widgetName = action.payload.widgetName
            const cursor = state.screen.bo.bc[bcName].cursor as string
            const dataItem = state.data[bcName].find(item => item.id === cursor)
            const pendingChanges = { ...state.view.pendingDataChanges[bcName]?.[cursor] }
            const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
            const options = state.view.widgets.find(widget => widget.name === widgetName)?.options

            // there is no row meta when parent bc custom operation's postaction triggers autosave, because custom operation call bcForceUpdate
            if (rowMeta) {
                const fields = rowMeta.fields
                for (const key in pendingChanges) {
                    if (fields.find(item => item.key === key && item.disabled)) {
                        delete pendingChanges[key]
                    }
                }
            }

            const fetchChildrenBcData = Object.entries(utils.getBcChildren(bcName, state.view.widgets, state.screen.bo.bc))
                .filter(entry => {
                    const [childBcName] = entry
                    // Solves the problem of calling data for rows that can be changed/deleted in the next action
                    const bkForNextAction = action.payload.onSuccessAction?.payload?.bcName

                    return bkForNextAction ? bkForNextAction !== childBcName : true
                })
                .map(entry => {
                    const [childBcName, widgetNames] = entry
                    return actions.bcFetchDataRequest({ bcName: childBcName, widgetName: widgetNames[0] })
                })

            const context = { widgetName: action.payload.widgetName }
            return api.saveBcData(state.screen.screenName, bcUrl, { ...pendingChanges, vstamp: dataItem?.vstamp as number }, context).pipe(
                mergeMap(data => {
                    const postInvoke = data.postActions?.[0]
                    const responseDataItem = data.record
                    return concat(
                        of(actions.bcSaveDataSuccess({ bcName, cursor, dataItem: responseDataItem })),
                        of(actions.bcFetchRowMeta({ widgetName, bcName })),
                        of(...fetchChildrenBcData),
                        postInvoke
                            ? of(
                                  actions.processPostInvoke({
                                      bcName,
                                      widgetName,
                                      postInvoke,
                                      cursor: responseDataItem.id
                                  })
                              )
                            : EMPTY,
                        action.payload.onSuccessAction ? of(action.payload.onSuccessAction) : EMPTY
                    )
                }),
                catchError((e: AxiosError) => {
                    console.error(e)
                    let notification$: Observable<AnyAction> = EMPTY
                    // Protection against widget blocking while autosaving
                    if (action.payload.onSuccessAction && !options?.disableNotification) {
                        notification$ = of(
                            actions.addNotification({
                                key: 'data_autosave_undo',
                                type: 'buttonWarningNotification',
                                message: 'There are pending changes. Please save them or cancel.',
                                duration: 0,
                                options: {
                                    buttonWarningNotificationOptions: {
                                        buttonText: 'Cancel changes',
                                        actionsForClick: [actions.bcCancelPendingChanges({ bcNames: [bcName] })]
                                    }
                                }
                            })
                        )
                    }
                    let viewError: string = null as any
                    let entityError: OperationErrorEntity = null as any
                    const operationError = e.response?.data as OperationError
                    if (e.response?.data === Object(e.response?.data)) {
                        entityError = operationError?.error?.entity ?? entityError
                        viewError = operationError?.error?.popup?.[0] ?? viewError
                    }

                    return concat(
                        of(actions.bcSaveDataFail({ bcName, bcUrl, viewError, entityError })),
                        notification$,
                        utils.createApiErrorObservable(e, context)
                    )
                })
            )
        })
    )

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
export const bcFetchDataEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(
            isAnyOf(
                actions.bcFetchDataRequest,
                actions.bcFetchDataPages,
                actions.showViewPopup,
                actions.bcForceUpdate,
                actions.bcChangePage
            )
        ),
        mergeMap(action => {
            const getCursorChange = (data: DataItem[], prevCursor: string, isHierarchy: boolean) => {
                const { bcName } = action.payload
                const keepDelta = actions.bcFetchDataRequest.match(action) ? action.payload.keepDelta : undefined
                const newCursor = data[0]?.id
                return of(
                    actions.bcChangeCursors({
                        cursorsMap: {
                            [bcName as string]: data.some(i => i.id === prevCursor) ? prevCursor : newCursor
                        },
                        keepDelta: isHierarchy || keepDelta
                    })
                )
            }

            const getChildrenData = (
                widgets: WidgetMeta[],
                bcDictionary: Record<string, BcMetaState>,
                isHierarchy: boolean,
                showConditionCheck: (widget: WidgetMeta) => boolean
            ) => {
                const { bcName } = action.payload
                const { ignorePageLimit, keepDelta } = actions.bcFetchDataRequest.match(action)
                    ? action.payload
                    : { ignorePageLimit: undefined, keepDelta: undefined }
                return concat(
                    ...Object.entries(utils.getBcChildren(bcName as string, widgets, bcDictionary))
                        .filter(([childBcName, widgetNames]) => {
                            const nonLazyWidget = widgets.find(item => {
                                return widgetNames.includes(item.name) && !PopupWidgetTypes.includes(item.type) && showConditionCheck(item)
                            })
                            const ignoreLazyLoad = showViewPopup.match(action)
                            if (ignoreLazyLoad) {
                                return true
                            }
                            return !!nonLazyWidget
                        })
                        .map(([childBcName, widgetNames]) => {
                            const nonLazyWidget = widgets.find(item => {
                                return widgetNames.includes(item.name) && !PopupWidgetTypes.includes(item.type) && showConditionCheck(item)
                            })
                            return of(
                                actions.bcFetchDataRequest({
                                    bcName: childBcName,
                                    widgetName: nonLazyWidget?.name as string,
                                    ignorePageLimit: ignorePageLimit || showViewPopup.match(action),
                                    keepDelta: isHierarchy || keepDelta
                                })
                            )
                        })
                )
            }

            const bcFetchDataImpl = (): Array<Observable<AnyAction>> => {
                const state = state$.value
                const { widgetName = '' } = action.payload
                const { widgets, infiniteWidgets } = state.view

                const widgetsWithCurrentBc = widgets?.filter(item => item.bcName === action.payload.bcName)
                /**
                 * TODO: Widget name will be mandatory in 2.0.0 but until then collision-vulnerable fallback is provided
                 * through business component match
                 */
                const widget = widgets?.find(item => item.name === widgetName) ?? widgetsWithCurrentBc?.[0]
                /**
                 * Missing widget means the view or screen were changed and dataEpics.ts request is no longer relevant
                 */
                if (!widget) {
                    return [EMPTY]
                }
                const bcName = action.payload.bcName as string
                const bc = state.screen.bo.bc[bcName]
                const { cursor, page = 1 } = bc
                const limit = (widgets?.find(i => i.bcName === bcName)?.limit || bc.limit) ?? 5
                const sorters = state.screen.sorters[bcName]
                /**
                 * If popup has the same bc as initiator no dataEpics.ts fetching required, it will be
                 * handled by initiator widget instead
                 */
                if (showViewPopup.match(action) && bcName === action.payload.calleeBCName) {
                    return [EMPTY]
                }

                const anyHierarchyWidget = widgets?.find(item => {
                    return item.bcName === widget.bcName && item.type === WidgetTypes.AssocListPopup && isHierarchyWidget(item)
                })
                const fullHierarchyWidget = state.view.widgets?.find(item => {
                    return item.bcName === widget.bcName && item.type === WidgetTypes.AssocListPopup && item.options?.hierarchyFull
                })

                const limitBySelfCursor = state.router.bcPath?.includes(`${bcName}/${cursor}`)
                const bcUrl = buildBcUrl(bcName, limitBySelfCursor, state)

                // Hierarchy widgets has own filter implementation
                const fetchParams: Record<string, any> = {
                    _page: page,
                    _limit: limit,
                    ...utils.getFilters(fullHierarchyWidget ? [] : state.screen.filters[bcName] || []),
                    ...utils.getSorters(sorters)
                }

                if (actions.bcForceUpdate.match(action)) {
                    const infinityPaginationWidget =
                        (widgetName && infiniteWidgets?.includes(widgetName)) ||
                        widgets?.filter(item => item.bcName === bcName)?.find(item => infiniteWidgets?.includes(item.name))?.name
                    if (infinityPaginationWidget) {
                        fetchParams._page = 1
                        fetchParams._limit = limit * page
                    }
                }

                if (actions.bcFetchDataPages.match(action)) {
                    fetchParams._page = action.payload.from || 1
                    fetchParams._limit = (action.payload.to || page - fetchParams._page) * limit
                }
                if (
                    (actions.bcFetchDataRequest.match(action) && action.payload.ignorePageLimit) ||
                    anyHierarchyWidget?.options?.hierarchyFull
                ) {
                    fetchParams._limit = 0
                }
                const canceler = api.createCanceler()
                const cancelFlow = cancelRequestEpic(
                    action$,
                    cancelRequestActionTypes,
                    canceler.cancel,
                    actions.bcFetchDataFail({ bcName, bcUrl })
                )
                const cancelByParentBc = cancelRequestEpic(
                    action$,
                    [actions.bcSelectRecord],
                    canceler.cancel,
                    actions.bcFetchDataFail({ bcName, bcUrl }),
                    filteredAction => {
                        const actionBc = filteredAction.payload.bcName
                        return bc.parentName === actionBc
                    }
                )

                const normalFlow = api.fetchBcData(state.screen.screenName, bcUrl, fetchParams, canceler.cancelToken).pipe(
                    mergeMap(response => {
                        const cursorChange = getCursorChange(response.data, cursor as string, !!anyHierarchyWidget)
                        const parentOfNotLazyWidget = widgets?.some(item => {
                            return state.screen.bo.bc[item.bcName]?.parentName === bcName && !PopupWidgetTypes.includes(item.type)
                        })

                        const isWidgetVisible = (w: WidgetMeta) => {
                            // check whether BC names from action payload, showCondition and current widget are relatives
                            // if positive check skip `checkShowCondition` call
                            if (w.showCondition?.bcName === state.screen.bo.bc[w.bcName]?.parentName) {
                                let parentName = state.screen.bo.bc[w.showCondition?.bcName]?.parentName
                                let parent = parentName === bcName
                                while (!parent && parentName) {
                                    parentName = state.screen.bo.bc[parentName]?.parentName
                                    parent = parentName === bcName
                                }
                                if (parent) {
                                    return true
                                }
                            }
                            const dataToCheck =
                                bcName === w.showCondition?.bcName ? response.data : state.data[w.showCondition?.bcName as string]
                            return utils.checkShowCondition(
                                w.showCondition,
                                state.screen.bo.bc[w.showCondition?.bcName as string]?.cursor as string,
                                dataToCheck,
                                state.view.pendingDataChanges
                            )
                        }
                        const leastOneWidgetIsVisible = !!widgetsWithCurrentBc?.some(widget => isWidgetVisible(widget))
                        const lazyWidget = (!leastOneWidgetIsVisible || PopupWidgetTypes.includes(widget.type)) && !parentOfNotLazyWidget
                        const skipLazy = state.view.popupData?.bcName !== widget.bcName
                        if (lazyWidget && skipLazy) {
                            return of(
                                actions.bcFetchDataSuccess({
                                    bcName,
                                    data: response.data,
                                    bcUrl,
                                    hasNext: response.hasNext
                                })
                            )
                        }
                        const fetchChildren = response.data?.length
                            ? getChildrenData(widgets, state.screen.bo.bc, !!anyHierarchyWidget, isWidgetVisible)
                            : EMPTY
                        const fetchRowMeta = of(actions.bcFetchRowMeta({ widgetName, bcName }))

                        return concat(
                            cursorChange,
                            of(
                                actions.bcFetchDataSuccess({
                                    bcName,
                                    data: response.data,
                                    bcUrl,
                                    hasNext: response.hasNext
                                })
                            ),
                            fetchRowMeta,
                            fetchChildren
                        )
                    }),
                    catchError((error: any) => {
                        console.error(error)
                        return concat(
                            of(actions.bcFetchDataFail({ bcName: action.payload.bcName as string, bcUrl })),
                            utils.createApiErrorObservable(error)
                        )
                    })
                )
                return [cancelFlow, cancelByParentBc, normalFlow]
            }

            return race(...bcFetchDataImpl())
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

export const dataEpics = {
    bcSaveDataEpic,
    bcFetchDataEpic
}
