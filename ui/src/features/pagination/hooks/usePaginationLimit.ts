import { useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { actions } from '@actions'
import { usePaginationState } from './usePaginationState'
import { AVAILABLE_LIMITS_LIST } from '@constants/pagination'

interface PaginationLimitOptions {
    availableLimits?: number[]
    hideOptions?: boolean
}

export const usePaginationLimit = (bcName: string, options: PaginationLimitOptions = {}) => {
    const { availableLimits = AVAILABLE_LIMITS_LIST, hideOptions = false } = options
    const { limit, defaultLimit } = usePaginationState(bcName)
    const dispatch = useDispatch()

    const changeLimit = useCallback(
        (value: number) => {
            dispatch(actions.changePageLimit({ bcName, limit: value }))
            dispatch(actions.bcChangePage({ bcName, page: 1 }))
        },
        [bcName, dispatch]
    )

    const limitOptions = useMemo(
        () => Array.from(new Set([...availableLimits, defaultLimit])).sort((a, b) => a - b),
        [availableLimits, defaultLimit]
    )

    return { visible: !hideOptions, limit, options: limitOptions, changeLimit }
}
