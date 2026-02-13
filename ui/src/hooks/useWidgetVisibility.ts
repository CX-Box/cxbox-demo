import { useAppSelector } from '@store'
import { selectWidget } from '@selectors/selectors'
import { PopupWidgetTypes, utils } from '@cxbox-ui/core'
import { WidgetShowCondition } from '@cxbox-ui/schema'

export const useWidgetVisibility = (widgetName: string | undefined) => {
    return useAppSelector(state => {
        const widget = selectWidget(state, widgetName)

        const legacyPopupCheck = state.view.popupData?.bcName === widget?.bcName
        const newPopupCheck = state.view.popupData?.widgetName ? state.view.popupData.widgetName === widget?.name : legacyPopupCheck

        let widgetVisibility = PopupWidgetTypes.includes(widget?.type as string) ? newPopupCheck : true

        if (
            !utils.checkShowCondition(
                widget?.showCondition as WidgetShowCondition,
                state.screen.bo.bc[widget?.showCondition?.bcName as string]?.cursor || '',
                state.data[widget?.showCondition?.bcName as string],
                state.view.pendingDataChanges
            )
        ) {
            widgetVisibility = false
        }

        return widgetVisibility
    })
}
