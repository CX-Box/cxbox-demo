import { AppWidgetMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { useDispatch } from 'react-redux'
import { useCallback, useMemo } from 'react'
import { actions } from '@actions'
import { AVAILABLE_LIMITS_LIST } from '@constants/pagination'

export const useWidgetPaginationLimit = (widget: AppWidgetMeta) => {
    const { hideLimitOptions = false, availableLimitsList = AVAILABLE_LIMITS_LIST } = widget.options?.pagination ?? {}
    const bcPageLimit = useAppSelector(state => state.screen.bo.bc[widget.bcName].limit)
    const localPageLimit = useAppSelector(state => state.screen.pagination[widget.bcName]?.limit)
    const defaultLimit = useAppSelector(state => state.screen.bo.bc[widget.bcName]?.defaultLimit)

    const dispatch = useDispatch()

    const changePageLimit = useCallback(
        (value: number) => {
            dispatch(actions.changePageLimit({ bcName: widget.bcName, limit: value }))
            dispatch(actions.bcChangePage({ bcName: widget.bcName, page: 1 }))
        },
        [dispatch, widget.bcName]
    )

    const options = useMemo(() => {
        return (
            typeof defaultLimit === 'number' && availableLimitsList
                ? Array.from(new Set(availableLimitsList).add(defaultLimit))
                : availableLimitsList
        )?.sort((a, b) => a - b)
    }, [availableLimitsList, defaultLimit])

    return {
        hideLimitOptions,
        changePageLimit,
        value: localPageLimit ?? bcPageLimit,
        options
    }
}
