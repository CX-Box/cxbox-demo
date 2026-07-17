import { useAppSelector } from '@store'
import { usePaginationState } from '@features/pagination/hooks/usePaginationState'
import { useBcPaginationModes } from '@features/pagination/hooks/useBcPaginationModes'
import { getPaginationLimitValidation } from '@features/pagination/utils/getPaginationLimitValidation'

export const useCheckLimit = (bcName: string) => {
    const bcCount = useAppSelector(state => state.view.bcRecordsCount[bcName]?.count ?? state.data[bcName]?.length)
    const pagination = usePaginationState(bcName)
    const modes = useBcPaginationModes(bcName)
    const validation = getPaginationLimitValidation({ ...pagination, modes, count: bcCount })

    return {
        bcPageLimit: pagination.limit,
        bcCount,
        isIncorrectLimit: validation.incorrect,
        bcCountForShowing: validation.countLabel
    }
}
