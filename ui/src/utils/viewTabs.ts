import { breadthFirstSearch } from './breadthFirst'
import { interfaces } from '@cxbox-ui/core'

const emptyArray: interfaces.NavigationTab[] = []

/**
 * Return navigation tabs array appropriate for specified level of navigation and currently active view
 *
 * @param navigation Navigation `menu` description from screen meta model
 * @param level Target level of navigation
 * @param activeView Currently active view
 */
export function getViewTabs(
    navigation: Array<Exclude<interfaces.MenuItem, interfaces.ViewNavigationCategory>> = [],
    level: number,
    activeView?: string
): interfaces.NavigationTab[] {
    if (!activeView && level > 1) {
        throw Error('activeView is required for navigation level greater than 1')
    }
    if (!navigation) {
        return emptyArray
    }
    let result: Array<Exclude<interfaces.MenuItem, interfaces.ViewNavigationCategory>> = emptyArray
    // First level can be mapped straight away
    if (!activeView || level === 1) {
        result = navigation
    } else {
        ;(navigation as interfaces.ViewNavigationGroup[])
            .filter(item => item.child)
            .some(item => {
                // Group with `activeView` as a direct child or just matching view
                const searchCondition = (node: interfaces.ViewNavigationGroup | interfaces.ViewNavigationItem) => {
                    if (interfaces.isViewNavigationGroup(node)) {
                        const hasDirectMatch = (node.child as interfaces.ViewNavigationItem[]).some(child => child.viewName === activeView)
                        return hasDirectMatch
                    }
                    return node.viewName === activeView
                }
                const searchResult = breadthFirstSearch(item, searchCondition)
                // Also the depth should match
                const match = searchResult?.node && searchResult.depth === Math.max(level - 1, 1)
                if (match) {
                    result = searchResult.node.child
                }
                return match
            })
    }
    // Set titles for groups
    return result
        ?.filter(item => !item.hidden)
        .map(item => {
            const title = interfaces.isViewNavigationGroup(item) ? { title: item.title } : undefined
            return { viewName: getReferencedView(item) as string, ...title }
        })
}

/**
 * Return matching navigation tab for provided navigation item:
 * - view name if item is just a view
 * - group title and referenced view name, where view is found by breadth-first search through group children
 * for default view if `defaultView` is specified on group or first available view otherwise.
 *
 * TODO: Change Exclude<MenuItem, ViewNavigationCategory> to MenuItem in 2.0.0
 *
 * @param navigationItem
 */
export function getReferencedView(navigationItem: Readonly<Exclude<interfaces.MenuItem, interfaces.ViewNavigationCategory>>) {
    if (interfaces.isViewNavigationItem(navigationItem)) {
        return navigationItem.viewName
    }
    // Search condition: defaultView or first available
    const predicate = (node: interfaces.ViewNavigationItem) => {
        return (navigationItem as interfaces.ViewNavigationGroup).defaultView
            ? node.viewName === (navigationItem as interfaces.ViewNavigationGroup).defaultView
            : !!node.viewName
    }
    const result = breadthFirstSearch(navigationItem, predicate)?.node as interfaces.ViewNavigationItem
    return result?.viewName
}
