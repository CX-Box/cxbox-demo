import { WidgetOptions, WidgetMeta } from './common'
import { FieldMeta } from '../fields'

/**
 * Options configuration for widgets displaying NavigationTabs
 */
interface NavigationOptions extends WidgetOptions {
    /**
     * Level of menu
     */
    navigationLevel?: number
}

/**
 * Configuration for widgets displaying NavigationTabs
 */
export interface ViewNavigationWidgetMeta extends WidgetMeta {
    /**
     * Unambiguous marker for JSON file specifying widget type
     */
    type: 'ViewNavigation'
    /**
     * Options for customizing widget
     */
    options: NavigationOptions
    fields: FieldMeta[]
}

export function isWidgetViewNavigation(meta: WidgetMeta): meta is ViewNavigationWidgetMeta {
    return meta.type === 'ViewNavigation'
}
