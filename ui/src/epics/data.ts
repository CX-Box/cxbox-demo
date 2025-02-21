import { RootEpic } from '@store'
import { catchError, concat, EMPTY, filter, map, mergeMap, Observable, of } from 'rxjs'
import { DataItem, OperationError, OperationErrorEntity, OperationTypeCrud, utils } from '@cxbox-ui/core'
import { actions } from '@actions'
import { AxiosError } from 'axios'
import { AnyAction } from '@reduxjs/toolkit'
import { buildBcUrl } from '@utils/buildBcUrl'
import { selectBc, selectBcData } from '@selectors/selectors'

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

export const dataEpics = {
    bcSaveDataEpic
}
