import { getArrayFromNodePath } from '@components/ViewNavigation/tab/standard/utils/common'

export const isChildForActiveParentNode = (nodePath: string, nodeDepth: number, activeViewsKeys: string[]) => {
    const parentNodeIndex = nodeDepth - 2
    const activeViewKeyOfPreviousDepth = activeViewsKeys[parentNodeIndex]
    const parentNodeViewKey = getArrayFromNodePath(nodePath)?.[parentNodeIndex]

    // Since the id is unique, it is sufficient to verify that the parent key is in the path of the child node
    return parentNodeViewKey === activeViewKeyOfPreviousDepth
}
