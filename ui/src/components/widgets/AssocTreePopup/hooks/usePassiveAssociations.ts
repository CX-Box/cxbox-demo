import { useCallback, useMemo, useRef } from 'react'
import { MultivalueSingleValue } from '@interfaces/data'
import {
    useMultivalueHandlers,
    useMultivalueValues
} from '@components/widgets/AssocListPopup/PassiveAssocListPopup/hooks/usePassiveAssociations'
import { TreeRowSelectionSource, useTreeRowSelection } from '@components/widgets/Table/tree/hooks/useTreeRowSelection'

export const usePassiveAssociations = (widgetName: string) => {
    const values = useMultivalueValues()
    const { changeDataItem, convertToMultivalue } = useMultivalueHandlers(values)
    const currentValuesRef = useRef(values)
    currentValuesRef.current = values

    const selectItems = useCallback(
        (selected: boolean, changedRows: Array<Record<string, any>>) => {
            const changedIds = new Set(changedRows.map(record => String(record.id)))
            let nextValues: MultivalueSingleValue[]

            if (selected) {
                const existingIds = new Set(currentValuesRef.current.map(value => String(value.id)))
                const addedValues = changedRows
                    .filter(record => !existingIds.has(String(record.id)))
                    .map(record => convertToMultivalue(record))

                nextValues = [...currentValuesRef.current, ...addedValues]
            } else {
                nextValues = currentValuesRef.current.filter(value => !changedIds.has(String(value.id)))
            }

            currentValuesRef.current = nextValues
            changeDataItem(nextValues)
        },
        [changeDataItem, convertToMultivalue]
    )

    const selectionSource: TreeRowSelectionSource = useMemo(
        () => ({
            selectItems,
            selectedRowKeys: values.map(value => String(value.id))
        }),
        [selectItems, values]
    )

    const treeRowSelection = useTreeRowSelection(widgetName, selectionSource)

    return {
        values,
        ...treeRowSelection
    }
}
