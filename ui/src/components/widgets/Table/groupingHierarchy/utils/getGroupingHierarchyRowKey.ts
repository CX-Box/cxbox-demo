import { GroupingHierarchyCommonNode } from '@components/widgets/Table/groupingHierarchy'

export const getGroupingHierarchyRowKey = <T extends GroupingHierarchyCommonNode>(record: T) => {
    return record._groupPath ?? record.id
}
