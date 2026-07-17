import { BcFilter, BcMeta, utils } from '@cxbox-ui/core'

export const getBcDefaultFilters = (bc?: BcMeta): BcFilter[] => {
    if (bc?.defaultFilter?.length) {
        return utils.parseFilters(bc.defaultFilter) ?? []
    }

    const defaultFilterGroup = bc?.filterGroups?.find(group => (group as typeof group & { defaultFilter?: boolean }).defaultFilter)
    return utils.parseFilters(defaultFilterGroup?.filters) ?? []
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
