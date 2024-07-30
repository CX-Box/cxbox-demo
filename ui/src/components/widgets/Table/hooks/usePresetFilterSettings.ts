import { utils } from '@cxbox-ui/core'
import { useCallback, useMemo } from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import qs from 'query-string'
import { useAppSelector } from '@store'
import { BcFilter } from '@interfaces/core'
import { actions } from '@actions'

export function usePresetFilterSettings(bcName: string) {
    const { filterGroups, filters } = useAppSelector(state => {
        const bc = bcName ? state.screen.bo.bc[bcName] : undefined

        return { filterGroups: bc?.filterGroups, filters: state.screen.filters[bcName] }
    }, shallowEqual)

    const dispatch = useDispatch()

    const applyFilter = useCallback(
        (bcName: string, filter: BcFilter, widgetName?: string) => {
            dispatch(actions.bcAddFilter({ bcName, filter, widgetName }))
        },
        [dispatch]
    )

    const removeFilter = useCallback(
        (bcName: string) => {
            dispatch(actions.bcRemoveAllFilters({ bcName }))
        },
        [dispatch]
    )

    const forceUpdate = useCallback(
        (bcName: string) => {
            dispatch(actions.bcForceUpdate({ bcName }))
        },
        [dispatch]
    )

    const applyFilterGroup = useMemo(() => {
        return (value: string) => {
            const filterGroup = filterGroups?.find(item => item.name === value)
            const parsedFilters = filterGroup?.filters ? utils.parseFilters(filterGroup?.filters) : []

            removeFilter(bcName)

            parsedFilters.forEach(item => applyFilter(bcName, item))

            forceUpdate(bcName)
        }
    }, [filterGroups, removeFilter, bcName, forceUpdate, applyFilter])

    const cleanAllFilters = useCallback(() => {
        removeFilter(bcName)
        forceUpdate(bcName)
    }, [bcName, forceUpdate, removeFilter])

    const currentFilters = useMemo(() => qs.stringify({ ...utils.getFilters(filters || []) }, { encode: true }), [filters])

    const saveCurrentFiltersAsGroup = useCallback(
        (name: string) => {
            const filterGroup = {
                filters: currentFilters,
                name,
                bc: bcName
            }

            dispatch(actions.addFilterGroup(filterGroup))
        },
        [bcName, dispatch, currentFilters]
    )

    const removeFilterGroup = useCallback(
        (name: string, id: string) => {
            dispatch(actions.removeFilterGroup({ name, bc: bcName, id }))
        },
        [bcName, dispatch]
    )

    return {
        currentFilters,
        filterGroups,
        filtersExist: !!filters?.length,
        applyFilterGroup,
        cleanAllFilters,
        saveCurrentFiltersAsGroup,
        removeFilterGroup
    }
}
