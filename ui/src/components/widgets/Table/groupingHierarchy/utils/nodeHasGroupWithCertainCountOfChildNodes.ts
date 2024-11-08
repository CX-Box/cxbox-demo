import { CounterType, GroupingHierarchyCommonNode } from '@components/widgets/Table/groupingHierarchy'
import { countersTypeToParamKey } from '@components/widgets/Table/groupingHierarchy/constants'

// implementation taking into account the fact that some nodes are combined groups
export const nodeHasGroupWithCertainCountOfChildNodes = (
    node: GroupingHierarchyCommonNode,
    childNodesCounts: number[],
    counterType: CounterType,
    level?: number
) => {
    const paramKey = countersTypeToParamKey[counterType]
    const counters = node[paramKey]

    if (typeof level !== 'number') {
        return counters && Object.values(counters).some(count => childNodesCounts.includes(count))
    }

    const countOfChildrenAtCertainLevel = counters?.[level] ? +counters[level] : 0

    return childNodesCounts.includes(countOfChildrenAtCertainLevel)
}
