import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { BcFilter } from '@cxbox-ui/core'
import { actions } from '@actions'

export function useFilterControls(bcName: string) {
    const dispatch = useDispatch()

    const addFilter = useCallback(
        (filter: BcFilter, options?: { update: boolean }) => {
            dispatch(actions.bcAddFilter({ bcName, filter }))
            if (options?.update) {
                dispatch(actions.bcForceUpdate({ bcName }))
            }
        },
        [bcName, dispatch]
    )

    const deleteFilter = useCallback(
        (filter: PartialExcept<BcFilter, 'fieldName' | 'type'>, options?: { update: boolean }) => {
            dispatch(actions.bcRemoveFilter({ bcName, filter: filter as BcFilter }))
            if (options?.update) {
                dispatch(actions.bcForceUpdate({ bcName }))
            }
        },
        [bcName, dispatch]
    )

    const deleteAllFilters = useCallback(
        (options?: { update: boolean }) => {
            dispatch(actions.bcRemoveAllFilters({ bcName }))
            if (options?.update) {
                dispatch(actions.bcForceUpdate({ bcName }))
            }
        },
        [bcName, dispatch]
    )

    const forceUpdate = useCallback(() => {
        dispatch(actions.bcForceUpdate({ bcName }))
    }, [bcName, dispatch])

    return {
        addFilter,
        deleteFilter,
        deleteAllFilters,
        forceUpdate
    }
}
