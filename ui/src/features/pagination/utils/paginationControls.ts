import { PAGINATION_MODES, PaginationMode } from '@constants/pagination'
import { calculatePageCount, isNextDisabled, isPrevDisabled } from '@features/pagination/utils/countPagination'

export interface PaginationControlsParams {
    type: PaginationMode
    page: number
    limit: number
    defaultLimit: number
    loadedCount: number
    hasNext?: boolean
    total?: number
}

export const getPaginationControlsState = ({ type, page, limit, defaultLimit, loadedCount, hasNext, total }: PaginationControlsParams) => {
    const previousDisabled = page <= 1

    switch (type) {
        case PAGINATION_MODES.nextAndPreviousSmart:
            return {
                visible: !(page === 1 && loadedCount < limit && loadedCount < defaultLimit),
                previousDisabled,
                nextDisabled: loadedCount < limit
            }
        case PAGINATION_MODES.nextAndPreviousWithHasNext:
            return {
                visible: !(page === 1 && !hasNext && loadedCount <= defaultLimit),
                previousDisabled,
                nextDisabled: !hasNext
            }
        case PAGINATION_MODES.nextAndPreviousWithCount:
            const visible = total != null ? total > 0 : false

            if (visible) {
                const pageCount = calculatePageCount(limit, total!)

                return {
                    visible,
                    previousDisabled: isPrevDisabled(page, pageCount),
                    nextDisabled: isNextDisabled(page, pageCount)
                }
            }

            return {
                visible,
                previousDisabled: true,
                nextDisabled: true
            }
    }
}
