import { useAppSelector } from '@store'
import { utils } from '@cxbox-ui/core'
import { WidgetShowCondition } from '@cxbox-ui/schema'
import { AppWidgetMeta } from '@interfaces/widget'

// The sidebar column is shown while at least one of its widgets passes showCondition (always in debug mode: hidden widgets show debug panels)
export const useSidebarVisibility = (widgets: AppWidgetMeta[]) => {
    return useAppSelector(
        state =>
            !!state.session.debugMode ||
            widgets.some(widget =>
                utils.checkShowCondition(
                    widget.showCondition as WidgetShowCondition,
                    state.screen.bo.bc[widget.showCondition?.bcName as string]?.cursor || '',
                    state.data[widget.showCondition?.bcName as string],
                    state.view.pendingDataChanges
                )
            )
    )
}
