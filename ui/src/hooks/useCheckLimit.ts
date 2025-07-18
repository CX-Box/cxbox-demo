import { useAppSelector } from '@store'
import { getBcPaginationTypes } from '@components/ui/Pagination/utils'

export const useCheckLimit = (bcName: string) => {
    const bcLimit = useAppSelector(state => state.screen.bo.bc[bcName].limit)
    const bcPage = useAppSelector(state => state.screen.bo.bc[bcName]?.page) as number
    const bcHasNext = useAppSelector(state => state.screen.bo.bc[bcName].hasNext)
    const bcCount = useAppSelector(state => state.view.bcRecordsCount[bcName]?.count)
    const widgets = useAppSelector(state => state.view.widgets)
    const paginationTypes = getBcPaginationTypes(bcName, widgets)

    let isIncorrectLimit
    let bcCountForShowing

    if (paginationTypes.has('nextAndPreviousWithCount')) {
        isIncorrectLimit = bcLimit != null && bcCount != null && bcCount > bcLimit
        bcCountForShowing = bcCount
    } else if (paginationTypes.has('nextAndPreviousWithHasNext')) {
        isIncorrectLimit = typeof bcHasNext === 'boolean' && (bcHasNext || bcPage !== 1)
        bcCountForShowing = `${bcLimit}+`
    } else {
        isIncorrectLimit = false
        bcCountForShowing = Infinity
    }

    return {
        bcPageLimit: bcLimit,
        bcCount,
        isIncorrectLimit,
        bcCountForShowing: String(bcCountForShowing)
    }
}
