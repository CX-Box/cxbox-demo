import { Observable } from 'rxjs'
import { actionTypes, AnyAction } from '../interfaces/actions'
import { OperationPreInvokeCustom, OperationPreInvokeSubType, OperationPreInvokeTypeCustom } from '../interfaces/operation'
import { $do } from '../actions/types'
import { WidgetMeta } from '@cxbox-ui/core/interfaces/widget'
import { CustomWidgetTypes } from '../interfaces/widget'
import { Epic } from 'redux-observable'
import { AppState } from '../interfaces/storeSlices'

const findFormPopupWidget = (operationType: string, widgets: WidgetMeta[], calleeBcName: string, widgetName?: string) => {
    const formPopupWidget = widgetName
        ? widgets.find(widget => widget.name === widgetName && widget.type === CustomWidgetTypes.FormPopup)
        : widgets.find(widget => widget.bcName === calleeBcName && widget.type === CustomWidgetTypes.FormPopup)

    if (!formPopupWidget) {
        console.info(`No popup form widget for the operation ${operationType} on bc ${calleeBcName}.`)
    }

    return formPopupWidget
}
const processPreInvokeConfirm: Epic<AnyAction, AppState> = (action$, store) =>
    action$.ofType(actionTypes.processPreInvoke).mergeMap(action => {
        const state = store.getState()
        const widgets = state.view.widgets
        const { bcName, operationType, widgetName } = action.payload
        const preInvoke = action.payload.preInvoke as OperationPreInvokeCustom

        if (
            preInvoke.type === OperationPreInvokeTypeCustom.custom &&
            preInvoke.subtype === OperationPreInvokeSubType.confirmWithCustomWidget
        ) {
            const formPopupWidget = findFormPopupWidget(operationType, widgets, bcName, preInvoke.widget)

            return Observable.of(
                formPopupWidget
                    ? $do.showViewPopup({
                          widgetName: formPopupWidget?.name,
                          bcName: formPopupWidget?.bcName ?? bcName,
                          calleeBCName: bcName,
                          assocValueKey: operationType,
                          options: { operation: action.payload }
                      })
                    : $do.operationConfirmation({
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

        return Observable.empty()
    })

export const screenEpics = {
    processPreInvokeConfirm
}
