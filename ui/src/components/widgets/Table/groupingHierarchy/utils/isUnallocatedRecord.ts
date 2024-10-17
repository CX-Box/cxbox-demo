import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { isExistRecordItem } from '@components/widgets/Table/groupingHierarchy/utils/isExistRecordItem'

export const isUnallocatedRecord = (record: CustomDataItem | undefined, sortedGroupKeys: string[] = []) => {
    return (
        sortedGroupKeys.some(key => {
            // eslint-disable-next-line eqeqeq
            return !isExistRecordItem(record?.[key])
        }) && !record?._emptyNode
    )
}
