import { preorderDfsTreeTraversal } from '@components/ViewNavigation/tab/standard/utils/preorderDfsTreeTraversal'
import { MenuItem } from '@interfaces/navigation'
import {
    getArrayFromNodePath,
    getNodePath,
    hasDefaultView,
    hasTitle,
    isViewNavigationItem
} from '@components/ViewNavigation/tab/standard/utils/common'
import { ViewMetaResponse } from '@interfaces/session'
import { isChildForActiveParentNode } from '@components/ViewNavigation/tab/standard/utils/isChildForActiveParentNode'

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
    availableViews: ViewMetaResponse[],
    currentDepth: number,
    activeView: string | undefined,
    // The value in the field obtained by the idKey must not contain '/'
    { idKey = 'uid' }: { idKey?: string } = {}
) => {
    if (!navigation) {
        return
    }

    if (!activeView && currentDepth > 1) {
        throw Error('activeView is required for navigation level greater than 1')
    }

    const orderedDictionaryKeys: string[] = []
    const dictionary: Record<string, MenuItemNode> = {}
    const isAvailableView = (viewName: string | undefined) => availableViews.some(availableView => availableView.name === viewName)
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

                //  Responsible for setting the viewName for aggregate view (defaultView is always above navigationItem)
                if (hasDefaultView(node) && !isViewNavigationItem(node) && isAvailableView(node.defaultView)) {
                    const nodesKeys = getArrayFromNodePath(dictionary[nodeId]?.path)
                    nodesKeys?.forEach(dictionaryKey => {
                        const isCurrentView = nodeId === dictionaryKey

                        if ((!hasDefaultView(dictionary[dictionaryKey]) || isCurrentView) && !dictionary[dictionaryKey].viewName) {
                            dictionary[dictionaryKey].viewName = node.defaultView
                        }
                    })
                }

                //  Responsible for setting the viewName for single view and aggregate view without defaultView
                if (isViewNavigationItem(node) && isAvailableView(node.viewName)) {
                    const selected = node.viewName === activeView
                    const nodesKeys = getArrayFromNodePath(dictionary[nodeId]?.path)

                    nodesKeys?.forEach(dictionaryKey => {
                        const isVisibleNode = !node.hidden
                        // Set viewName of the first visible leaf of the branch as the default value for all parent nodes.
                        if (!dictionary[dictionaryKey].viewName && isVisibleNode) {
                            dictionary[dictionaryKey].viewName = node.viewName
                        }

                        // Mark all parent nodes including the leaf as selected
                        if (selected) {
                            dictionary[dictionaryKey].selected = true
                        }
                    })

                    activeViewsKeys = selected ? nodesKeys : activeViewsKeys
                }
            }
        })
    })

    return orderedDictionaryKeys.reduce<MenuItemNode[]>((acc, dictionaryKey) => {
        const nodeFromDictionary = dictionary[dictionaryKey]
        const isCurrentDepth = currentDepth === nodeFromDictionary.depth
        const isFirstDepth = currentDepth === 1
        const nodeVisibility = nodeFromDictionary.viewName && (!nodeFromDictionary.hidden || nodeFromDictionary.selected)

        // Leave the visible nodes that are children of the active view
        if (
            isCurrentDepth &&
            nodeVisibility &&
            (isFirstDepth ||
                isChildForActiveParentNode(String(nodeFromDictionary.path), nodeFromDictionary?.depth as number, activeViewsKeys || []))
        ) {
            acc.push(nodeFromDictionary)
        }

        return acc
    }, [])
}
