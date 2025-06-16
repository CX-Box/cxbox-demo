import { ApiResponse, FilterGroup } from './common'
import { WidgetMeta } from './widgets'

interface UserRole {
    type: string
    key: string
    value: string
    description: string
    language: string
    displayOrder: number
    active: boolean
    cacheLoaderName: string
}

interface SessionScreen {
    id: string
    name: string
    text: string // Отображаемое название
    url: string
    primary?: string
    defaultScreen?: boolean
    meta?: ScreenMetaResponse
    icon?: string
    notification?: number
}

export type FeatureSetting = {
    active: boolean
    cacheLoaderName: string | null
    description: string | null
    displayOrder: string | null
    key: 'filterByRangeEnabled' | string
    language: string | null
    type: string | null
    value: string | null
}

interface ScreenMetaResponse {
    bo: {
        bc: BcMeta[]
    }
    views: ViewMetaResponse[]
    primary?: string
    navigation: {
        menu: Array<MenuItemBaseRecord>
    }
}

export interface BcMeta {
    /**
     * Name of Business Component
     */
    name: string
    /**
     * Name of parent Business Component
     */
    parentName: string | null
    /**
     * TODO: desc, example
     */
    url: string
    /**
     * Currently active record
     */
    cursor: string | null
    /**
     * String representation of default bc sorters
     *
     * "_sort.{order}.{direction}={fieldKey}&_sort.{order}.{direction}"
     *
     * @param fieldKey Sort by field
     * @param order Priority of this specific sorter
     * @param direction "asc" or "desc"
     * i.e. "_sort.0.asc=firstName"
     */
    defaultSort?: string
    /**
     * Predefined filters
     */
    filterGroups?: FilterGroup[]
    /**
     * String representation of default bc filters
     *
     * "{fieldKey}.contains={someValue}"
     *
     * @param fieldKey Filtering field
     * @param someValue Filter value
     * i.e. "someField1.contains=someValue&someField2.equalsOneOf=%5B%22someValue1%22%2C%22someValue2%22%5D"
     */
    defaultFilter?: string
}

/**
 * Description of groups in the navigation menu.
 *
 * Used to create nesting levels of menu items.
 *
 * @param title Title of group. Navigation element shows it to user.
 * @param child Array of navigation elements specified below group(View or inner Group)
 */
interface ViewNavigationGroup extends MenuItemBaseRecord {
    /** TODO identifier will be nullable and string-only in 2.0.0 */
    id?: string | number
    /**
     * Displayed name for the grouup
     */
    title: string
    /**
     * Nested items for the group
     */
    child: Array<MenuItemBaseRecord>
    /**
     * If true, the group will not be visible in navigation (but still accessible by direct link or drilldown)
     */
    hidden?: boolean
    /**
     * If specified this view will be default view for the group; if not, the first available view will be default view
     */
    defaultView?: string
}

/**
 * The type of object to describe the menu items in the navigation.
 */
type MenuItemBaseRecord = object

/**
 * Description of the destination in the navigation menu.
 */
interface ViewNavigationItem extends MenuItemBaseRecord {
    // TODO: Should not be optional in 2.0.0
    viewName: string
    hidden?: boolean
    /** TODO: remove in 2.0.0 */
    id?: string
}

interface ViewMetaResponse {
    /**
     * @deprecated Deprecated in favor of `name`
     */
    id?: number
    /**
     * Name of the view as specified in *.view.json file
     */
    name: string
    /**
     * Displayed title
     */
    title?: string
    /**
     * Specifies which layout template to use for the view
     *
     *Not used in Cxbox UI Core, but can used by client application
     */
    template?: string
    /**
     * @deprecated Used for dynamic view layouts (configurable from user side), which are no longer implemented
     */
    customizable?: boolean
    /**
     * @deprecated Not used
     */
    editable?: boolean
    /**
     * Url for the view (usually in form of `${screen.name}/${view.name}`)
     */
    url: string
    /**
     * Widgets present on the view
     */
    widgets: WidgetMeta[]
    /**
     * @deprecated Used for dynamic view layouts (configurable from user side), which are no longer implemented
     */
    columns?: number | null
    /**
     * @deprecated Used for dynamic view layouts (configurable from user side), which are no longer implemented
     */
    rowHeight?: number | null
    /**
     * Not used in Cxbox UI Core, but can be used by client application
     */
    readOnly?: boolean
    /**
     * Not used in Cxbox UI Core
     *
     * TODO: Need description
     */
    ignoreHistory?: boolean
}

export interface AppMetaResponse extends ApiResponse {
    devPanelEnabled?: boolean
    activeRole?: string
    roles?: UserRole[]
    firstName?: string
    lastName?: string
    login?: string
    screens: SessionScreen[]
    userId: string
    featureSettings?: FeatureSetting[]
}

/**
 * Returns MenuItem if it is ViewNavigationItem
 *
 * @param item to be identified as view
 * @category Type Guards
 */
export function isViewNavigationItem(item: MenuItemBaseRecord): item is ViewNavigationItem {
    return 'viewName' in item
}

/**
 * Returns MenuItem if it is ViewNavigationGroup
 *
 * @param item to be identified as group
 * @category Type Guards
 */
export function isViewNavigationGroup(item: MenuItemBaseRecord): item is ViewNavigationGroup {
    return 'child' in item
}
