import { useAppSelector } from '@store'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { actions } from '@actions'
import { usePaginationState } from '@features/pagination/hooks/usePaginationState'

export function usePagination(widgetName: string) {
    const bcName = useAppSelector(state => state.view.widgets.find(item => item.name === widgetName)?.bcName) as string
    const paginationState = usePaginationState(bcName)

    const dispatch = useDispatch()

    const changePage = useCallback(
        (newPage: number) => {
            dispatch(actions.bcChangePage({ bcName, page: newPage, widgetName }))
        },
        [bcName, widgetName, dispatch]
    )

    const prevPage = useCallback(() => {
        changePage(paginationState.page - 1)
    }, [paginationState.page, changePage])

    const nextPage = useCallback(() => {
        changePage(paginationState.page + 1)
    }, [paginationState.page, changePage])

    return {
        nextPage,
        prevPage,
        ...paginationState,
        changePage
    }
}
