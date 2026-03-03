import { GroupingHierarchyCommonNode } from '@components/Table/groupingHierarchy'
import { formGroupPathFromRecord } from '@components/Table/groupingHierarchy/utils/formGroupPathFromRecord'

export const getInternalGroupPath = (fieldKey: string, record: GroupingHierarchyCommonNode, sortedGroupKeys: string[]) => {
    const itemInternalGroupLevel = sortedGroupKeys.findIndex(sortedGroupKey => sortedGroupKey === fieldKey) + 1

    return record._groupPath ? formGroupPathFromRecord(record, sortedGroupKeys, itemInternalGroupLevel) : ''
}
