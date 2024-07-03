import { interfaces } from '@cxbox-ui/core'
import { NAVIGATION_LEVEL_SCREEN } from '@constants'

const { WidgetTypes } = interfaces

export function getNavigationDepth(type?: string) {
    switch (type) {
        case WidgetTypes.FourthLevelMenu:
            return 3
        case WidgetTypes.ThirdLevelMenu:
            return 2
        case WidgetTypes.SecondLevelMenu:
            return 1
        default:
            return NAVIGATION_LEVEL_SCREEN
    }
}
