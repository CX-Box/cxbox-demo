import { PaginationMode } from '@constants/pagination'

export const paginationTypeButtonPopoverText: Record<PaginationMode, string> = {
    nextAndPreviousSmart:
        'Switch to nextAndPreviousSmart pagination (total count is not displayed, pagination is calculated based on _limit and the number of records returned from /data)',
    nextAndPreviousWithHasNext:
        'Switch to nextAndPreviousWithHasNext pagination (total count is not displayed, pagination is based on the hasNext flag)',
    nextAndPreviousWithCount: 'Switch to nextAndPreviousWithCount pagination (uses /count endpoint to calculate total number of records)'
}
