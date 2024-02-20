import { interfaces } from '@cxbox-ui/core'

export interface FilterGroup extends interfaces.FilterGroup {
    name: string
    filters: string
    id?: string
    personal?: boolean
    bc?: string
}

export enum FilterType {
    /**
     * Transforms into combination of 'greaterOrEqualThan' and 'lessOrEqualThan' (See src/utils/filters.ts)
     */
    range = 'range',
    equals = 'equals',
    greaterThan = 'greaterThan',
    lessThan = 'lessThan',
    greaterOrEqualThan = 'greaterOrEqualThan',
    lessOrEqualThan = 'lessOrEqualThan',
    contains = 'contains',
    specified = 'specified',
    specifiedBooleanSql = 'specifiedBooleanSql',
    equalsOneOf = 'equalsOneOf',
    containsOneOf = 'containsOneOf'
}
