import { preorderDfsTreeTraversal } from '@components/ViewNavigation/tab/standard/utils/preorderDfsTreeTraversal'
import { MenuItem } from '@interfaces/navigation'
import { getArrayFromNodePath, getNodePath, hasTitle, isViewNavigationItem } from '@components/ViewNavigation/tab/standard/utils/common'

export type MenuItemNode = Omit<MenuItem, 'title'> & {
    path?: string
    parentNode?: MenuItemNode
    selected?: boolean
    depth?: number
    viewName?: string
    title?: string
}

export const getStandardViewTabs = (
    navigation: MenuItem[] | undefined,
    currentDepth: number,
    activeView: string | undefined,
    { idKey = 'id' }: { idKey?: string } = {}
) => {
    if (!navigation) {
        return
    }

    if (!activeView && currentDepth > 1) {
        throw Error('activeView is required for navigation level greater than 1')
    }

    const orderedDictionaryKeys: string[] = []
    const availableViews: string[] = []
    const dictionary: Record<string, MenuItemNode> = {}
    let activeViewsKeys: string[] | undefined
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
                    title: hasTitle(node) ? node.title : undefined,
                    path: getNodePath(parentNodeFromDictionary?.path as string, nodeId),
                    parentNode: parentNodeFromDictionary,
                    selected: false,
                    depth
                }
                // Preserve the order of passing nodes
                orderedDictionaryKeys.push(nodeId)

                if (isViewNavigationItem(node)) {
                    const selected = node.viewName === activeView
                    const nodesKeys = getArrayFromNodePath(dictionary[nodeId]?.path)

                    nodesKeys?.forEach(dictionaryKey => {
                        // Set viewName of the first leaf of the branch as the default value for all parent nodes
                        if (!dictionary[dictionaryKey].viewName) {
                            dictionary[dictionaryKey].viewName = node.viewName
                        }

                        // Mark all parent nodes including the leaf as selected
                        if (selected) {
                            dictionary[dictionaryKey].selected = true
                        }
                    })

                    activeViewsKeys = selected ? nodesKeys : activeViewsKeys

                    // Based on the leaves of the tree, we form a list of available views
                    node.viewName && availableViews.push(node.viewName)
                }
            }
        })
    })

    return orderedDictionaryKeys.reduce<MenuItemNode[]>((acc, dictionaryKey) => {
        const nodeFromDictionary = dictionary[dictionaryKey]
        const defaultView = (nodeFromDictionary as { defaultView?: string }).defaultView
        // Set defaultView after receiving the list of available views
        if (defaultView && availableViews.includes(defaultView)) {
            nodeFromDictionary.viewName = defaultView
        }

        const isCurrentDepth = currentDepth === nodeFromDictionary.depth
        const isFirstDepth = currentDepth === 1
        const parentNodeIndex = (nodeFromDictionary?.depth as number) - 2
        const isChildForActiveParentNode = String(nodeFromDictionary.path).includes(activeViewsKeys?.[parentNodeIndex] as string)
        const nodeVisibility = !nodeFromDictionary.hidden || nodeFromDictionary.selected

        // Leave the visible nodes that are children of the active view
        if (isCurrentDepth && nodeVisibility && (isFirstDepth || isChildForActiveParentNode)) {
            acc.push(nodeFromDictionary)
        }

        return acc
    }, [])
}
