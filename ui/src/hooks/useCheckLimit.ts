import { useAppSelector } from '@store'
import { getBcPaginationTypes } from '@components/ui/Pagination/utils'
import { selectBc } from '@selectors/selectors'

export const useCheckLimit = (bcName: string) => {
    const bc = useAppSelector(selectBc(bcName))
    const bcCount = useAppSelector(state => state.view.bcRecordsCount[bcName]?.count ?? state.data[bcName]?.length)
    const widgets = useAppSelector(state => state.view.widgets)
    const paginationTypes = getBcPaginationTypes(bcName, widgets)

    let isIncorrectLimit: boolean
    let bcCountForShowing: string | number

    if (paginationTypes.has('nextAndPreviousWithCount')) {
        isIncorrectLimit = bc?.limit != null && bcCount != null && bcCount > bc?.limit
        bcCountForShowing = bcCount
    } else if (paginationTypes.has('nextAndPreviousWithHasNext')) {
        isIncorrectLimit = bc?.hasNext || bc?.page !== 1
        bcCountForShowing = `${bc?.limit}+`
    } else {
        isIncorrectLimit = (!!bc?.limit && bcCount >= bc?.limit) || Boolean(bc?.hasNext) || bc?.page !== 1
        bcCountForShowing = bcCount
    }

    return {
        bcPageLimit: bc?.limit,
        bcCount,
        isIncorrectLimit,
        bcCountForShowing: String(bcCountForShowing)
    }
}
