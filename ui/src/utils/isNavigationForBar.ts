import { WidgetTypes } from '@cxbox-ui/core/interfaces/widget'
import { AppWidgetMeta } from '../interfaces/widget'

const menuWidgetTypes: string[] = [WidgetTypes.SecondLevelMenu, WidgetTypes.ThirdLevelMenu, WidgetTypes.FourthLevelMenu]

export function isBarNavigation(widget?: AppWidgetMeta, widgetIndex?: number) {
    return menuWidgetTypes.includes(widget?.type ?? '') && (widgetIndex === 0 || widget?.position === 0)
}
