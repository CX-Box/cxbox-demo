import { useCallback } from 'react'
import { actions } from '@actions'
import { PaginationMode } from '@constants/pagination'
import { useAppDispatch, useAppSelector } from '@store'

const paginationTypeButtonPopoverText: Record<PaginationMode, string> = {
    nextAndPreviousSmart:
        'Switch to nextAndPreviousSmart pagination (total count is not displayed, pagination is calculated based on _limit and the number of records returned from /data)',
    nextAndPreviousWithHasNext:
        'Switch to nextAndPreviousWithHasNext pagination (total count is not displayed, pagination is based on the hasNext flag)',
    nextAndPreviousWithCount: 'Switch to nextAndPreviousWithCount pagination (uses /count endpoint to calculate total number of records)'
}

const ALTERNATIVE_PAGINATION_APPLIED_TEXT =
    'Alternative pagination type is already applied. Reload the page to return to default pagination'

export const useAlternativePagination = (widgetName: string, alternativeType: PaginationMode) => {
    const dispatch = useAppDispatch()
    const alternativePaginationTypeEnabled = useAppSelector(state => widgetName in state.screen.alternativePagination)

    const changePaginationType = useCallback(() => {
        dispatch(
            actions.setAlternativePaginationType({
                widgetName,
                type: alternativeType
            })
        )
    }, [alternativeType, dispatch, widgetName])

    const popoverText = alternativePaginationTypeEnabled
        ? ALTERNATIVE_PAGINATION_APPLIED_TEXT
        : paginationTypeButtonPopoverText[alternativeType]

    return {
        alternativePaginationTypeEnabled,
        changePaginationType,
        popoverText
    }
}
