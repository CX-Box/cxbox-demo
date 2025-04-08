import { useAppSelector } from '@store'

export const useCheckLimit = (bcName: string) => {
    const bcPageLimit = useAppSelector(state => state.screen.bo.bc[bcName].limit)
    const bcCount = useAppSelector(state => state.view.bcRecordsCount[bcName]?.count)

    const isIncorrectLimit = bcPageLimit != null && bcCount != null && bcCount > bcPageLimit

    return {
        bcPageLimit,
        bcCount,
        isIncorrectLimit
    }
}
