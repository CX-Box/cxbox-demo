import { PATH_SEPARATOR } from '@components/ViewNavigation/tab/standard/constants'

export const isChildForActiveParentNode = (nodePath: string, nodeDepth: number, activeViewsKeys: string[]) => {
    const parentNodeIndex = nodeDepth - 2
    const activeParentViewKey = activeViewsKeys[parentNodeIndex]
    // Since the id is unique, it is sufficient to verify that the parent key is in the path of the child node
    return nodePath
        .split(PATH_SEPARATOR)
        .filter(viewKeyInPath => viewKeyInPath)
        .some(viewKeyInPath => viewKeyInPath === activeParentViewKey)
}
