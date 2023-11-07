import { interfaces } from '@cxbox-ui/core'

const EMPTY_OBJECT = {}
const normalizeFilterValue = (value: unknown) => {
    return typeof value === 'string' ? value : JSON.stringify(value)
}

const { FilterType } = interfaces
export const convertFiltersIntoObject = (filters?: interfaces.BcFilter[]) => {
    return (
        filters?.reduce((filtersObj: Record<string, any>, filter) => {
            // TODO remove this (if), when the back will support range
            if (filter.type === FilterType.range && Array.isArray(filter.value)) {
                filtersObj[`${filter.fieldName}.${FilterType.greaterOrEqualThan}`] = normalizeFilterValue(filter.value[0])
                filtersObj[`${filter.fieldName}.${FilterType.lessOrEqualThan}`] = normalizeFilterValue(filter.value[1])
            } else {
                filtersObj[`${filter.fieldName}.${filter.type}`] = normalizeFilterValue(filter.value)
            }

            return filtersObj
        }, {}) || EMPTY_OBJECT
    )
}
