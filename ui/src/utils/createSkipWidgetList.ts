import { AppWidgetMeta } from '@interfaces/widget'
import { getInternalWidgets } from '@utils/getInternalWidgets'

export const createSkipWidgetList = <WidgetMeta extends AppWidgetMeta>(widgets: WidgetMeta[]) => {
    return getInternalWidgets(widgets)
}
