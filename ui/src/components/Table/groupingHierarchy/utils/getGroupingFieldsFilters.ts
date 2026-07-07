import { BcFilter } from '@cxbox-ui/core'

export const getGroupingFieldsFilters = (filters: BcFilter[], sortedGroupKeys: string[] = []) => {
    return filters.filter(filter => sortedGroupKeys.includes(filter.fieldName))
}
