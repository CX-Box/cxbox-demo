import { useAppSelector } from '@store'
import { shallowEqual, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { actions } from '@actions'
import { FIELDS } from '@constants'
import { selectBc, selectBcFilters } from '@selectors/selectors'

function useFiltersGroupName(bcName: string | undefined) {
    const filterGroupName = useAppSelector(state => state.screen.appliedFilterGroup[bcName!] ?? null)

    const dispatch = useDispatch()

    const setFilterGroupName = useCallback(
        (name: string | null) => {
            dispatch(actions.setFilterGroup({ bcName: bcName!, filterGroupName: name }))
        },
        [bcName, dispatch]
    )

    return { filterGroupName, setFilterGroupName }
}

export const useFilterGroups = (bcName: string = '') => {
    const { filtersExist, filterGroupsExist, filterGroups, filtersCount } = useAppSelector(state => {
        const bc = selectBc(state, bcName)
        const bcFilters = selectBcFilters(state, bcName)
        const screenViewerMode = state.screen.viewerMode[bcName]
        const enabledMassMode = screenViewerMode?.mode === 'mass'
        const resultFilterEnabled = !!screenViewerMode?.resultFilterEnabled
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

    const { filterGroupName, setFilterGroupName } = useFiltersGroupName(bcName)

    const dispatch = useDispatch()

    const clearAllFilters = useCallback(() => {
        dispatch(actions.bcRemoveAllFilters({ bcName }))
        dispatch(actions.bcForceUpdate({ bcName }))
    }, [dispatch, bcName])

    const applyFilterGroup = useCallback(
        (value: string) => {
            setFilterGroupName(value ?? null)
            dispatch(actions.bcForceUpdate({ bcName }))
        },
        [bcName, dispatch, setFilterGroupName]
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
