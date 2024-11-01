import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { BcSorter } from '@cxbox-ui/core'
import { createEmptyGroupNodes } from '@components/widgets/Table/groupingHierarchy/utils/createEmptyGroupNodes'
import { isUnallocatedRecord } from '@components/widgets/Table/groupingHierarchy/utils/isUnallocatedRecord'
import { getGroupPaths } from '@components/widgets/Table/groupingHierarchy/utils/getGroupPaths'
import { updateGroupCountMutate } from '@components/widgets/Table/groupingHierarchy/utils/updateGroupCountMutate'
import {
    EmptyNodeLevel,
    GroupingHierarchyCommonNode,
    GroupingHierarchyEmptyGroupNode,
    GroupingHierarchyGroupNode
} from '@components/widgets/Table/groupingHierarchy'
import { mergeEmptyGroupRowsWithOther } from '@components/widgets/Table/groupingHierarchy/utils/mergeEmptyGroupRowsWithOther'

export const createTree = <T extends CustomDataItem>(
    array: T[] = [] as T[],
    sortedGroupKeys: string[] = [],
    emptyNodes?: EmptyNodeLevel[] | null,
    sorters?: BcSorter[]
) => {
    type NodeType = T & GroupingHierarchyCommonNode
    type GroupNodeType = T & (GroupingHierarchyGroupNode | GroupingHierarchyEmptyGroupNode)

    const unallocatedRows: NodeType[] = []
    const tree: NodeType[] = []
    const groupsDictionary: Record<string, GroupNodeType> = {}
    // for easy access to a node using the cursor
    const nodeDictionary: Record<string, NodeType> = {}

    const emptyNodesList = (emptyNodes ? createEmptyGroupNodes(emptyNodes, sortedGroupKeys) : []) as GroupNodeType[]
    const normalizedArray = mergeEmptyGroupRowsWithOther(array, emptyNodesList, sortedGroupKeys, sorters) as NodeType[]

    normalizedArray.forEach(item => {
        if (isUnallocatedRecord(item, sortedGroupKeys)) {
            unallocatedRows.push(item)
            nodeDictionary[item.id] = item

            return
        }
        // get a list of all groups to record
        const groupPaths = getGroupPaths(item, sortedGroupKeys, item?._emptyNodeLastLevel as number | undefined)

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
                    _groupLevel: currentGroupLevel,
                    children: [],
                    _groupPath: currentGroupPath,
                    _countOfRecordsPerLevel: { [currentGroupLevel]: item._emptyNode ? 0 : 1 }
                }
                nodeDictionary[item.id] = groupsDictionary[currentGroupPath]

                if (currentGroupLevel === 1) {
                    tree.push(groupsDictionary[currentGroupPath])
                }

                continue
            }
            // if necessary, changes the group path, generates a list of subtrees
            if (!currentGroup && previousGroup) {
                previousGroup._groupLevel = currentGroupLevel
                previousGroup._groupPath = currentGroupPath
                groupsDictionary[currentGroupPath] = previousGroup // for combined groups we create additional links for convenience

                if (!groupsDictionary[currentGroupPath]?._emptyNode) {
                    updateGroupCountMutate(groupsDictionary[currentGroupPath], currentGroupLevel)
                }

                if (currentGroupLevel === 1) {
                    tree.push(groupsDictionary[currentGroupPath])
                }

                continue
            }
            // if necessary, changes the group level, forms a hierarchy of groups
            if (currentGroup && previousGroup) {
                currentGroup.children?.push(previousGroup)
                if (!previousGroup?._emptyNode) {
                    updateGroupCountMutate(currentGroup, currentGroupLevel)
                }

                break
            }
            // adding records to the level group
            if (currentGroup && !previousGroup) {
                const childNode = { ...item, _parentGroupPath: currentGroupPath }

                currentGroup.children?.push(childNode)

                updateGroupCountMutate(currentGroup, currentGroupLevel)
                nodeDictionary[item.id] = childNode

                break
            }
        }
    })

    return { tree: [...unallocatedRows, ...tree], nodeDictionary, groupsDictionary }
}
