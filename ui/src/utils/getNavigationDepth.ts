import { interfaces } from '@cxbox-ui/core'

const { WidgetTypes } = interfaces

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
