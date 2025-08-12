import { RootEpic, RootState } from '@store'
import { catchError, concat, EMPTY, filter, mergeMap, of, switchMap } from 'rxjs'
import { isAnyOf, nanoid } from '@reduxjs/toolkit'
import {
    OperationError,
    OperationErrorEntity,
    OperationPostInvokeAny,
    OperationPostInvokeType,
    OperationPreInvoke,
    OperationTypeCrud,
    PendingValidationFailsFormat,
    utils
} from '@cxbox-ui/core'
import { EMPTY_ARRAY, FIELDS } from '@constants'
import { actions, sendOperationSuccess, setBcCount } from '@actions'
import { buildBcUrl } from '@utils/buildBcUrl'
import { AxiosError } from 'axios'
import { postOperationRoutine } from './utils/postOperationRoutine'
import { AppWidgetGroupingHierarchyMeta, AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { getGroupingHierarchyWidget } from '@utils/groupingHierarchy'
import { DataItem } from '@cxbox-ui/schema'
import { postInvokeHasRefreshBc } from '@utils/postInvokeHasRefreshBc'
import { findWidgetHasCount } from '@components/ui/Pagination/utils'

const getWidgetsForRowMetaUpdate = (state: RootState, activeBcName: string) => {
    const { widgets, pendingDataChanges } = state.view
    const bcDictionary: { [bcName: string]: AppWidgetMeta } = {}

    widgets.forEach(widget => {
        if (
            !bcDictionary[widget.bcName] &&
            widget.showCondition?.bcName === activeBcName &&
            widget.bcName !== activeBcName &&
            utils.checkShowCondition(
                widget.showCondition,
                state.screen.bo.bc[widget.showCondition?.bcName as string]?.cursor || '',
                state.data[widget.showCondition?.bcName as string],
                pendingDataChanges
            )
        ) {
            bcDictionary[widget.bcName] = widget
        }
    })

    return Object.values(bcDictionary)
}

export const updateRowMetaForRelatedBcEpic: RootEpic = (action$, state$) =>
    action$.pipe(
        filter(isAnyOf(actions.forceActiveRmUpdate)),
        switchMap(action => {
            const { bcName } = action.payload
            const state = state$.value
            const widgetsForRowMetaUpdate = getWidgetsForRowMetaUpdate(state, bcName)

            if (widgetsForRowMetaUpdate.length) {
                return concat(
                    ...widgetsForRowMetaUpdate.map(currentWidget =>
                        of(actions.bcFetchRowMeta({ widgetName: currentWidget.name, bcName: currentWidget.bcName }))
                    )
                )
            }

            return EMPTY
        })
    )

const bcFetchCountEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.bcFetchDataSuccess.match),
        mergeMap(action => {
            const state = state$.value
            const widgetWithCount = findWidgetHasCount(action.payload.bcName, state.view.widgets)

            if (!widgetWithCount) {
                return EMPTY
            }

            const bcName = widgetWithCount.bcName
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
            const selectedRows = state.view.selectedRows[bcName]
            const flattenBcOperations = rowMeta?.actions ? utils.flattenOperations(rowMeta?.actions) : undefined
            const currentOperation = flattenBcOperations?.find(operation => operation.type === operationType)
            const currentOperationScope = currentOperation?.scope as string
            const ids =
                currentOperation?.scope === 'mass' && selectedRows?.length
                    ? selectedRows.map(
                          row =>
                              ({
                                  id: row.id as string
                              } as DataItem)
                      )
                    : undefined
            const isMassOperation = currentOperationScope === 'mass'

            for (const key in pendingRecordChange) {
                if (fields?.find(item => item.key === key && item.disabled)) {
                    delete pendingRecordChange[key]
                }
            }
            let data = record && ({ ...pendingRecordChange, vstamp: record.vstamp } as DataItem)
            const defaultSaveOperation =
                state.view.widgets?.find(item => item.name === widgetName)?.options?.actionGroups?.defaultSave ===
                    action.payload.operationType && actions.changeLocation.match(action.payload?.onSuccessAction?.type)
            const params: Record<string, string> = {
                _action: operationType,
                scope: currentOperationScope,
                ...utils.getFilters(filters),
                ...utils.getSorters(sorters)
            }
            if (confirm) {
                params._confirm = confirm
            }

            if (isMassOperation) {
                data = {
                    ...data,
                    [FIELDS.MASS_OPERATION.MASS_IDS]: ids
                } as DataItem
            }

            const context = { widgetName: action.payload.widgetName }
            return api.customAction(screenName, bcUrl, data, context, params).pipe(
                mergeMap(response => {
                    const postInvoke = response.postActions?.[0] as OperationPostInvokeAny & { bc?: string }
                    const dataItem = response.record
                    // TODO: Remove in 2.0.0 in favor of postInvokeConfirm (is this todo needed?)
                    const preInvoke = response.preInvoke as OperationPreInvoke
                    const responseIds = response[FIELDS.MASS_OPERATION.MASS_IDS]
                    const withoutBcForceUpdate = postInvokeHasRefreshBc(bcName, postInvoke) || isMassOperation

                    // defaultSaveOperation mean that executed custom autosave and postAction will be ignored
                    // drop pendingChanges and onSuccessAction execute instead
                    return concat(
                        of(actions.setOperationFinished({ bcName, operationType })),
                        defaultSaveOperation
                            ? action?.payload?.onSuccessAction
                                ? concat(of(actions.bcCancelPendingChanges({ bcNames: [bcName] })), of(action.payload.onSuccessAction))
                                : EMPTY
                            : concat(
                                  of(actions.sendOperationSuccess({ bcName, cursor: cursor as string, dataItem })),
                                  isMassOperation && action.payload.onSuccessAction ? of(action.payload.onSuccessAction) : EMPTY,
                                  isMassOperation && responseIds ? of(actions.clearSelectedRows({ bcName })) : EMPTY,
                                  isMassOperation && responseIds ? of(actions.selectRows({ bcName, dataItems: responseIds })) : EMPTY,
                                  withoutBcForceUpdate ? EMPTY : of(actions.bcForceUpdate({ bcName })),
                                  ...(isMassOperation
                                      ? [of(actions.setPendingPostInvoke({ bcName, operationType, postInvoke }))]
                                      : postOperationRoutine(widgetName, postInvoke, preInvoke, operationType, bcName))
                              )
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
                        of(actions.setOperationFinished({ bcName, operationType })),
                        of(actions.sendOperationFail({ bcName, bcUrl, viewError, entityError })),
                        utils.createApiErrorObservable(e, context)
                    )
                })
            )
        })
    )

const applyPendingPostInvokeEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.applyPendingPostInvoke.match),
        mergeMap(action => {
            const { bcName, operationType, widgetName, postInvoke } = action.payload

            return concat(...postOperationRoutine(widgetName ?? '', postInvoke, null as any, operationType, bcName))
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
                    const isRefreshCurrentBc = postInvoke?.type === OperationPostInvokeType.refreshBC
                    const needBcForceUpdate = !isRefreshCurrentBc
                    if (isGroupingHierarchy) {
                        // Needed for local data update without additional request
                        const newDataItems = response.records
                        const allData = [...newDataItems, ...(state.data[bcName as string] || {})]
                        const oldCursor = state.screen.bo.bc[bcName as string]?.cursor
                        const newItem = newDataItems?.length && newDataItems.find((item: DataItem) => item.id)
                        const newCursor = newItem ? newItem.id : (getCursor(allData, oldCursor) as string)
                        const cursorHasChange = bcName && newCursor !== oldCursor

                        return concat(
                            of(actions.sendOperationSuccess({ bcName: bcName as string, cursor: null as any, newDataItems })),
                            cursorHasChange
                                ? of(
                                      actions.bcChangeCursors({
                                          cursorsMap: {
                                              [bcName]: newCursor
                                          }
                                      })
                                  )
                                : EMPTY,
                            cursorHasChange ? of(actions.bcFetchRowMeta({ widgetName, bcName })) : EMPTY,
                            isPopup ? of(actions.closeViewPopup(null)) : EMPTY,
                            ...postOperationRoutine(widgetName as string, postInvoke, preInvoke, OperationTypeCrud.save, bcName as string)
                        )
                    }
                    return concat(
                        of(actions.sendOperationSuccess({ bcName: bcName as string, cursor: null as any })),
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

const getCursor = (data: DataItem[], prevCursor: string | null) => {
    const newCursor = data[0]?.id
    const cursorShouldChange = !data.some(i => i.id === prevCursor)
    return cursorShouldChange ? newCursor : prevCursor
}

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
                            of(actions.setOperationFinished({ bcName, operationType: OperationTypeCrud.delete })),
                            isTargetFormatPVF ? of(actions.bcCancelPendingChanges({ bcNames: [bcName] })) : EMPTY,
                            of(actions.updateBcData({ bcName, data: newData })),
                            of(actions.bcChangeCursors({ cursorsMap: { [bcName]: previousCursor } })),
                            of(actions.bcFetchRowMeta({ widgetName, bcName })),
                            postInvoke ? of(actions.processPostInvoke({ bcName, postInvoke, cursor, widgetName })) : EMPTY
                        )
                    }

                    return concat(
                        of(actions.setOperationFinished({ bcName, operationType: OperationTypeCrud.delete })),
                        isTargetFormatPVF ? of(actions.bcCancelPendingChanges({ bcNames: [bcName] })) : EMPTY,
                        of(actions.bcFetchDataRequest({ bcName, widgetName })),
                        postInvoke ? of(actions.processPostInvoke({ bcName, postInvoke, cursor, widgetName })) : EMPTY
                    )
                }),
                catchError((error: any) => {
                    console.error(error)
                    return concat(
                        of(actions.setOperationFinished({ bcName, operationType: OperationTypeCrud.delete })),
                        of(actions.bcDeleteDataFail({ bcName })),
                        utils.createApiErrorObservable(error, context)
                    )
                })
            )
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
            const pendingChangesNow = state.view.pendingDataChangesNow[bcName]?.[cursor]
            const currentRecordData = state.data[bcName]?.find(record => record.id === cursor)
            const requestId = nanoid()

            return concat(
                of(actions.addPendingRequest({ request: { requestId, type: 'force-active' } })),
                api
                    .getRmByForceActive(
                        state.screen.screenName,
                        bcUrl,
                        {
                            ...pendingChanges,
                            vstamp: currentRecordData?.vstamp as number
                        },
                        pendingChangesNow
                    )
                    .pipe(
                        mergeMap(data => {
                            return concat(
                                of(actions.removePendingRequest({ requestId })),
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

                            return concat(of(actions.removePendingRequest({ requestId })), utils.createApiErrorObservable(e))
                        })
                    )
            )
        })
    )

