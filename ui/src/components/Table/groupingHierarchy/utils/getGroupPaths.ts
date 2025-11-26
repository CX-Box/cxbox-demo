import { CustomDataItem } from '@components/Table/Table.interfaces'
import { isUnallocatedRecord } from '@components/Table/groupingHierarchy/utils/isUnallocatedRecord'
import { getFieldValue } from '@components/Table/groupingHierarchy/utils/getFieldValue'
import { formGroupPath } from '@components/Table/groupingHierarchy/utils/formGroupPath'

export const getGroupPaths = (record: CustomDataItem, sortedGroupKeys: string[], level?: number) => {
    const groupKeys = typeof level === 'number' ? sortedGroupKeys.slice(0, level) : sortedGroupKeys
    const groupPaths: string[] = []

    if (isUnallocatedRecord(record, groupKeys)) {
        return groupPaths
    }

    groupKeys.reduce<string[]>((acc, groupKey, currentIndex, array) => {
        const groupPathPart = getFieldValue(groupKey, record)

        if (groupPathPart) {
            acc.push(groupPathPart)

            groupPaths.push(formGroupPath(acc))
        }

        return acc
    }, [])

    return groupPaths
}
