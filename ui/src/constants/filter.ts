import { FilterType } from '@interfaces/filters'

export const checkboxFilterMaxVisibleItems = 7
export const checkboxFilterCounterLimit = 9

// filters that are used to set the range
const rangeFilterTypes = [FilterType.range, FilterType.lessOrEqualThan, FilterType.greaterOrEqualThan]

export const isRangeFilterType = (filterType: string) => {
    return rangeFilterTypes.some(type => type === filterType)
}