const closeFormPopup: RootEpic = (action$, state$) =>
    action$.pipe(
        filter(isAnyOf(sendOperationSuccess, actions.bcSaveDataSuccess)),
        switchMap(action => {
            const state = state$.value
            const popupWidgetName = state.view.popupData?.widgetName

            const formPopupWidget =
                popupWidgetName &&
                state.view.widgets.find(item => item.name === popupWidgetName && item.type === CustomWidgetTypes.FormPopup)

            if (formPopupWidget) {
                return of(actions.closeViewPopup({ bcName: formPopupWidget.bcName }))
            }

            return EMPTY
        })
    )

const collapseWidgetsByDefaultEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.selectView.match),
        mergeMap(() => {
            const viewName = state$.value.view.name
            const viewGroups = state$.value.view.groups
            const collapsedWidgets = state$.value.screen.collapsedWidgets?.[viewName]

            const result = viewGroups
                ?.filter(
                    viewGroup =>
                        viewGroup.collapsedCondition?.default === true &&
                        viewGroup.widgetNames?.length &&
                        !collapsedWidgets?.includes(viewGroup.widgetNames?.[0])
                )
                .map(viewGroup => of(actions.setCollapsedWidgets({ viewName: viewName, widgetNameGroup: viewGroup.widgetNames })))

            return result?.length ? concat(...result) : EMPTY
        })
    )

export const viewEpics = {
    bcFetchCountEpic,
    sendOperationEpic,
    fileUploadConfirmEpic,
    bcDeleteDataEpic,
    forceUpdateRowMeta,
    closeFormPopup,
    updateRowMetaForRelatedBcEpic,
    applyPendingPostInvokeEpic,
    collapseWidgetsByDefaultEpic
}
