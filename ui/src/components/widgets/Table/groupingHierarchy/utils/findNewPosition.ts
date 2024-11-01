import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { isUnallocatedRecord } from '@components/widgets/Table/groupingHierarchy/utils/isUnallocatedRecord'
import { getFieldValue } from '@components/widgets/Table/groupingHierarchy/utils/getFieldValue'

export const findNewPosition = (records: CustomDataItem[], newRecord: CustomDataItem | undefined, sortedGroupKeys: string[]) => {
    const startingIndexesMap: Record<string, number> = {}
    let lastUnallocatedIndex = -1

    records.findIndex((item, index) => {
        if (isUnallocatedRecord(item, sortedGroupKeys)) {
            lastUnallocatedIndex = index
        }

        if (item.id === newRecord?.id) {
            return false
        }

        let isNewPosition = false
        let i = 0

        do {
            const groupKey = sortedGroupKeys[i]
            const nextGroupValue = getFieldValue(groupKey, newRecord)
            const currentValue = getFieldValue(groupKey, item)
            const groupValuesAreEqual = currentValue === nextGroupValue

            isNewPosition = i === 0 ? groupValuesAreEqual : isNewPosition && groupValuesAreEqual

            if (isNewPosition && !startingIndexesMap[groupKey]) {
                startingIndexesMap[groupKey] = index
            }

            i = i + 1
        } while (sortedGroupKeys[i] && isNewPosition)

        return isNewPosition
    })

    let newPosition = startingIndexesMap[sortedGroupKeys.findLast(key => startingIndexesMap[key]) as string] ?? -1

    // needed to position the element before the found group
    newPosition = newPosition !== -1 && newPosition !== 0 ? newPosition - 1 : newPosition

    return newPosition !== -1 ? newPosition : lastUnallocatedIndex ?? -1
}
