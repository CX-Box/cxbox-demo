import { formGroupPathFromRecord } from '@components/widgets/Table/groupingHierarchy/utils/formGroupPathFromRecord'
import { getPreviousLevelPath } from '@components/widgets/Table/groupingHierarchy/utils/getPreviousLevelPath'
import { EmptyNodeLevel, GroupingHierarchyEmptyGroupNode } from '@components/widgets/Table/groupingHierarchy'
import { preorderDfsTreeTraversal } from '@components/ViewNavigation/tab/standard/utils/preorderDfsTreeTraversal'

// It was decided to create empty groups at the front
export const createEmptyGroupNodes = <T extends Record<string, any>>(emptyNodes: EmptyNodeLevel[], sortedGroupKeys: string[] = []) => {
    const result: Record<string, GroupingHierarchyEmptyGroupNode & T> = {}
    const temporaryMapKeyToValue: Record<string, string> = {}

    emptyNodes.forEach(emptyNode => {
        preorderDfsTreeTraversal(emptyNode, (node, currentLevel) => {
            if ('value' in node) {
                const emptyNodeKey = sortedGroupKeys[currentLevel - 1]

                sortedGroupKeys.slice(currentLevel).forEach(key => delete temporaryMapKeyToValue[key])

                const item = {
                    ...temporaryMapKeyToValue,
                    [emptyNodeKey]: node.value,
                    _emptyNode: true,
                    _emptyNodeLastLevel: currentLevel,
                    vstamp: 0
                } as GroupingHierarchyEmptyGroupNode & T

                temporaryMapKeyToValue[emptyNodeKey] = node.value

                const groupPath = formGroupPathFromRecord(item, sortedGroupKeys, currentLevel)

                item.id = groupPath
                item._groupPath = groupPath

                result[groupPath] = item

                const previousGroupPath = getPreviousLevelPath(groupPath, currentLevel)
                previousGroupPath && delete result[previousGroupPath]
            }
        })
    })

    return Object.values(result)
}
