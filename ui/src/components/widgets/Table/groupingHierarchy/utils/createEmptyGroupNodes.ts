import { dfsEmptyGroupStructureTraversal } from '@components/widgets/Table/groupingHierarchy/utils/dfsEmptyGroupStructureTraversal'
import { formGroupPathFromRecord } from '@components/widgets/Table/groupingHierarchy/utils/formGroupPathFromRecord'
import { getPreviousLevelPath } from '@components/widgets/Table/groupingHierarchy/utils/getPreviousLevelPath'
import { EmptyNodesStructureNode, GroupingHierarchyEmptyGroupNode } from '@components/widgets/Table/groupingHierarchy'

// It was decided to create empty groups at the front
export const createEmptyGroupNodes = <T extends Record<string, any>>(
    emptyNode: EmptyNodesStructureNode,
    sortedGroupKeys: string[] = []
) => {
    const result: Record<string, GroupingHierarchyEmptyGroupNode & T> = {}
    const temporaryMapKeyToValue: Record<string, string> = {}

    dfsEmptyGroupStructureTraversal(emptyNode, null, (emptyNodeKey, emptyNode, parentNodeValue) => {
        if ('value' in emptyNode) {
            const currentLevel = sortedGroupKeys.findIndex(key => key === emptyNodeKey) + 1
            sortedGroupKeys.slice(currentLevel).forEach(key => delete temporaryMapKeyToValue[key])

            const item = {
                ...temporaryMapKeyToValue,
                [emptyNodeKey]: emptyNode.value,
                _emptyNode: true,
                _emptyNodeLastLevel: currentLevel,
                vstamp: 0
            } as GroupingHierarchyEmptyGroupNode & T

            temporaryMapKeyToValue[emptyNodeKey] = emptyNode.value

            const groupPath = formGroupPathFromRecord(item, sortedGroupKeys, currentLevel)

            item.id = groupPath
            item._groupPath = groupPath

            result[groupPath] = item

            const previousGroupPath = getPreviousLevelPath(groupPath, currentLevel)
            previousGroupPath && delete result[previousGroupPath]
        }
    })

    return Object.values(result)
}
