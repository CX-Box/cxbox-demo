import { WidgetOptions, WidgetMeta } from './common'
import { InfoFieldMeta } from '../fields'

/**
 * Options configuration for widgets displaying NavigationTabs
 */
interface NavigationOptions extends WidgetOptions {
    /**
     * Level of menu
     */
    navigationLevel?: number
}

export interface NavigationTabsWidgetMeta extends WidgetMeta {
    type: 'NavigationTabs'
    fields: InfoFieldMeta[]
    options: NavigationOptions
}

export function isWidgetNavigationTabs(meta: WidgetMeta): meta is NavigationTabsWidgetMeta {
    return meta.type === 'NavigationTabs'
}
