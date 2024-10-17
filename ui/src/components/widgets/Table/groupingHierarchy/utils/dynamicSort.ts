import { BcSorter } from '@cxbox-ui/core'
import { isExistRecordItem } from '@components/widgets/Table/groupingHierarchy/utils/isExistRecordItem'
import { getFieldValue } from '@components/widgets/Table/groupingHierarchy/utils/getFieldValue'

export const dynamicSort = <T extends Record<string, any>>(fields: BcSorter[]) => {
    return (a: T, b: T) => {
        for (let i = 0; i < fields.length; i++) {
            const { fieldName, direction } = fields[i]
            if (a[fieldName] !== b[fieldName]) {
                const valuesTypes = [typeof a[fieldName], typeof b[fieldName]]
                if (valuesTypes.includes('string') || !isExistRecordItem(a[fieldName]) || !isExistRecordItem(b[fieldName])) {
                    const aValue = String(getFieldValue(fieldName, a) ?? '')
                    const bValue = String(getFieldValue(fieldName, b) ?? '')

                    return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
                }

                if (valuesTypes.includes('number')) {
                    const aValue = getFieldValue(fieldName, a) || 0
                    const bValue = getFieldValue(fieldName, b) || 0
                    return direction === 'asc' ? aValue - bValue : bValue - aValue
                }
            }
        }

        return 0
    }
}
