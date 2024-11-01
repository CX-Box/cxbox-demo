import { GroupingHierarchyGroupNode } from '@components/widgets/Table/groupingHierarchy'

export const updateGroupCountMutate = <T extends GroupingHierarchyGroupNode>(group: T, level: number) => {
    const previousCount = group._countOfRecordsPerLevel[level] ?? 0

    group._countOfRecordsPerLevel[level] = previousCount + 1
}
