import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { changeOrderWithMutate } from '@utils/changeOrderWithMutate'
import { isUnallocatedRecord } from '@components/widgets/Table/groupingHierarchy/utils/isUnallocatedRecord'
import { findNewPosition } from '@components/widgets/Table/groupingHierarchy/utils/findNewPosition'

export const changeRecordPositionMutate = (records: CustomDataItem[], record: CustomDataItem, sortedGroupKeys: string[]) => {
    const newRecord = record ? record : undefined
    const oldIndex = records.findIndex(item => item.id === newRecord?.id)

    if (!isUnallocatedRecord(newRecord, sortedGroupKeys)) {
        const newIndex = findNewPosition(records, newRecord, sortedGroupKeys)

        if (newIndex !== -1) {
            changeOrderWithMutate(records, oldIndex, newIndex)
        }
    }
}
