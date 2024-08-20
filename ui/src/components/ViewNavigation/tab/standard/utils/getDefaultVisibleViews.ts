import { preorderDfsTreeTraversal } from '@components/ViewNavigation/tab/standard/utils/preorderDfsTreeTraversal'
import { MenuItem } from '@interfaces/navigation'

export type MenuItemNode = Omit<MenuItem, 'title'> & {
    viewName?: string
    hidden?: boolean
}

/**
 * Based on the navigation tree, we get a list of visible views that can be used by default.
 * If a view is hidden, it cannot be used by default.
 * If the parent is hidden, the default view cannot be used.
 */
export const getDefaultVisibleViews = (navigation: MenuItem[] | undefined, { idKey = 'id' }: { idKey?: string } = {}) => {
    const dictionary: Record<string, MenuItemNode> = {}

    if (!navigation) {
        return
    }
    /**
     * Depth-first traversal of the navigation tree
     */
    navigation.forEach(node => {
        preorderDfsTreeTraversal<MenuItem>(node, (node, depth, parentNode) => {
            const nodeId = (node as Record<string, string>)[idKey]
            const parentNodeId = (parentNode as Record<string, string> | undefined)?.[idKey] as string
            const parentNodeFromDictionary = dictionary[parentNodeId]

            if (nodeId) {
                // We get the node with information from the traversal and save it for quick access
                dictionary[nodeId] = {
                    ...node,
                    hidden: node.hidden ?? parentNodeFromDictionary.hidden
                }
            }
        })
    })

    return Object.values(dictionary)
        .filter(item => !item.hidden && item.viewName)
        .map(item => item.viewName)
}
