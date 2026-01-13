import { useAppSelector } from '@store'
import { selectBcDataItem, selectBcRecordPendingDataChanges } from '@selectors/selectors'
import { useCallback } from 'react'

export const useGetFieldValue = (bcName: string | undefined, recordId: string | null | undefined) => {
    const pendingData = useAppSelector(selectBcRecordPendingDataChanges(bcName, recordId))
    const record = useAppSelector(selectBcDataItem(bcName, recordId))

    return useCallback(
        (key?: string) => (!key ? undefined : pendingData?.[key] !== undefined ? pendingData[key] : record?.[key]),
        [pendingData, record]
    )
}
