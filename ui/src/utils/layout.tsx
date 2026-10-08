import { createSkipWidgetList } from '@utils/createSkipWidgetList'
import { sidebarWidgetsTypes } from '@constants/layout'
import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'

/**
 * @param keepWidgetNames internal widgets that still take a place in the layout (e.g. calendar create and edit forms)
 */
export function groupByRow<WidgetMeta extends AppWidgetMeta>(
    widgets: WidgetMeta[],
    skipWidgetTypes: string[],
    keepWidgetNames: string[] = []
) {
    const byRow: Record<string, WidgetMeta[]> = {}
    const skipWidgetList = createSkipWidgetList(widgets).filter(widgetName => !keepWidgetNames.includes(widgetName))

    widgets
        .filter(item => {
            return (
                !skipWidgetTypes.includes(item.type) &&
                !skipWidgetList.includes(item.name) &&
                !sidebarWidgetsTypes.includes(item.type) &&
                item.type !== CustomWidgetTypes.FilePreview
            )
        })
        .forEach(item => {
            if (!byRow[item.position]) {
                byRow[item.position] = []
            }
            byRow[item.position].push(item)
        })
    return byRow
}
