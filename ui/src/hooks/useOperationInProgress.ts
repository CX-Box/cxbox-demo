import { useAppSelector } from '@store'
import { OperationType } from '@cxbox-ui/core'

export const useOperationInProgress = (bcName: string) => {
    const operationsInProgress = useAppSelector(state => state.screen.bo.bc[bcName]?.operationsInProgress || [])

    return (operationType?: OperationType): boolean => {
        return !!operationType && operationsInProgress.includes(operationType)
    }
}
