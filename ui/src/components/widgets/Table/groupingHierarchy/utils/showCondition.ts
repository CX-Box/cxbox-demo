import { GroupingHierarchyCommonNode } from '@components/widgets/Table/groupingHierarchy'
import { isUnallocatedRecord } from '@components/widgets/Table/groupingHierarchy/utils/isUnallocatedRecord'
import { getAllPathsOfTreeParentNodesUpToCurrentOne } from '@components/widgets/Table/groupingHierarchy/utils/getAllPathsOfTreeParentNodesUpToCurrentOne'
import { getGroupPaths } from '@components/widgets/Table/groupingHierarchy/utils/getGroupPaths'
import { getPreviousLevelPath } from '@components/widgets/Table/groupingHierarchy/utils/getPreviousLevelPath'

const groupsIsAvailable = (groupsPath: string[], availableGroupPaths: string[]) => {
    return groupsPath.length ? groupsPath.every(groupPath => availableGroupPaths.includes(groupPath)) : false
}

const groupHasParentGroup = (groupPath: string | undefined, groupLevel: number, parentGroupPaths: string[]) => {
    return groupPath && parentGroupPaths.some(parentGroupPath => parentGroupPath === getPreviousLevelPath(groupPath, groupLevel))
}

const calculateFieldsKeysToHideValuesForRowDependingOnLevel = (
    record: GroupingHierarchyCommonNode,
    sortedGroupKeys: string[] | undefined
) => {
    if (typeof record._groupLevel === 'number' && sortedGroupKeys) {
        return sortedGroupKeys.slice(0, record._groupLevel - 1)
    }

    return sortedGroupKeys ?? []
}

export const fieldShowCondition = (
    fieldKey: string,
    record: GroupingHierarchyCommonNode,
    sortedGroupKeys: string[],
    expandedRowKeys: string[]
) => {
    const internalGroupLevel = sortedGroupKeys.findIndex(key => key === fieldKey) + 1
    const isGroupingField = !!(record._emptyNodeLastLevel
        ? !!sortedGroupKeys?.slice(0, record._emptyNodeLastLevel)?.includes(fieldKey)
        : sortedGroupKeys?.includes(fieldKey))
    const showFirstGroupField = isGroupingField && record._groupLevel === 1 && sortedGroupKeys[0] === fieldKey
    const internalParentPaths = getGroupPaths(record, sortedGroupKeys, isGroupingField ? internalGroupLevel - 1 : sortedGroupKeys.length)
    const isUnallocatedRow = isUnallocatedRecord(record, sortedGroupKeys)
    const showOtherGroupField =
        isGroupingField &&
        typeof record._groupLevel === 'number' &&
        record._groupLevel > 0 &&
        groupsIsAvailable(internalParentPaths, expandedRowKeys) &&
        sortedGroupKeys[0] !== fieldKey
    const showChildField =
        ((!isGroupingField && typeof record._groupLevel !== 'number' && groupsIsAvailable(internalParentPaths, expandedRowKeys)) ||
            isUnallocatedRow ||
            (!isGroupingField && groupsIsAvailable(internalParentPaths, expandedRowKeys))) &&
        !record._emptyNode
    const hideGroupingFieldDependingOnLevel =
        isGroupingField &&
        !isUnallocatedRow &&
        calculateFieldsKeysToHideValuesForRowDependingOnLevel(record, sortedGroupKeys)?.includes(fieldKey)

    return (showFirstGroupField || showOtherGroupField || showChildField) && !hideGroupingFieldDependingOnLevel
}

export const rowShowCondition = (record: GroupingHierarchyCommonNode, sortedGroupKeys: string[], expandedRowKeys: string[]) => {
    const isFirstGroup = record._groupLevel === 1
    const isUnallocatedRow = isUnallocatedRecord(record, sortedGroupKeys)
    const childHasAllParentsExpanded = groupsIsAvailable(
        getAllPathsOfTreeParentNodesUpToCurrentOne(record._parentGroupPath),
        expandedRowKeys
    )
    const groupHasAllParentsExpanded =
        typeof record._groupLevel === 'number' && groupHasParentGroup(record._groupPath, record._groupLevel, expandedRowKeys)

    return isFirstGroup || isUnallocatedRow || childHasAllParentsExpanded || groupHasAllParentsExpanded
}
