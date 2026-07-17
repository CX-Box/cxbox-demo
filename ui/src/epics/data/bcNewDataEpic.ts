import { catchError, concat, EMPTY, filter, mergeMap, of } from 'rxjs'
import { DataItem, OperationTypeCrud } from '@cxbox-ui/schema'
import { RootEpic } from '@store'
import { actions } from '@actions'
import { buildBcUrl } from '@utils/buildBcUrl'
import { Store, utils } from '@cxbox-ui/core'

const {
    bcFetchRowMetaSuccess,
    bcNewDataFail,
    bcNewDataSuccess,
    changeDataItem,
    processPostInvoke,
    selectTableRow,
    sendOperation,
    setOperationFinished
} = actions

/**
 * Access `row-meta-new` API endpoint for business component endpoint; response will contain
 * row meta where `currentValue` of `id` field will contain an id for newly created record.
 *
 * `bcNewDataSuccess` action dispatched with new dataEpics.ts item draft (vstamp = -1).
 * `bcFetchRowMetaSuccess` action dispatched to set BC cursor to this new id.
 * `changeDataItem` action dispatched to add this new item to pending changes.
 * `processPostInvokeEpic` dispatched to handle possible post invokes.
 *
 * In case of an error message is logged as warning and `bcNewDataFail` action dispatched.
 *
 */
export const bcNewDataEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(sendOperation.match),
        filter(action => utils.matchOperationRole(OperationTypeCrud.create, action.payload, state$.value as unknown as Store)),
        mergeMap(action => {
            /**
             * Default implementation for `bcNewDataEpic` epic
             *
             * Access `row-meta-new` API endpoint for business component endpoint; response will contain
             * row meta where `currentValue` of `id` field will contain an id for newly created record.
             *
             * `bcNewDataSuccess` action dispatched with new dataEpics.ts item draft (vstamp = -1).
             * `bcFetchRowMetaSuccess` action dispatched to set BC cursor to this new id.
             * `changeDataItem` action dispatched to add this new item to pending changes.
             * `processPostInvokeEpic` dispatched to handle possible post invokes.
             *
             * In case of an error message is logged as warning and `bcNewDataFail` action dispatched.
             *
             */
            const state = state$.value
            const bcName = action.payload.bcName
            const bcUrl = buildBcUrl(bcName, false, state) ?? ''
            const context = { widgetName: action.payload.widgetName }
            const params = { _action: action.payload.operationType }
            return api.newBcData(state.screen.screenName, bcUrl, context, params).pipe(
                mergeMap(data => {
                    const rowMeta = data.row
                    const dataItem: DataItem = { id: null as any, vstamp: -1 }
                    data.row.fields.forEach(field => {
                        dataItem[field.key] = field.currentValue
                    })
                    const postInvoke = data.postActions?.[0]
                    const cursor = dataItem.id
                    return concat(
                        of(setOperationFinished({ bcName, operationType: OperationTypeCrud.create })),
                        of(bcNewDataSuccess({ bcName, dataItem, bcUrl })),
                        of(bcFetchRowMetaSuccess({ bcName, bcUrl: `${bcUrl}/${cursor}`, rowMeta, cursor })),
                        of(
                            changeDataItem({
                                bcName,
                                bcUrl: buildBcUrl(bcName, true, state) ?? '',
                                cursor: cursor,
                                dataItem: {
                                    id: cursor
                                }
                            })
                        ),
                        of(selectTableRow({ widgetName: action.payload.widgetName, rowId: cursor })),
                        postInvoke ? of(processPostInvoke({ bcName, postInvoke, cursor, widgetName: action.payload.widgetName })) : EMPTY
                    )
                }),
                catchError((error: any) => {
                    console.error(error)
                    return concat(
                        of(setOperationFinished({ bcName, operationType: OperationTypeCrud.create })),
                        of(bcNewDataFail({ bcName })),
                        utils.createApiErrorObservable(error, context)
                    )
                })
            )
        })
    )
