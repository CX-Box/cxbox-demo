import { catchError, concat, EMPTY, filter, mergeMap, of, switchMap } from 'rxjs'
import { OperationPreInvokeCustom, OperationPreInvokeSubType, OperationPreInvokeTypeCustom } from '@interfaces/operation'
import { interfaces, utils } from '@cxbox-ui/core'
import { CustomWidgetTypes } from '@interfaces/widget'
import { actions, processPreInvoke, sendOperationSuccess, showViewPopup } from '@actions'
import { RootEpic } from '@store'
import { isAnyOf } from '@reduxjs/toolkit'

const findFormPopupWidget = (operationType: string, widgets: interfaces.WidgetMeta[], calleeBcName: string, widgetName?: string) => {
    const formPopupWidget = widgetName
        ? widgets.find(widget => widget.name === widgetName && widget.type === CustomWidgetTypes.FormPopup)
        : widgets.find(widget => widget.bcName === calleeBcName && widget.type === CustomWidgetTypes.FormPopup)

    if (!formPopupWidget) {
        console.info(`No popup form widget for the operation ${operationType} on bc ${calleeBcName}.`)
    }

    return formPopupWidget
}
export const processPreInvokeConfirmEpic: RootEpic = (action$, state$) =>
    action$.pipe(
        filter(processPreInvoke.match),
        mergeMap(action => {
            const state = state$.value
            const widgets = state.view.widgets
            const { bcName, operationType, widgetName } = action.payload
            const preInvoke = action.payload.preInvoke as OperationPreInvokeCustom
            if (
                preInvoke.type === OperationPreInvokeTypeCustom.custom &&
                preInvoke.subtype === OperationPreInvokeSubType.confirmWithCustomWidget
            ) {
                const formPopupWidget = findFormPopupWidget(operationType, widgets, bcName, preInvoke.widget)

                return of(
                    formPopupWidget
                        ? showViewPopup({
                              widgetName: formPopupWidget?.name,
                              bcName: formPopupWidget?.bcName ?? bcName,
                              calleeBCName: bcName,
                              assocValueKey: operationType,
                              options: { operation: action.payload }
                          })
                        : actions.operationConfirmation({
                              operation: {
                                  bcName,
                                  operationType,
                                  widgetName
                              },
                              confirmOperation: {
                                  type: preInvoke.type,
                                  message: preInvoke.message ?? '',
                                  okText: preInvoke.yesText,
                                  cancelText: preInvoke.noText
                              }
                          })
                )
            }

            return EMPTY
        })
    )

export const replaceTemporaryIdOnSavingEpic: RootEpic = (action$, state$) =>
    action$.pipe(
        filter(isAnyOf(sendOperationSuccess, actions.bcSaveDataSuccess)),
        mergeMap(action => {
            const state = state$.value
            const newCursor = action.payload.dataItem?.id

            if (newCursor != null) {
                window.location.href = `${window.location.href}`.replace(
                    `/${action.payload.bcName}/${state.screen.bo.bc[action.payload.bcName]?.cursor}`,
                    `/${action.payload.bcName}/${newCursor}`
                )
            }

            return EMPTY
        })
    )

const addFilterGroupEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.addFilterGroup.match),
        switchMap(action => {
            const newFilterGroup = action.payload

            return api.saveFilterGroup({ filterGroups: [newFilterGroup] }).pipe(
                switchMap(response =>
                    concat(
                        ...(response.data ?? []).map(({ id }) =>
                            of(
                                actions.updateIdForFilterGroup({
                                    id: id,
                                    bc: newFilterGroup.bc,
                                    name: newFilterGroup.name
                                })
                            )
                        )
                    )
                ),
                catchError(error => {
                    console.error('addFilterGroup failed')

                    return concat(
                        of(actions.removeFilterGroup({ bc: newFilterGroup.bc, name: newFilterGroup.name })),
                        utils.createApiErrorObservable(error)
                    )
                })
            )
        })
    )

const deleteFilterGroupEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.removeFilterGroup.match),
        switchMap(action => {
            const { id } = action.payload

            if (id) {
                api.deleteFilterGroup(+id)
            }

            return EMPTY
        }),
        catchError(error => {
            return utils.createApiErrorObservable(error)
        })
    )

export const screenEpics = {
    replaceTemporaryIdOnSavingEpic,
    processPreInvokeConfirmEpic,
    addFilterGroupEpic,
    deleteFilterGroupEpic
}
