import { RootEpic } from '@store'
import { catchError, concat, EMPTY, filter, mergeMap, Observable, of } from 'rxjs'
import {
    OperationError,
    OperationErrorEntity,
    OperationPostInvokeAny,
    OperationPostInvokeType,
    OperationPreInvoke,
    OperationTypeCrud,
    PendingValidationFailsFormat,
    utils,
    WidgetTypes
} from '@cxbox-ui/core'
import { EMPTY_ARRAY } from '@constants'
import { actions, setBcCount } from '@actions'
import { buildBcUrl } from '@utils/buildBcUrl'
import { AxiosError } from 'axios'
import { postOperationRoutine } from './utils/postOperationRoutine'
import { AppWidgetGroupingHierarchyMeta } from '@interfaces/widget'
import { getGroupingHierarchyWidget } from '@utils/groupingHierarchy'
import { AnyAction, nanoid } from '@reduxjs/toolkit'
import { DataItem } from '@cxbox-ui/schema'

const bcFetchCountEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.bcFetchDataSuccess.match),
        mergeMap(action => {
            const state = state$.value
            const sourceWidget = state.view.widgets?.find(i => i.bcName === action.payload.bcName)

            if (!sourceWidget) {
                return EMPTY
            }

            const bcName = sourceWidget.bcName
            const screenName = state.screen.screenName
            const filters = utils.getFilters(state.screen.filters[bcName] || EMPTY_ARRAY)
            const bcUrl = buildBcUrl(bcName)
            return api.fetchBcCount(screenName, bcUrl, filters).pipe(
                mergeMap(({ data }) => of(setBcCount({ bcName, count: data }))),
                catchError((error: AxiosError) => utils.createApiErrorObservable(error))
            )
        }),
        catchError(err => {
            console.error(err)
            return EMPTY
        })
    )

/**
 * Handle any `sendOperationEpic` action which is not part of built-in operations types
 *
 * Request will be send to `custom-action/${screenName}/${bcUrl}?_action=${action.payload.type}` endpoint,
 * with pending changes of the widget as requst body.
 *
 * Fires sendOperationSuccess, bcForceUpdate and postOperationRoutine
 */
export const sendOperationEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.sendOperation.match),
        filter(action => utils.matchOperationRole('none', action.payload, state$.value as any)),
        mergeMap(action => {
            const state = state$.value
            const screenName = state.screen.screenName
            const { bcName, operationType, widgetName } = action.payload
            // TODO: Remove conformOperation n 2.0.0
            const confirm = action.payload.confirmOperation?.type || action.payload.confirm
            const bcUrl = buildBcUrl(bcName, true, state)
            const bc = bcName ? state.screen.bo.bc[bcName] : undefined
            const rowMeta = bcUrl ? state.view.rowMeta[bcName]?.[bcUrl] : undefined
            const fields = rowMeta?.fields
            const cursor = bc?.cursor
            const record = state.data[bcName]?.find(item => item.id === bc?.cursor)
            const filters = state.screen.filters[bcName]
            const sorters = state.screen.sorters[bcName]
            const pendingRecordChange = { ...state.view.pendingDataChanges[bcName]?.[bc?.cursor as string] }
            for (const key in pendingRecordChange) {
                if (fields?.find(item => item.key === key && item.disabled)) {
                    delete pendingRecordChange[key]
                }
            }
            const data = record && { ...pendingRecordChange, vstamp: record.vstamp }
            const defaultSaveOperation =
                state.view.widgets?.find(item => item.name === widgetName)?.options?.actionGroups?.defaultSave ===
                    action.payload.operationType && actions.changeLocation.match(action.payload?.onSuccessAction?.type)
            const params: Record<string, string> = {
                _action: operationType,
                ...utils.getFilters(filters),
                ...utils.getSorters(sorters)
            }
            if (confirm) {
                params._confirm = confirm
            }
            const context = { widgetName: action.payload.widgetName }
            return api.customAction(screenName, bcUrl, data, context, params).pipe(
                mergeMap(response => {
                    const postInvoke = response.postActions?.[0] as OperationPostInvokeAny & { bc?: string }
                    const dataItem = response.record
                    // TODO: Remove in 2.0.0 in favor of postInvokeConfirm (is this todo needed?)
                    const preInvoke = response.preInvoke as OperationPreInvoke
                    // defaultSaveOperation mean that executed custom autosave and postAction will be ignored
                    // drop pendingChanges and onSuccessAction execute instead
                    const isRefreshCurrentBc = postInvoke?.type === OperationPostInvokeType.refreshBC && bcName === postInvoke?.bc
                    const needBcForceUpdate = !isRefreshCurrentBc
                    return defaultSaveOperation
                        ? action?.payload?.onSuccessAction
                            ? concat(of(actions.bcCancelPendingChanges({ bcNames: [bcName] })), of(action.payload.onSuccessAction))
                            : EMPTY
                        : concat(
                              of(actions.sendOperationSuccess({ bcName, cursor: cursor as string, dataItem })),
                              needBcForceUpdate ? of(actions.bcForceUpdate({ bcName })) : EMPTY,
                              ...postOperationRoutine(widgetName, postInvoke, preInvoke, operationType, bcName)
                          )
                }),
                catchError((e: AxiosError) => {
                    console.error(e)
                    let viewError: string = null as any
                    let entityError: OperationErrorEntity = null as any
                    const operationError = e.response?.data as OperationError
                    if (e.response?.data === Object(e.response?.data)) {
                        entityError = operationError?.error?.entity as OperationErrorEntity
                        viewError = operationError?.error?.popup?.[0] as string
                    }
                    return concat(
                        of(actions.sendOperationFail({ bcName, bcUrl, viewError, entityError })),
                        utils.createApiErrorObservable(e, context)
                    )
                })
            )
        })
    )

