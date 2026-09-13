import { useCallback, useMemo } from 'react'
import { DataItem } from '@cxbox-ui/core'
import { useDefaultAssociations } from '@components/widgets/AssocListPopup/DefaultAssocListPopup/hooks/useDefaultAssociations'
import { TreeRowSelectionSource, useTreeRowSelection } from '@components/widgets/Table/tree/hooks/useTreeRowSelection'

export const useActiveAssociations = (widgetName: string, bcName: string) => {
    const { values, selectAll } = useDefaultAssociations(bcName)

    const selectItems = useCallback(
        (selected: boolean, changedRows: Array<Record<string, any>>) => {
            selectAll(selected, [], changedRows as DataItem[])
        },
        [selectAll]
    )

    const selectionSource: TreeRowSelectionSource = useMemo(
        () => ({
            selectItems,
            selectedRowKeys: values.map(value => String(value.id))
        }),
        [selectItems, values]
    )

    return useTreeRowSelection(widgetName, selectionSource)
}
