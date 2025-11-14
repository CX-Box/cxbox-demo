import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { BcFilter } from '@cxbox-ui/core'
import { actions } from '@actions'
import { useAppSelector } from '@store'
import { selectBcFilters } from '@selectors/selectors'
import { FilterType } from '@interfaces/filters'
import { isDefined } from '@utils/isDefined'

export const useCleanOldRangeFilters = (bcName: string | undefined) => {
    const filters = useAppSelector(selectBcFilters(bcName))

    const dispatch = useDispatch()

    return useCallback(
        (newFilter: BcFilter) => {
            // Removes filters that range converts to
            if (bcName && newFilter.type === FilterType.range && filters?.length) {
                filters.forEach(oldFilter => {
                    if (
                        isDefined(oldFilter) &&
                        oldFilter.fieldName === newFilter.fieldName &&
                        (oldFilter.type === FilterType.greaterOrEqualThan || oldFilter.type === FilterType.lessOrEqualThan)
                    ) {
                        dispatch(actions.bcRemoveFilter({ bcName, filter: oldFilter }))
                    }
                })
            }
        },
        [bcName, dispatch, filters]
    )
}
