import moment from 'moment/moment'
import { FilterType } from '@interfaces/filters'

export const validateValueByFilter = (filterType: string | undefined, filterValue: unknown | unknown[], value: unknown) => {
    let dateValue: ReturnType<typeof moment> | undefined
    let filterValues: string[] | number[] | undefined

    if (filterType === null || filterType === undefined) {
        return true
    }

    switch (filterType) {
        case FilterType.contains:
            if (typeof filterValue === 'string' && typeof value === 'string') {
                return filterValue.includes(value)
            }

            return false
        case FilterType.equalsOneOf:
            filterValues = filterValue as string[]

            if (Array.isArray(filterValues) && typeof value === 'string') {
                return filterValues.some(filterValue => filterValue === value)
            }

            return false
        case FilterType.containsOneOf:
            filterValues = filterValue as string[]

            if (Array.isArray(filterValues) && typeof value === 'string') {
                return filterValues.some(filterValue => filterValue.includes(value))
            }

            return false
        case FilterType.specified:
        case FilterType.equals:
            return filterValue === value
        case FilterType.greaterOrEqualThan:
        case FilterType.lessOrEqualThan:
        case FilterType.greaterThan:
        case FilterType.lessThan:
            dateValue = moment(value as string | undefined | null)
            const filterDateValue = moment(filterValue as string | undefined | null)
            const isFilterByDate = filterDateValue.isValid() && dateValue.isValid()

            if (isFilterByDate) {
                if (FilterType.greaterOrEqualThan === filterType) {
                    return dateValue.isSameOrAfter(filterDateValue)
                }

                if (FilterType.lessOrEqualThan === filterType) {
                    return dateValue.isSameOrBefore(filterDateValue)
                }

                if (FilterType.greaterThan === filterType) {
                    return dateValue.isAfter(filterDateValue)
                }

                if (FilterType.lessThan === filterType) {
                    return dateValue.isBefore(filterDateValue)
                }
            }

            if (FilterType.greaterOrEqualThan === filterType) {
                return dateValue >= filterDateValue
            }

            if (FilterType.lessOrEqualThan === filterType) {
                return dateValue <= filterDateValue
            }

            if (FilterType.greaterThan === filterType) {
                return dateValue > filterDateValue
            }

            if (FilterType.lessThan === filterType) {
                return dateValue < filterDateValue
            }

            return false
        case FilterType.range:
            dateValue = moment(value as string | undefined | null)
            const filterDateValues = Array.isArray(value)
                ? (value as string[]).map(value => moment(value as string | undefined | null))
                : undefined

            if (filterDateValues?.every(filterDateValue => filterDateValue.isValid()) && dateValue.isValid()) {
                return dateValue.isSameOrAfter(filterDateValues[0]) && dateValue.isSameOrBefore(filterDateValues[1])
            }

            const simpleValue = value as string | number
            filterValues = Array.isArray(value) ? (value as number[] | string[]) : undefined

            return Array.isArray(filterValues) && simpleValue >= filterValues[0] && simpleValue <= filterValues[1]
        default:
            return false
    }
}
