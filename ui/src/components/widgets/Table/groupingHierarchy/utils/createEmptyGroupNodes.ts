import { formGroupPathFromRecord } from '@components/widgets/Table/groupingHierarchy/utils/formGroupPathFromRecord'
import { getPreviousLevelPath } from '@components/widgets/Table/groupingHierarchy/utils/getPreviousLevelPath'
import { EmptyNodeLevel, GroupingHierarchyEmptyGroupNode } from '@components/widgets/Table/groupingHierarchy'
import { preorderDfsTreeTraversal } from '@components/ViewNavigation/tab/standard/utils/preorderDfsTreeTraversal'
import { BcFilter } from '@cxbox-ui/core'
import { validateValueByFilter } from '@components/widgets/Table/groupingHierarchy/utils/validateValueByFilter'

// It was decided to create empty groups at the front
export const createEmptyGroupNodes = <T extends Record<string, any>>(
    emptyNodes: EmptyNodeLevel[],
    sortedGroupKeys: string[] = [],
    filters?: BcFilter[]
) => {
    const result: Record<string, GroupingHierarchyEmptyGroupNode & T> = {}
    const temporaryMapKeyToValue: Record<string, string> = {}
    const defaultExtendedDictionary: Record<string, boolean> = {}

    emptyNodes.forEach(emptyNode => {
        preorderDfsTreeTraversal(emptyNode, (node, currentLevel) => {
            const emptyNodeKey = sortedGroupKeys[currentLevel - 1]
            const filterForNode = filters?.find(filter => filter.fieldName === emptyNodeKey)
            const previousNodeValue = result[formGroupPathFromRecord(temporaryMapKeyToValue, sortedGroupKeys, currentLevel - 1)]
            const validatedNode = filters?.length
                ? (previousNodeValue || currentLevel === 1) && validateValueByFilter(filterForNode?.type, filterForNode?.value, node.value)
                : true

            if ('value' in node && validatedNode) {
                sortedGroupKeys.slice(currentLevel).forEach((key, index) => delete temporaryMapKeyToValue[key])

                const item = {
                    ...temporaryMapKeyToValue,
                    [emptyNodeKey]: node.value,
                    _emptyNode: true,
                    _emptyNodeLastLevel: currentLevel,
                    vstamp: 0
                } as GroupingHierarchyEmptyGroupNode & T

                temporaryMapKeyToValue[emptyNodeKey] = node.value

                if (typeof node?.defaultExpanded === 'boolean') {
                    defaultExtendedDictionary[formGroupPathFromRecord(temporaryMapKeyToValue, sortedGroupKeys, currentLevel)] =
                        node?.defaultExpanded
                }

                const groupPath = formGroupPathFromRecord(item, sortedGroupKeys, currentLevel)

                item.id = groupPath
                item._groupPath = groupPath

                result[groupPath] = item

                const previousGroupPath = getPreviousLevelPath(groupPath, currentLevel)
                previousGroupPath && delete result[previousGroupPath]
            }
        })
    })

    return { emptyNodes: Object.values(result), defaultExtendedDictionary }
}
