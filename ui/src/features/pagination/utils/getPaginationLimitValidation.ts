import { PaginationMode, PAGINATION_MODES } from '@constants/pagination'

interface PaginationLimitValidationParams {
    modes: Set<PaginationMode>
    page: number
    limit: number
    count?: number
    hasNext?: boolean
}

export const getPaginationLimitValidation = ({ modes, page, limit, count, hasNext }: PaginationLimitValidationParams) => {
    if (modes.has(PAGINATION_MODES.nextAndPreviousWithCount)) {
        return { incorrect: count != null && count > limit, countLabel: String(count) }
    }

    if (modes.has(PAGINATION_MODES.nextAndPreviousWithHasNext)) {
        return { incorrect: Boolean(hasNext) || page !== 1, countLabel: `${limit}+` }
    }

    return {
        incorrect: (count != null && count >= limit) || Boolean(hasNext) || page !== 1,
        countLabel: String(count)
    }
}
