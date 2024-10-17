import { formGroupPath } from '@components/widgets/Table/groupingHierarchy/utils/formGroupPath'
import { getFieldValue } from '@components/widgets/Table/groupingHierarchy/utils/getFieldValue'

const mapGroupKeysToFieldValues = (record: Record<string, any>, sortedGroupKeys: string[]) =>
    sortedGroupKeys.map(sortedGroupKey => getFieldValue(sortedGroupKey, record))

export const formGroupPathFromRecord = (record: Record<string, any>, sortedGroupKeys: string[], level?: number) => {
    const groupKeys = typeof level === 'number' ? sortedGroupKeys.slice(0, level) : sortedGroupKeys

    return formGroupPath(mapGroupKeysToFieldValues(record, groupKeys))
}
