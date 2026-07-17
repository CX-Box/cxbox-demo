import { PAGINATION_MODES } from '@constants/pagination'
import { getPaginationControlsState, PaginationControlsParams } from '@features/pagination/utils/paginationControls'

export const getTreePaginationControlsState = (params: PaginationControlsParams) => {
    let paginationType = params.type

    if (paginationType === PAGINATION_MODES.nextAndPreviousWithCount && params.total == null) {
        paginationType = params.hasNext == null ? PAGINATION_MODES.nextAndPreviousSmart : PAGINATION_MODES.nextAndPreviousWithHasNext
    }

    return getPaginationControlsState({ ...params, type: paginationType })
}
