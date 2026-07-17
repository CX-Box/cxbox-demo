import { BcFilter, BcMeta, FilterType, utils } from '@cxbox-ui/core'
import { FIELDS } from '@constants'

export const DEFAULT_ASSOC_ID_FILTER_PARAMS = {
    type: FilterType.equalsOneOf,
    fieldName: FIELDS.TECHNICAL.ID
} as const

export const getResetFilterTitleKey = (params: { hasDefaultFilters: boolean; hasSelectedRowsFilter: boolean }): string => {
    const { hasDefaultFilters, hasSelectedRowsFilter } = params
    if (hasDefaultFilters && hasSelectedRowsFilter) {
        return 'To default and selected rows filter(s)'
    }
    if (hasDefaultFilters) {
        return 'To default filter(s)'
    }
    if (hasSelectedRowsFilter) {
        return 'To selected rows filter(s)'
    }
    return 'Reset filter(s)'
}

export const getBcDefaultFilters = (bc?: BcMeta): BcFilter[] => {
    if (bc?.defaultFilter?.length) {
        return utils.parseFilters(bc.defaultFilter) ?? []
    }

    const defaultFilterGroup = bc?.filterGroups?.find(group => (group as typeof group & { defaultFilter?: boolean }).defaultFilter)
    return utils.parseFilters(defaultFilterGroup?.filters) ?? []
}

export const getBcDefaultFilterGroupName = (bc?: BcMeta): string | null => {
    if (bc?.defaultFilter?.length) {
        return null
    }

    const defaultFilterGroup = bc?.filterGroups?.find(group => (group as typeof group & { defaultFilter?: boolean }).defaultFilter)
    return defaultFilterGroup?.name ?? null
}

export const mergeFilters = (filters: BcFilter[], secondFilters?: BcFilter[]): BcFilter[] => {
    if (secondFilters?.length) {
        const secondFilterFiledNames = new Set(secondFilters.map(filter => filter.fieldName))
        return [...filters.filter(filter => !secondFilterFiledNames.has(filter.fieldName)), ...secondFilters]
    }

    return filters
}

export const areFiltersEqual = (left: BcFilter[] = [], right: BcFilter[] = []) => {
    const normalize = (filters: BcFilter[]) =>
        Object.entries(utils.getFilters(filters) ?? {})
            .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
            .map(([key, value]) => [key, value])

    return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))
}
