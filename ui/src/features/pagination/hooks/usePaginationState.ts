import { useAppSelector } from '@store'
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '@constants/pagination'
import { selectBc } from '@selectors/selectors'

export const usePaginationState = (bcName?: string) => {
    const bc = useAppSelector(selectBc(bcName))
    const total = useAppSelector(state => (bcName ? state.view.bcRecordsCount[bcName]?.count : undefined))
    const limit = bc?.limit ?? DEFAULT_PAGE_LIMIT

    return {
        page: bc?.page ?? DEFAULT_PAGE,
        limit,
        defaultLimit: bc?.defaultLimit ?? limit,
        hasNext: bc?.hasNext,
        total
    }
}
