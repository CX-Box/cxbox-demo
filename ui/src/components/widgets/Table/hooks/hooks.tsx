import { useAppSelector } from '@store'
import { shallowEqual, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { actions } from '@actions'
import { FIELDS } from '@constants'
import { selectBc, selectBcFilters, selectHasBcTree } from '@selectors/selectors'
import { treeActions } from '@slices/tree'
import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { getBcDefaultFilters, areFiltersEqual, mergeFilters } from '@utils/defaultFilters'
import { getAssocTreeSelectedNodeIds } from '@utils/getAssocTreeSelectedNodeIds'
import { FilterType } from '@cxbox-ui/core'

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

export const useFilterGroups = (meta?: AppWidgetMeta) => {
    const bcName = meta?.bcName ?? ''
    const { filtersExist, filterGroupsExist, filterGroups, filtersCount, defaultFilters, showResetButton } = useAppSelector(state => {
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
        const selectedNodeIds = getAssocTreeSelectedNodeIds(state, state.view.popupData, meta)
        const resolvedDefaultFilters = mergeFilters(
            getBcDefaultFilters(bc),
            meta?.type === CustomWidgetTypes.AssocTreePopup && selectedNodeIds.length
                ? [{ fieldName: FIELDS.TECHNICAL.ID, type: FilterType.equalsOneOf, value: selectedNodeIds }]
                : undefined
        )

        return {
            cursor: bc?.cursor,
            filterGroups: bc?.filterGroups,
            filterGroupsExist: !!bc?.filterGroups?.length,
            filtersExist: enabledMassMode ? massModeFiltersExist : defaultFiltersExist,
            filtersCount: enabledMassMode && filterById && !resultFilterEnabled ? filtersLength - 1 : filtersLength,
            defaultFilters: resolvedDefaultFilters,
            showResetButton: resolvedDefaultFilters.length > 0 && !areFiltersEqual(bcFilters, resolvedDefaultFilters)
        }
    }, shallowEqual)
    const hasBcTree = useAppSelector(selectHasBcTree(bcName))

    const { filterGroupName, setFilterGroupName } = useFiltersGroupName(bcName)

    const dispatch = useDispatch()

    const clearAllFilters = useCallback(() => {
        dispatch(actions.bcRemoveAllFilters({ bcName }))

        if (hasBcTree) {
            dispatch(treeActions.applyFilter({ bcName: bcName as string }))
        } else {
            dispatch(actions.bcForceUpdate({ bcName }))
        }
    }, [dispatch, bcName, hasBcTree])

    const resetFilters = useCallback(() => {
        dispatch(actions.bcRemoveAllFilters({ bcName }))
        defaultFilters.forEach(filter => dispatch(actions.bcAddFilter({ bcName, filter, widgetName: meta?.name })))

        if (hasBcTree) {
            dispatch(treeActions.setTreeDefaultFilter({ bcName, filters: defaultFilters }))
            dispatch(treeActions.applyFilter({ bcName }))
        } else {
            dispatch(actions.bcForceUpdate({ bcName }))
        }
    }, [bcName, defaultFilters, dispatch, hasBcTree, meta?.name])

    const applyFilterGroup = useCallback(
        (value: string) => {
            setFilterGroupName(value ?? null)

            if (hasBcTree) {
                dispatch(treeActions.applyFilter({ bcName }))
            } else {
                dispatch(actions.bcForceUpdate({ bcName }))
            }
        },
        [bcName, dispatch, hasBcTree, setFilterGroupName]
    )

    return {
        showFilterGroups: filterGroupsExist,
        showClearButton: filtersExist,
        showResetButton,
        applyFilterGroup,
        clearAllFilters,
        resetFilters,
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
