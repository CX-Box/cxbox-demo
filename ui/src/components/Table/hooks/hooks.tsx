import { useAppSelector } from '@store'
import { shallowEqual, useDispatch } from 'react-redux'
import { useCallback, useEffect, useState } from 'react'
import { actions } from '@actions'
import { utils, WidgetMeta } from '@cxbox-ui/core'
import { FIELDS } from '@constants'

function useFiltersGroupName<T>(filtersExist: boolean) {
    const [filterGroupName, setFilterGroupName] = useState<T | null>(null)

    useEffect(() => {
        if (!filtersExist) {
            setFilterGroupName(null)
        }
    }, [filtersExist])

    return { filterGroupName, setFilterGroupName }
}

export const useFilterGroups = (meta?: WidgetMeta) => {
    const { bcName = '', name: widgetName = '' } = meta || {}
    const { filtersExist, filterGroupsExist, filterGroups, filtersCount } = useAppSelector(state => {
        const bc = bcName ? state.screen.bo.bc[bcName] : undefined
        const bcFilters = bcName ? state.screen.filters[bcName] : undefined
        const enabledMassMode = state.screen.viewerMode[bcName]?.mode === 'mass'
        const resultFilterEnabled = !!state.screen.viewerMode[bcName]?.resultFilterEnabled
        const defaultFiltersExist = !!bcFilters?.length
        const filterById = bcFilters?.find(filter => filter.fieldName === FIELDS.TECHNICAL.ID)
        const selectedRows = state.view.selectedRows[bcName]
        const filtersLength = bcFilters?.length ?? 0
        const massModeFiltersExist =
            !!bcFilters?.length &&
            (bcFilters.length > 1 || !filterById || (Array.isArray(filterById.value) && !!selectedRows?.length && resultFilterEnabled))

        return {
            cursor: bc?.cursor,
            filterGroups: bc?.filterGroups,
            filterGroupsExist: !!bc?.filterGroups?.length,
            filtersExist: enabledMassMode ? massModeFiltersExist : defaultFiltersExist,
            filtersCount: enabledMassMode && filterById && !resultFilterEnabled ? filtersLength - 1 : filtersLength
        }
    }, shallowEqual)

    const { filterGroupName, setFilterGroupName } = useFiltersGroupName<string>(filtersExist)

    const dispatch = useDispatch()

    const clearAllFilters = useCallback(() => {
        dispatch(actions.bcRemoveAllFilters({ bcName }))
        dispatch(actions.bcForceUpdate({ bcName }))
    }, [dispatch, bcName])

    const applyFilterGroup = useCallback(
        (value: string) => {
            const filterGroup = filterGroups?.find(item => item.name === value)
            const parsedFilters = utils.parseFilters(filterGroup?.filters)

            setFilterGroupName(filterGroup?.name ?? null)
            dispatch(actions.bcRemoveAllFilters({ bcName }))
            parsedFilters.forEach(filter => dispatch(actions.bcAddFilter({ bcName, filter, widgetName })))
            dispatch(actions.bcForceUpdate({ bcName }))
        },
        [bcName, dispatch, filterGroups, setFilterGroupName, widgetName]
    )

    return {
        showFilterGroups: filterGroupsExist,
        showClearButton: filtersExist,
        applyFilterGroup,
        clearAllFilters,
        filterGroups,
        appliedFiltersCount: filtersCount,
        appliedFilterGroup: filterGroupName
    }
}

export const useTableShowAllRecords = (bcName: string) => {
    const cursor = useAppSelector(state => {
        const bc = bcName ? state.screen.bo.bc[bcName] : undefined

        return bc?.cursor
    })
    const limitBySelf = useAppSelector(state => {
        return cursor ? !!state.router.bcPath?.includes(`${bcName}/${cursor}`) : false
    })

    const dispatch = useDispatch()

    const showAllRecords = useCallback(() => {
        dispatch(actions.showAllTableRecordsInit({ bcName, cursor: cursor as string }))
    }, [bcName, cursor, dispatch])

    return { showAllRecordsButton: limitBySelf, showAllRecords }
}
