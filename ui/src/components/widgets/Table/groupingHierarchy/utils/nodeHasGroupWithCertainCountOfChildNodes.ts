// implementation taking into account the fact that some nodes are combined groups
import { GroupingHierarchyCommonNode } from '@components/widgets/Table/groupingHierarchy'

export const nodeHasGroupWithCertainCountOfChildNodes = (node: GroupingHierarchyCommonNode, childNodesCounts: number[], level?: number) => {
    if (typeof level !== 'number') {
        return node._countOfRecordsPerLevel && Object.values(node._countOfRecordsPerLevel).some(count => childNodesCounts.includes(count))
    }

    const countOfChildrenAtCertainLevel = node?._countOfRecordsPerLevel?.[level] ? +node._countOfRecordsPerLevel[level] : 0

    return childNodesCounts.includes(countOfChildrenAtCertainLevel)
}
