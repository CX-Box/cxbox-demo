import { RootState } from '@store'
import { actions } from '@actions'
import { WidgetTypes } from '@cxbox-ui/core'
import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { selectBc, selectBcData, selectWidget, selectWidgetByCondition } from '@selectors/selectors'
import { hasInternalWidgetOptions } from '@hooks/useInternalWidget'

type ClosePopupRule = (
    state: RootState,
    action: ReturnType<typeof actions.sendOperationSuccess> | ReturnType<typeof actions.bcSaveDataSuccess>
) => ReturnType<typeof actions.closeViewPopup> | null

const resolveFileViewerInternalWidget = (state: RootState): AppWidgetMeta | undefined => {
    const externalWidget = selectWidgetByCondition(
        state,
        widget => state.view.popupData?.calleeWidgetName === widget.name && hasInternalWidgetOptions(widget)
    ) as AppWidgetMeta | undefined
    const createFormWidget = selectWidget(state, externalWidget?.options?.create?.widget) as AppWidgetMeta | undefined
    const editFormWidget = selectWidget(state, externalWidget?.options?.edit?.widget) as AppWidgetMeta | undefined

    // Internal widgets should have the same bcName
    const internalEditFormBcName = createFormWidget?.bcName || editFormWidget?.bcName
    if (!internalEditFormBcName) {
        return undefined
    }

    const internalWidgetCursor = selectBc(state, internalEditFormBcName)?.cursor
    const internalWidgetVstamp = selectBcData(state, internalEditFormBcName)?.find(dataItem => dataItem.id === internalWidgetCursor)?.vstamp

    const isCreateStyle = internalWidgetVstamp === -1
    return isCreateStyle ? createFormWidget : editFormWidget
}

const closeFileViewerPopupRule: ClosePopupRule = state => {
    if (state.view.popupData?.options?.type !== 'file-viewer') {
        return null
    }

    const resolvedWidget = resolveFileViewerInternalWidget(state)

    if (resolvedWidget?.type === WidgetTypes.Form && resolvedWidget.bcName === state.view.popupData.options.bcName) {
        return actions.closeViewPopup({ bcName: resolvedWidget.bcName })
    }

    return null
}

const closeCustomFormPopupRule: ClosePopupRule = state => {
    const popupWidgetName = state.view.popupData?.widgetName
    if (!popupWidgetName) {
        return null
    }

    const formPopupWidget = state.view.widgets.find(item => item.name === popupWidgetName && item.type === CustomWidgetTypes.FormPopup)

    return formPopupWidget?.bcName ? actions.closeViewPopup({ bcName: formPopupWidget.bcName }) : null
}

export const closePopupRules: ClosePopupRule[] = [closeFileViewerPopupRule, closeCustomFormPopupRule]
