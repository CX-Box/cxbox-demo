import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { GroupingHierarchyEmptyGroupNode, GroupingHierarchyGroupNode } from '@components/widgets/Table/groupingHierarchy'
import { BcSorter } from '@cxbox-ui/core'
import { isUnallocatedRecord } from '@components/widgets/Table/groupingHierarchy/utils/isUnallocatedRecord'
import { formGroupPathFromRecord } from '@components/widgets/Table/groupingHierarchy/utils/formGroupPathFromRecord'
import { dynamicSort } from '@components/widgets/Table/groupingHierarchy/utils/dynamicSort'

export const mergeEmptyGroupRowsWithOther = <T extends CustomDataItem>(
    records: T[],
    emptyNodesList: (GroupingHierarchyGroupNode | GroupingHierarchyEmptyGroupNode)[],
    sortedGroupKeys: string[] = [],
    sorters?: BcSorter[]
) => {
    const resultRecords = [...records]
    const resultEmptyNodesList = [...emptyNodesList]

    for (let index = 0; index < resultRecords.length; index++) {
        const record = resultRecords[index]

        const emptyNodesListIndex = resultEmptyNodesList.findIndex((emptyNode, index) => {
            return (
                !isUnallocatedRecord(record, sortedGroupKeys) &&
                formGroupPathFromRecord(emptyNode, sortedGroupKeys, emptyNode._emptyNodeLastLevel as number | undefined) ===
                    formGroupPathFromRecord(record, sortedGroupKeys, emptyNode._emptyNodeLastLevel as number | undefined)
            )
        })

        if (emptyNodesListIndex >= 0) {
            resultEmptyNodesList.splice(emptyNodesListIndex, 1)
            resultRecords[index] = { ...resultRecords[index], _groupOptions: null }
        }

        if (resultEmptyNodesList.length === 0) {
            break
        }
    }

    const result = [...resultRecords, ...resultEmptyNodesList]

    if (sorters) {
        // sort for correct display of the combined parent group
        result.sort(dynamicSort(sorters))
    }

    return result
}
