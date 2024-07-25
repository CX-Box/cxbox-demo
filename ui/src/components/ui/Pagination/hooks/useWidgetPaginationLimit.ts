import { AppWidgetMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { actions } from '@actions'

export const useWidgetPaginationLimit = (widget: AppWidgetMeta) => {
    const { hideLimitOptions = false, availableLimitsList } = widget.options?.pagination ?? {}
    const bcPageLimit = useAppSelector(state => state.screen.bo.bc[widget.bcName].limit)
    const localPageLimit = useAppSelector(state => state.screen.pagination[widget.bcName]?.limit)

    const dispatch = useDispatch()

    const changePageLimit = useCallback(
        (value: number) => {
            dispatch(actions.changePageLimit({ bcName: widget.bcName, limit: value }))
            dispatch(actions.bcChangePage({ bcName: widget.bcName, page: 1 }))
        },
        [dispatch, widget.bcName]
    )

    return {
        hideLimitOptions,
        changePageLimit,
        value: localPageLimit ?? bcPageLimit,
        options: availableLimitsList
    }
}
