import { EMPTY, filter, mergeMap, of } from 'rxjs'
import { OperationPreInvokeCustom, OperationPreInvokeSubType, OperationPreInvokeTypeCustom } from '@interfaces/operation'
import { interfaces, actions } from '@cxbox-ui/core'
import { CustomWidgetTypes } from '@interfaces/widget'
import { processPreInvoke, sendOperationSuccess, showViewPopup } from '@actions'
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
                    `/${action.payload.bcName}/${state.screen.bo.bc[action.payload.bcName].cursor}`,
                    `/${action.payload.bcName}/${newCursor}`
                )
            }

            return EMPTY
        })
    )

export const screenEpics = {
    replaceTemporaryIdOnSavingEpic,
    processPreInvokeConfirmEpic
}
