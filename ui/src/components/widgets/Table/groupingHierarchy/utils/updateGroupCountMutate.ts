import { GroupingHierarchyEmptyGroupNode, GroupingHierarchyGroupNode } from '@components/widgets/Table/groupingHierarchy'

export const updateGroupCountMutate = <T extends GroupingHierarchyGroupNode | GroupingHierarchyEmptyGroupNode>(
    group: T,
    level: number,
    step: number = 1
) => {
    const previousCount = group._countOfRecordsPerLevel[level] ?? 0

    group._countOfRecordsPerLevel[level] = previousCount + step
}

export const updateCountersForAllGroupsMutate = <T extends GroupingHierarchyGroupNode>(
    groupPaths: string[],
    groupsDictionary: Record<string, T>,
    countOfLevelsToUpdate?: number,
    step?: number
) => {
    for (let index = 0; index < (countOfLevelsToUpdate ?? groupPaths.length); index++) {
        const currentGroupPath = groupPaths[index]
        const currentGroup = groupsDictionary[currentGroupPath]
        const currentGroupLevel = index + 1

        updateGroupCountMutate(currentGroup, currentGroupLevel, step)
    }
}
