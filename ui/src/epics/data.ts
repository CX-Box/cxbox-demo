import { RootEpic, RootState } from '@store'
import { catchError, concat, EMPTY, filter, from, mergeMap, Observable, of, tap, toArray } from 'rxjs'
import { BcMetaState, OperationError, OperationErrorEntity, OperationTypeCrud, utils, WidgetMeta } from '@cxbox-ui/core'
import { actions } from '@actions'
import { AxiosError } from 'axios'
import { AnyAction } from '@reduxjs/toolkit'
import { buildBcUrl } from '@utils/buildBcUrl'
import { bcHasPendingAutosaveChanges } from '@utils/autosave'
import { CxBoxApiInstance } from '../api'

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
                        of(actions.deselectTableRow()),
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

export const formBcHierarchy = (bcList: (BcMetaState & { child?: BcMetaState[] })[], bcBorders?: string[]) => {
    const newBcDictionary: Record<string, (typeof bcList)[number]> = {}
    const roots: typeof bcList = []

    Object.values(bcList).forEach(bc => {
        if (bc.name && !newBcDictionary[bc.name]) {
            newBcDictionary[bc.name] = { ...bc }

            const parentBcName = newBcDictionary[bc.name].parentName
            const parentBc = bcList.find(bc => bc.name === parentBcName)

            if (parentBcName && parentBc) {
                newBcDictionary[parentBcName] = newBcDictionary[parentBcName] ?? { ...parentBc }

                if (newBcDictionary[parentBcName]) {
                    newBcDictionary[parentBcName].child = newBcDictionary[parentBcName].child ?? []

                    newBcDictionary[parentBcName]?.child?.push(newBcDictionary[bc.name])
                }
            } else {
                roots.push(newBcDictionary[bc.name])
            }
        }
    })

    return roots
}

const widgetOperationRequest = (widget: WidgetMeta, state: RootState, api: typeof CxBoxApiInstance) => {
    const screenName = state.screen.screenName
    const bcName = widget.bcName
    const bc = state.screen.bo.bc[bcName]
    const bcUrl = buildBcUrl(bcName, true, state)
    const record = state.data[bcName]?.find(item => item.id === bc.cursor)
    const filters = state.screen.filters[bcName]
    const sorters = state.screen.sorters[bcName]
    const pendingRecordChange = { ...state.view.pendingDataChanges[bcName]?.[bc.cursor as string] }
    const data = { ...pendingRecordChange, vstamp: record?.vstamp as number }
    const operationType = (widget.options?.actionGroups?.defaultSave as string) ?? OperationTypeCrud.save
    const params: Record<string, string> = {
        _action: operationType,
        ...utils.getFilters(filters),
        ...utils.getSorters(sorters)
    }
    const widgetDefaultSave = widget.options?.actionGroups?.defaultSave ?? 'save'
    const isCoreSaveOperation = OperationTypeCrud.save === widgetDefaultSave

    return isCoreSaveOperation
        ? api.saveBcData(screenName, bcUrl, data, { widgetName: widget.name }, params)
        : api.customAction(screenName, bcUrl, record && data, { widgetName: widget.name }, params)
}

const mapBcNameWithFirstDefaultWidget = (successActions: AnyAction[] | undefined, state: RootState) => {
    const baseBcNames = successActions?.map(action => action.payload?.bcName)
    const bcDictionary = state.screen.bo.bc
    const widgetsWithDefaultSave = state.view.widgets?.filter(widget => widget?.options?.actionGroups?.defaultSave)

    const defaultSaveWidgetsHasPendingChanges = widgetsWithDefaultSave?.filter(
        defaultSaveWidget =>
            !baseBcNames?.includes(defaultSaveWidget.bcName) &&
            bcHasPendingAutosaveChanges(
                state,
                defaultSaveWidget.bcName,
                bcDictionary?.[defaultSaveWidget?.bcName as string]?.cursor as string
            )
    )
    const uniqueDefaultSave: Record<string, (typeof defaultSaveWidgetsHasPendingChanges)[number]> = {}

    defaultSaveWidgetsHasPendingChanges.forEach(widget => {
        if (!uniqueDefaultSave[widget.bcName]) {
            uniqueDefaultSave[widget.bcName] = widget
        }
    })

    return uniqueDefaultSave
}

