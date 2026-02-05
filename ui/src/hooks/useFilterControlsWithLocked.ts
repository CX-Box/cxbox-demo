import { useAppSelector } from '@store'
import { useCallback, useMemo } from 'react'
import { selectBcFilters } from '@selectors/selectors'
import { useFilterControls } from '@hooks/useFilterControls'
import { filterByConditions } from '@utils/filterByConditions'
import { BcFilter, utils } from '@cxbox-ui/core'

export const useFilterControlsWithLocked = (bcName: string = '', lockedFieldNames?: string[]) => {
    const bcFilters = useAppSelector(selectBcFilters(bcName))
    const { addFilter, deleteAllFilters, forceUpdate } = useFilterControls(bcName)

    const [lockedFilters, userFilters] = useMemo(
        () =>
            lockedFieldNames
                ? filterByConditions<BcFilter>(bcFilters ?? [], [filter => lockedFieldNames.includes(filter.fieldName)])
                : [[], bcFilters],
        [bcFilters, lockedFieldNames]
    )

    const filtersCount = userFilters?.length ?? 0
    const filtersExist = filtersCount > 0

    const clearAllFilters = useCallback(() => {
        deleteAllFilters({ update: false })
        lockedFilters.forEach(filter => addFilter(filter, { update: false }))
        forceUpdate()
    }, [addFilter, deleteAllFilters, forceUpdate, lockedFilters])

    const applyFilters = useCallback(
        (filters: BcFilter[] | string) => {
            const parsedFilters = typeof filters === 'string' ? utils.parseFilters(filters) : filters
            const newUserFilters = parsedFilters.filter(filter => !lockedFieldNames?.includes(filter.fieldName))

            deleteAllFilters({ update: false })
            lockedFilters.forEach(filter => addFilter(filter, { update: false }))
            newUserFilters.forEach(filter => addFilter(filter, { update: false }))
            forceUpdate()

            return lockedFilters
        },
        [addFilter, deleteAllFilters, forceUpdate, lockedFieldNames, lockedFilters]
    )

    return {
        showClearButton: filtersExist,
        appliedFiltersCount: filtersCount,
        applyFilters,
        clearAllFilters
    }
}
