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
        if (data) {
            records = data.filter(item => {
                if (pendingChanges?.[item.id]) {
                    return pendingChanges[item.id]._associate
                }

                if (isRadio && pendingChanges && Object.keys(pendingChanges).length) {
                    return false
                }

                return item?._associate
            })
        }
        return records
    }, [data, pendingChanges, isRadio])
}
