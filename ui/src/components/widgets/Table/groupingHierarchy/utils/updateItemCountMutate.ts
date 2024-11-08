import { CounterType, GroupingHierarchyEmptyGroupNode, GroupingHierarchyGroupNode } from '@components/widgets/Table/groupingHierarchy'
import { countersTypeToParamKey } from '@components/widgets/Table/groupingHierarchy/constants'

export const updateItemCountMutate = <T extends GroupingHierarchyGroupNode | GroupingHierarchyEmptyGroupNode>(
    group: T,
    level: number,
    step: number = 1,
    counterType: CounterType = 'record'
) => {
    const paramKey = countersTypeToParamKey[counterType]
    const previousCount = group[paramKey][level] ?? 0

    group[paramKey][level] = previousCount + step
}

export const updateItemCountersForAllGroupsMutate = <T extends GroupingHierarchyGroupNode>(
    groupPaths: string[],
    groupsDictionary: Record<string, T>,
    countOfLevelsToUpdate?: number,
    step?: number,
    counterType?: CounterType
) => {
    for (let index = 0; index < (countOfLevelsToUpdate ?? groupPaths.length); index++) {
        const currentGroupPath = groupPaths[index]
        const currentGroup = groupsDictionary[currentGroupPath]
        const currentGroupLevel = index + 1

        updateItemCountMutate(currentGroup, currentGroupLevel, step, counterType)
    }
}
