import { useMemo } from 'react'
import { getPaginationControlsState, PaginationControlsParams } from '@features/pagination/utils/paginationControls'

export const usePaginationControls = ({ type, page, limit, defaultLimit, loadedCount, hasNext, total }: PaginationControlsParams) =>
    useMemo(
        () => getPaginationControlsState({ type, page, limit, defaultLimit, loadedCount, hasNext, total }),
        [type, page, limit, defaultLimit, loadedCount, hasNext, total]
    )
