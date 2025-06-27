import { AppWidgetMeta } from '@interfaces/widget'
import { WidgetTypes } from '@cxbox-ui/core'
import { popupWidgets, sidebarWidgetsTypes } from '@constants/layout'
import { createSkipWidgetList } from '@utils/createSkipWidgetList'

export function groupByRow<WidgetMeta extends AppWidgetMeta>(widgets: WidgetMeta[], skipWidgetTypes: string[]) {
    const byRow: Record<string, WidgetMeta[]> = {}
    const skipWidgetList = createSkipWidgetList(widgets)

    widgets
        .filter(item => {
            return !skipWidgetTypes.includes(item.type) && !skipWidgetList.includes(item.name) && !sidebarWidgetsTypes.includes(item.type)
        })
        .forEach(item => {
            if (!byRow[item.position]) {
                byRow[item.position] = []
            }
            byRow[item.position].push(item)
        })
    return byRow
}

export function getColWidth(widget: AppWidgetMeta) {
    // this is necessary so that the popup widget does not affect the formation of the grid
    const needFullWidth = popupWidgets.includes(widget.type as WidgetTypes)

    return needFullWidth ? 24 : widget.gridWidth
}
