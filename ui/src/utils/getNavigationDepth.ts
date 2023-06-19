import { WidgetTypes } from '@cxbox-ui/core/interfaces/widget'

export function getNavigationDepth(type?: string) {
    switch (type) {
        case WidgetTypes.FourthLevelMenu:
            return 3
        case WidgetTypes.ThirdLevelMenu:
            return 2
        case WidgetTypes.SecondLevelMenu:
        default:
            return 1
    }
}
