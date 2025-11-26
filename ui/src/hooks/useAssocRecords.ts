import React from 'react'
import { interfaces } from '@cxbox-ui/core'

const emptyData: any[] = []

/**
 * TODO
 *
 * @param data
 * @param pendingChanges
 * @param isRadio
 * @category Hooks
 */
export function useAssocRecords<T extends interfaces.AssociatedItem>(
    data?: T[],
    pendingChanges?: Record<string, interfaces.PendingDataItem>,
    isRadio?: boolean
): T[] {
    return React.useMemo(() => {
        let records = emptyData
        const pendingRecords = Object.values(pendingChanges || {}).filter(item => item._associate)

        if (data && !(isRadio && pendingChanges && Object.keys(pendingChanges).length)) {
            const pendingIds = new Set(pendingRecords.map(i => i.id))
            records = data.filter(item => item?._associate && !pendingIds.has(item.id))
        }

        return [...pendingRecords, ...records]
    }, [data, pendingChanges, isRadio])
}
