import { GroupingHierarchyCommonNode } from '@components/widgets/Table/groupingHierarchy'
import { getGroupPaths } from '@components/widgets/Table/groupingHierarchy/utils/getGroupPaths'

/**
 * Paths of the groups of the node and of all groups under it, each once.
 * Only rows with children are walked: a record without them is in the groups of its parent row
 */
export const getSubtreeGroupPaths = (node: GroupingHierarchyCommonNode, sortedGroupKeys: string[]) => {
    const paths = new Set<string>()

    const collect = (current: GroupingHierarchyCommonNode) => {
        getGroupPaths(current, sortedGroupKeys).forEach(path => paths.add(path))
        current.children?.filter(child => child.children?.length).forEach(collect)
    }

    collect(node)

    return Array.from(paths)
}