const hierarchicalRequestOverTreeOfBc = (
    treeStructure: (BcMetaState & { child?: BcMetaState[] })[],
    bcNameToFirstDefaultSaveWidgetDictionary: Record<string, WidgetMeta>,
    state: RootState,
    api: typeof CxBoxApiInstance
): Observable<{ bcName: string; response: any; error?: any; success: boolean }[]> => {
    const hierarchicalRequest = (
        treeStructure: (BcMetaState & { child?: BcMetaState[] })[]
    ): Observable<{ bcName: string; response: any; error?: any; success: boolean }[]> => {
        return from(treeStructure).pipe(
            mergeMap(bc => {
                const bcName = bc.name
                const widget = bcNameToFirstDefaultSaveWidgetDictionary[bc.name]

                if (bc.child) {
                    return from(bc.child).pipe(
                        mergeMap(bc => from(hierarchicalRequest([bc])).pipe(mergeMap(item => item))),
                        toArray(),
                        mergeMap(childResults => {
                            if (childResults.some(item => !item.success)) {
                                return from(childResults)
                            }
                            return concat(
                                from(childResults),
                                widgetOperationRequest(widget, state, api).pipe(
                                    mergeMap(response => {
                                        return of({ bcName, response, success: true })
                                    }),
                                    catchError((e: AxiosError) => {
                                        return of({ bcName, response: e.response, success: false })
                                    })
                                )
                            )
                        }),
                        toArray()
                    )
                }

                return widgetOperationRequest(widget, state, api).pipe(
                    mergeMap(response => {
                        return of({ bcName, response, success: true })
                    }),
                    catchError((e: AxiosError) => {
                        return of({ bcName, error: e, response: e.response, success: false })
                    }),
                    toArray()
                )
            })
        )
    }

    return hierarchicalRequest(treeStructure)
}

const disableAutosaveForSuccessActions = <A extends AnyAction>(actions: A[] | undefined) => {
    return actions?.map(action => ({
        ...action,
        payload: { ...action.payload, autosave: false }
    }))
}

export const bulkDefaultSaveEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.callDefaultSave.match),
        mergeMap(action => {
            const state = state$.value
            const successActions = disableAutosaveForSuccessActions(action.payload?.onSuccessActions)
            const bcDictionary = state.screen.bo.bc

            const bcNameToFirstDefaultSaveWidgetDictionary = mapBcNameWithFirstDefaultWidget(successActions, state)
            const bcHierarchy = formBcHierarchy(Object.keys(bcNameToFirstDefaultSaveWidgetDictionary).map(bcName => bcDictionary[bcName]))

            return hierarchicalRequestOverTreeOfBc(bcHierarchy, bcNameToFirstDefaultSaveWidgetDictionary, state, api).pipe(
                mergeMap(requestsResults => {
                    return from(requestsResults)
                }),
                toArray(),
                mergeMap(flatRequestsResults => {
                    const resultingActionsForRequests: AnyAction[] = []

                    flatRequestsResults.forEach(requestsResult => {
                        if (requestsResult.success) {
                            const responseDataItem = requestsResult.response?.record
                            const wasSavingDataInEditableRow = state.view.selectedRow?.rowId === responseDataItem.id
                            const isChangeLocation =
                                successActions?.find(successAction => actions.changeLocation.match(successAction)) ?? false

                            resultingActionsForRequests.push(
                                actions.bcSaveDataSuccess({
                                    bcName: requestsResult.bcName,
                                    cursor: responseDataItem?.id,
                                    dataItem: responseDataItem
                                })
                            )

                            !isChangeLocation &&
                                resultingActionsForRequests.push(actions.bcFetchRowMeta({ widgetName: '', bcName: requestsResult.bcName }))

                            wasSavingDataInEditableRow && resultingActionsForRequests.push(actions.deselectTableRow())
                        }

                        if (!requestsResult.success ?? requestsResult.error) {
                            resultingActionsForRequests.push(utils.createApiError(requestsResult.error))

                            let viewError: string = null as any
                            let entityError: OperationErrorEntity = null as any
                            const operationError = requestsResult.error.response?.data as OperationError
                            if (requestsResult.error.response?.data === Object(requestsResult.error.response?.data)) {
                                entityError = operationError?.error?.entity ?? entityError
                                viewError = operationError?.error?.popup?.[0] ?? viewError
                            }
                            const bcName = requestsResult.bcName
                            const bcUrl = buildBcUrl(bcName, true, state)

                            resultingActionsForRequests.push(
                                actions.bcSaveDataFail({
                                    bcName,
                                    bcUrl,
                                    viewError,
                                    entityError
                                })
                            )
                        }
                    })

                    let notification: Observable<AnyAction> = EMPTY
                    const listOfBcWithError = flatRequestsResults
                        .filter(result => !result.success && result.bcName)
                        .map(result => result.bcName)

                    if (successActions?.length && listOfBcWithError.length) {
                        notification = of(
                            actions.addNotification({
                                key: 'data_autosave_undo',
                                type: 'buttonWarningNotification',
                                message: 'There are pending changes. Please save them or cancel.',
                                duration: 0,
                                options: {
                                    buttonWarningNotificationOptions: {
                                        buttonText: 'Cancel changes',
                                        actionsForClick: [actions.bcCancelPendingChanges({ bcNames: listOfBcWithError })]
                                    }
                                }
                            })
                        )
                    }

                    return concat(
                        resultingActionsForRequests,
                        flatRequestsResults.some(result => !result.success) || !successActions?.length ? EMPTY : successActions,
                        notification
                    )
                })
            )
        })
    )

export const dataEpics = {
    bcSaveDataEpic,
    bulkDefaultSaveEpic
}
