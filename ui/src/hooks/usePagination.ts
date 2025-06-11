import { useAppSelector } from '@store'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { actions } from '@actions'

export function usePagination(widgetName: string) {
    const bcName = useAppSelector(state => state.view.widgets.find(item => item.name === widgetName)?.bcName) as string
    const hasNext = useAppSelector(state => state.screen.bo.bc[bcName]?.hasNext)
    const page = useAppSelector(state => state.screen.bo.bc[bcName]?.page) as number
    const limit = useAppSelector(state => state.screen.bo.bc[bcName]?.limit) as number
    const defaultLimit = useAppSelector(state => state.screen.bo.bc[bcName]?.defaultLimit) as number
    const total = useAppSelector(state => state.view.bcRecordsCount[bcName]?.count)

    const dispatch = useDispatch()

    const changePage = useCallback(
        (newPage: number) => {
            dispatch(actions.bcChangePage({ bcName, page: newPage, widgetName }))
        },
        [bcName, widgetName, dispatch]
    )

    const prevPage = useCallback(() => {
        const newPage = page - 1

        changePage(newPage)
    }, [page, changePage])

    const nextPage = useCallback(() => {
        const newPage = page + 1

        changePage(newPage)
    }, [page, changePage])

    return {
        nextPage,
        prevPage,
        hasNext,
        page,
        changePage,
        limit,
        defaultLimit,
        total
    }
}
