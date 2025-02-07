import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { BcFilter, BcSorter, WidgetListField } from '@cxbox-ui/core'
import { createEmptyGroupNodes } from '@components/widgets/Table/groupingHierarchy/utils/createEmptyGroupNodes'
import { isUnallocatedRecord } from '@components/widgets/Table/groupingHierarchy/utils/isUnallocatedRecord'
import { getGroupPaths } from '@components/widgets/Table/groupingHierarchy/utils/getGroupPaths'
import {
    updateItemCountersForAllGroupsMutate,
    updateItemCountMutate
} from '@components/widgets/Table/groupingHierarchy/utils/updateItemCountMutate'
import {
    EmptyNodeLevel,
    GroupingHierarchyCommonNode,
    GroupingHierarchyEmptyGroupNode,
    GroupingHierarchyGroupNode
} from '@components/widgets/Table/groupingHierarchy'
import { mergeEmptyGroupRowsWithOther } from '@components/widgets/Table/groupingHierarchy/utils/mergeEmptyGroupRowsWithOther'
import { IAggField, IAggLevel } from '@interfaces/groupingHierarchy'
import { countAggFieldValues, getAggFieldKeys, getTotalRow, updateAggFieldValuesPerLevel } from './aggregation'

export const createTree = <T extends CustomDataItem>(
    array: T[] = [] as T[],
    sortedGroupKeys: string[] = [],
    fieldsMeta: WidgetListField[],
    emptyNodes?: EmptyNodeLevel[] | null,
    sorters?: BcSorter[],
    filters?: BcFilter[],
    aggFields?: IAggField[],
    aggLevels?: IAggLevel[]
) => {
    type NodeType = T & GroupingHierarchyCommonNode
    type GroupNodeType = T & (GroupingHierarchyGroupNode | GroupingHierarchyEmptyGroupNode)

    const groupingHierarchyModeAggregate = !!(aggFields || aggLevels)
    const { aggFieldKeysForShow, aggFieldKeysForCount } = getAggFieldKeys(fieldsMeta, aggFields, aggLevels)
    const unallocatedRows: NodeType[] = []
    const tree: NodeType[] = []
    const groupsDictionary: Record<string, GroupNodeType> = {}
    // for easy access to a node using the cursor
    const nodeDictionary: Record<string, NodeType> = {}

    const { emptyNodes: emptyNodesList, defaultExtendedDictionary } = emptyNodes
        ? createEmptyGroupNodes(emptyNodes, sortedGroupKeys, filters)
        : {
              emptyNodes: [] as GroupNodeType[],
              defaultExtendedDictionary: undefined
          }
    const normalizedArray = mergeEmptyGroupRowsWithOther(array, emptyNodesList, sortedGroupKeys, sorters) as NodeType[]

    normalizedArray.forEach(item => {
        if (isUnallocatedRecord(item, sortedGroupKeys)) {
            unallocatedRows.push(item)
            nodeDictionary[item.id] = item

            return
        }
        // get a list of all groups to record
        const groupPaths = getGroupPaths(item, sortedGroupKeys, item?._emptyNodeLastLevel as number | undefined)

        const updateAggFieldValuesForAllGroups = (newAggGroup: NodeType, currentGroupLevel: number) => {
            for (let index = 0; index < currentGroupLevel; index++) {
                const currentAggGroupPath = groupPaths[index]
                const currentAggGroup = groupsDictionary[currentAggGroupPath]
                updateAggFieldValuesPerLevel(currentAggGroup, newAggGroup, aggFieldKeysForCount)
            }
        }

        // we check all groups, initialize missing ones, form a hierarchy
        for (let index = groupPaths.length - 1; index >= 0; index--) {
            const currentGroupPath = groupPaths[index]
            const currentGroup = groupsDictionary[currentGroupPath]
            const currentGroupLevel = index + 1
            const previousGroupPath = groupPaths[index + 1]
            const previousGroup = groupsDictionary[previousGroupPath]

            // creates the first group
            if (!currentGroup && !previousGroup) {
                groupsDictionary[currentGroupPath] = {
                    ...item,
                    ...(groupingHierarchyModeAggregate
                        ? {
                              id: currentGroupPath,
                              children: item._emptyNode
                                  ? []
                                  : [
                                        {
                                            ...item,
                                            _parentGroupPath: currentGroupPath
                                        }
                                    ]
                          }
                        : {
                              children: []
                          }),
                    _groupLevel: currentGroupLevel,
                    _groupPath: currentGroupPath,
                    _countOfRecordsPerLevel: { [currentGroupLevel]: item._emptyNode ? 0 : 1 },
                    _countOfGroupsAndRecordsPerLevel: { [currentGroupLevel]: item._emptyNode ? 0 : 1 }
                }

                if (groupingHierarchyModeAggregate) {
                    nodeDictionary[item.id] = {
                        ...item,
                        _parentGroupPath: currentGroupPath
                    }
                    nodeDictionary[currentGroupPath] = groupsDictionary[currentGroupPath]
                } else {
                    nodeDictionary[item.id] = groupsDictionary[currentGroupPath]
                }

                if (currentGroupLevel === 1) {
                    tree.push(groupsDictionary[currentGroupPath])
                }

                continue
            }
            // if necessary, changes the group path, generates a list of subtrees
            if (!currentGroup && previousGroup) {
                if (groupingHierarchyModeAggregate) {
                    groupsDictionary[currentGroupPath] = {
                        ...previousGroup,
                        _groupLevel: currentGroupLevel,
                        _groupPath: currentGroupPath,
                        id: currentGroupPath,
                        children: [previousGroup]
                    }
                } else {
                    previousGroup._groupLevel = currentGroupLevel
                    previousGroup._groupPath = currentGroupPath
                    groupsDictionary[currentGroupPath] = previousGroup // for combined groups we create additional links for convenience
                }

                updateItemCountMutate(
                    groupsDictionary[currentGroupPath],
                    currentGroupLevel,
                    groupsDictionary[currentGroupPath]?._emptyNode ? 0 : 1
                )
                updateItemCountMutate(groupsDictionary[currentGroupPath], currentGroupLevel, 1, 'groupAndRecords')

                if (currentGroupLevel === 1) {
                    tree.push(groupsDictionary[currentGroupPath])
                }

                continue
            }
            // if necessary, changes the group level, forms a hierarchy of groups
            if (currentGroup && previousGroup) {
                currentGroup.children?.push(previousGroup)

                if (groupingHierarchyModeAggregate) {
                    updateAggFieldValuesForAllGroups(previousGroup, currentGroupLevel)
                }

                updateItemCountersForAllGroupsMutate(groupPaths, groupsDictionary, currentGroupLevel, previousGroup?._emptyNode ? 0 : 1)
                updateItemCountMutate(currentGroup, currentGroupLevel, 1, 'groupAndRecords')

                break
            }
            // adding records to the level group
            if (currentGroup && !previousGroup) {
                const childNode = { ...item, _parentGroupPath: currentGroupPath }

                currentGroup.children?.push(childNode)

                if (groupingHierarchyModeAggregate) {
                    updateAggFieldValuesForAllGroups(item, currentGroupLevel)
                }

                updateItemCountersForAllGroupsMutate(groupPaths, groupsDictionary, currentGroupLevel)
                updateItemCountMutate(currentGroup, currentGroupLevel, 1, 'groupAndRecords')

                nodeDictionary[item.id] = childNode

                break
            }
        }
    })

    if (groupingHierarchyModeAggregate) {
        if ((aggFields || aggLevels?.find(item => item.level === 0)) && array.length) {
            const totalRow = getTotalRow(sortedGroupKeys[0], aggFieldKeysForCount, array) as NodeType
            countAggFieldValues(totalRow, aggFieldKeysForShow, aggFields, aggLevels)

            totalRow._groupLevel = 1
            tree.push(totalRow)
            nodeDictionary[totalRow.id] = totalRow
        }

        Object.keys(groupsDictionary).forEach(key => {
            countAggFieldValues(groupsDictionary[key], aggFieldKeysForShow, aggFields, aggLevels)
        })
    }

    return { tree: [...unallocatedRows, ...tree], nodeDictionary, groupsDictionary, defaultExtendedDictionary }
}