/**
 * It sends customAction request for `file-upload-save` endpoint with `bulkIds` dataEpics.ts
 * containing ids of uploaded files.
 * On success it fires `sendOperationSuccess`, `bcForceUpdate` and `closeViewPopup` actions
 * to refresh business component and close popup.
 *
 * It also launces postOperationRoutine to handle pre and post invokes.
 *
 */
export const fileUploadConfirmEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.bulkUploadFiles.match),
        mergeMap(action => {
            /**
             * Default implementation for `fileUploadConfirmEpic` epic
             *
             * It sends customAction request for `file-upload-save` endpoint with `bulkIds` dataEpics.ts
             * containing ids of uploaded files.
             * On success it fires `sendOperationSuccess`, `bcForceUpdate` and `closeViewPopup` actions
             * to refresh business component and close popup.
             *
             * It also launces postOperationRoutine to handle pre and post invokes.
             */
            const state = state$.value
            const isPopup = action.payload.isPopup ?? true
            const bcName = action.payload.bcName ?? state.view.popupData?.bcName
            const bcUrl = buildBcUrl(bcName as string, true, state)
            const widgetsWithCurrentBc = state.view.widgets.filter(item => item.bcName === bcName)
            const widgetWithGroupingHierarchy = getGroupingHierarchyWidget(
                widgetsWithCurrentBc as AppWidgetGroupingHierarchyMeta[],
                bcName as string
            )
            const isGroupingHierarchy = !!widgetWithGroupingHierarchy
            const widget = widgetWithGroupingHierarchy ?? widgetsWithCurrentBc[0]
            const widgetName = widget?.name
            const data = action.payload.fileIds.map(id => ({
                id: id,
                _associate: true,
                vstamp: 0
            }))

            return api.associate(state.screen.screenName, bcUrl, data, null as any).pipe(
                mergeMap(response => {
                    const postInvoke = response.postActions?.[0]
                    const preInvoke = response.preInvoke
                    // Needed for local data update without additional request
                    const newDataItems = isGroupingHierarchy ? response.records : undefined

                    const isRefreshCurrentBc = postInvoke?.type === OperationPostInvokeType.refreshBC && bcName === postInvoke?.bc
                    const needBcForceUpdate = !isRefreshCurrentBc && !isGroupingHierarchy

                    return concat(
                        of(actions.sendOperationSuccess({ bcName: bcName as string, cursor: null as any, newDataItems })),
                        needBcForceUpdate ? of(actions.bcForceUpdate({ bcName: bcName as string })) : EMPTY,
                        isPopup ? of(actions.closeViewPopup(null)) : EMPTY,
                        ...postOperationRoutine(widgetName as string, postInvoke, preInvoke, OperationTypeCrud.save, bcName as string)
                    )
                }),
                catchError((error: any) => {
                    console.error(error)
                    return utils.createApiErrorObservable(error)
                })
            )
        })
    )

const bcDeleteDataEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.sendOperation.match),
        filter(action => utils.matchOperationRole(OperationTypeCrud.delete, action.payload, state$.value as any)),
        mergeMap(action => {
            const state = state$.value
            const widgetName = action.payload.widgetName
            const widget = state.view.widgets.find(item => item.name === widgetName)
            const bcName = action.payload.bcName
            const cursor = state.screen.bo.bc[bcName]?.cursor as string
            const bcUrl = buildBcUrl(bcName, true, state)
            const context = { widgetName: action.payload.widgetName }
            const isTargetFormatPVF = state.view.pendingValidationFailsFormat === PendingValidationFailsFormat.target

            return api.deleteBcData(state.screen.screenName, bcUrl, context).pipe(
                mergeMap(data => {
                    const postInvoke = data.postActions?.[0]

                    const isGroupingHierarchy = widget?.type === 'GroupingHierarchy'
                    if (isGroupingHierarchy) {
                        const oldData = state.data[bcName]
                        const indexOfRemovedElement = oldData?.findIndex(item => item.id === cursor)
                        const previousElementIndex = indexOfRemovedElement > 0 ? indexOfRemovedElement - 1 : -1
                        const newData = oldData.filter(dataItem => dataItem.id !== cursor)
                        const previousCursor = oldData?.[previousElementIndex]?.id ?? newData[0]?.id ?? null

                        return concat(
                            isTargetFormatPVF ? of(actions.bcCancelPendingChanges({ bcNames: [bcName] })) : EMPTY,
                            of(actions.updateBcData({ bcName, data: newData })),
                            of(actions.bcChangeCursors({ cursorsMap: { [bcName]: previousCursor } })),
                            postInvoke ? of(actions.processPostInvoke({ bcName, postInvoke, cursor, widgetName })) : EMPTY
                        )
                    }

                    return concat(
                        isTargetFormatPVF ? of(actions.bcCancelPendingChanges({ bcNames: [bcName] })) : EMPTY,
                        of(actions.bcFetchDataRequest({ bcName, widgetName })),
                        postInvoke ? of(actions.processPostInvoke({ bcName, postInvoke, cursor, widgetName })) : EMPTY
                    )
                }),
                catchError((error: any) => {
                    console.error(error)
                    return concat(of(actions.bcDeleteDataFail({ bcName })), utils.createApiErrorObservable(error, context))
                })
            )
        })
    )

export const getRowMetaByForceActiveEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.changeDataItem.match),
        mergeMap(action => {
            const state = state$.value
            const initUrl = state.view.url
            const { bcName, cursor, disableRetry } = action.payload

            const isBcHierarchy = state.view.widgets.some(widget => {
                return (
                    widget.bcName === bcName &&
                    widget.type === WidgetTypes.AssocListPopup &&
                    (widget.options?.hierarchySameBc || widget.options?.hierarchyFull)
                )
            })
            if (isBcHierarchy) {
                return EMPTY
            }

            const bcUrl = buildBcUrl(bcName, true, state)
            const pendingChanges = state.view.pendingDataChanges[bcName]?.[cursor]
            const handledForceActive = state.view.handledForceActive[bcName]?.[cursor] || {}
            const currentRecordData = state.data[bcName]?.find(record => record.id === cursor)
            const fieldsRowMeta = state.view.rowMeta[bcName]?.[bcUrl]?.fields
            let changedFiledKey: string = null as any

            // среди forceActive-полей в дельте ищем то которое изменилось по отношению к обработанным forceActive
            // или не содержится в нем, устанавливаем флаг необходимости отправки запроса если такое поле найдено
            const someForceActiveChanged = fieldsRowMeta
                ?.filter(field => field.forceActive && pendingChanges[field.key] !== undefined)
                .some(field => {
                    const result = pendingChanges[field.key] !== handledForceActive[field.key]
                    if (result) {
                        changedFiledKey = field.key
                    }
                    return result
                })
            const requestId = nanoid()
            if (someForceActiveChanged && !disableRetry) {
                return concat(
                    of(actions.addPendingRequest({ request: { requestId, type: 'force-active' } })),
                    api
                        .getRmByForceActive(state.screen.screenName, bcUrl, {
                            ...pendingChanges,
                            vstamp: currentRecordData?.vstamp as number
                        })
                        .pipe(
                            mergeMap(data => {
                                const result: Array<Observable<AnyAction>> = [of(actions.removePendingRequest({ requestId }))]
                                if (state.view.url === initUrl) {
                                    result.push(
                                        of(
                                            actions.forceActiveRmUpdate({
                                                rowMeta: data,
                                                currentRecordData: currentRecordData as DataItem,
                                                bcName,
                                                bcUrl,
                                                cursor
                                            })
                                        )
                                    )
                                }
                                return concat(...result)
                            }),
                            catchError((e: AxiosError) => {
                                console.error(e)
                                let viewError: string | undefined = null as any
                                let entityError: OperationErrorEntity | undefined = null as any
                                const operationError = e.response?.data as OperationError
                                if (e.response?.data === Object(e.response?.data)) {
                                    entityError = operationError?.error?.entity
                                    viewError = operationError?.error?.popup?.[0]
                                }
                                return concat(
                                    of(actions.removePendingRequest({ requestId })),
                                    state.view.url === initUrl
                                        ? concat(
                                              of(
                                                  actions.changeDataItem({
                                                      bcName,
                                                      bcUrl: buildBcUrl(bcName, true, state),
                                                      cursor,
                                                      dataItem: { [changedFiledKey]: currentRecordData?.[changedFiledKey] },
                                                      disableRetry: true
                                                  })
                                              ),
                                              of(
                                                  actions.forceActiveChangeFail({
                                                      bcName,
                                                      bcUrl,
                                                      viewError: viewError as string,
                                                      entityError: entityError as OperationErrorEntity
                                                  })
                                              )
                                          )
                                        : EMPTY,
                                    utils.createApiErrorObservable(e)
                                )
                            })
                        )
                )
            }
            return EMPTY
        })
    )

export const forceUpdateRowMeta: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.forceUpdateRowMeta.match),
        mergeMap(action => {
            const state = state$.value
            const { bcName, onSuccessAction } = action.payload
            const cursor = action.payload.cursor ?? (state.screen.bo.bc[bcName]?.cursor as string)
            const bcUrl = buildBcUrl(bcName, true, state)
            const pendingChanges = state.view.pendingDataChanges[bcName]?.[cursor]
            const currentRecordData = state.data[bcName]?.find(record => record.id === cursor)

            return concat(
                api
                    .getRmByForceActive(state.screen.screenName, bcUrl, {
                        ...pendingChanges,
                        vstamp: currentRecordData?.vstamp as number
                    })
                    .pipe(
                        mergeMap(data => {
                            return concat(
                                of(
                                    actions.forceActiveRmUpdate({
                                        rowMeta: data,
                                        currentRecordData: currentRecordData as DataItem,
                                        bcName,
                                        bcUrl,
                                        cursor
                                    })
                                ),
                                onSuccessAction
                                    ? of({
                                          ...onSuccessAction,
                                          payload: {
                                              ...onSuccessAction.payload,
                                              wasForcedUpdate: true
                                          }
                                      })
                                    : EMPTY
                            )
                        }),
                        catchError((e: AxiosError) => {
                            console.error(e)

                            return concat(utils.createApiErrorObservable(e))
                        })
                    )
            )
        })
    )

export const viewEpics = {
    bcFetchCountEpic,
    sendOperationEpic,
    fileUploadConfirmEpic,
    bcDeleteDataEpic,
    getRowMetaByForceActiveEpic,
    forceUpdateRowMeta
}
