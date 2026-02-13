import { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '@store'
import { shallowEqual, useDispatch } from 'react-redux'
import { actions } from '@actions'
import { WidgetMeta } from '@cxbox-ui/core'

export function useArrowPagination(widget?: WidgetMeta) {
    const { bc, data, page, limit, total, hasNext } = useAppSelector(state => {
        const bc = widget?.bcName ? state.screen.bo.bc[widget.bcName] : undefined
        const data = bc ? state.data[bc.name] : undefined
        const page = bc?.page ?? 0
        const limit = bc?.limit ?? 0
        const total: number | null = state.view.bcRecordsCount[bc?.name as string]?.count ?? null
        const hasNext = state.screen.bo.bc[bc?.name as string]?.hasNext

        return {
            bc,
            data,
            page,
            limit,
            total,
            hasNext
        }
    }, shallowEqual)

    const dispatch = useDispatch()

    const getIndexOnPage = () => {
        return data?.findIndex(item => item.id === (bc?.cursor as string)) ?? -1
    }

    const convertToIndexOnPage = (currentIndex: number) => {
        return currentIndex % limit
    }

    const [changePageType, setChangePageType] = useState<'previous' | 'next' | null>(null)
    const currentPageRef = useRef<number | null>(null)

    // sets the cursor to the last record when moving to the previous page
    useEffect(() => {
        if (changePageType === 'previous' && data?.length && !bc?.loading && page === currentPageRef.current) {
            dispatch(
                actions.bcSelectRecord({
                    bcName: bc?.name as string,
                    cursor: data?.[data?.length - 1]?.id as string
                })
            )
            setChangePageType(null)
        }
    }, [bc?.loading, bc?.name, changePageType, data, dispatch, page])

    const onChange = (index: number) => {
        if (bc && data) {
            const indexOnPage = convertToIndexOnPage(index)

            if (index === limit * (page - 1) - 1) {
                dispatch(actions.bcChangePage({ bcName: bc.name as string, page: page - 1, widgetName: widget?.name }))
                currentPageRef.current = page - 1
                setChangePageType('previous')
            } else if (index === limit * page) {
                dispatch(actions.bcChangePage({ bcName: bc.name as string, page: page + 1, widgetName: widget?.name }))
                currentPageRef.current = page + 1
                setChangePageType('next')
            } else if (bc.cursor !== data[indexOnPage].id) {
                dispatch(
                    actions.bcSelectRecord({
                        bcName: bc.name as string,
                        cursor: data[indexOnPage].id as string
                    })
                )
            }
        }
    }

    const previousIndex = useRef<number>(0)

    const getCurrentIndex = () => {
        const currentIndexOnPage = getIndexOnPage()
        const numberOfElementsOnPreviousPages = (page - 1) * limit

        if (!bc?.loading && currentIndexOnPage !== -1) {
            previousIndex.current = numberOfElementsOnPreviousPages + currentIndexOnPage
        }

        return previousIndex.current
    }

    const isProgressiveMode = total === null

    const isLeftButtonDisabled = () => {
        const currentIndex = getCurrentIndex()

        return currentIndex === 0 || total === 0
    }
    const isRightButtonDisabled = () => {
        const currentIndex = getCurrentIndex()

        if (isProgressiveMode) {
            return getIndexOnPage() === (data?.length ?? 0) - 1 && !hasNext
        }

        return currentIndex === total - 1 || total === 0
    }

    const previousTotal = useRef<string | number>(0)

    const getTotal = () => {
        let currentTotal: string | number
        if (isProgressiveMode) {
            currentTotal = (page - 1) * limit + (data?.length ?? 0)
        } else {
            currentTotal = total
        }

        if (!bc?.loading) {
            previousTotal.current = currentTotal
        }

        return isProgressiveMode ? `${previousTotal.current}${hasNext ? '+' : ''}` : previousTotal.current
    }

    return {
        onChange,
        total: getTotal(),
        currentIndex: getCurrentIndex(),
        disabledLeft: isLeftButtonDisabled(),
        disabledRight: isRightButtonDisabled(),
        hide: !(+total > 1)
    }
}
