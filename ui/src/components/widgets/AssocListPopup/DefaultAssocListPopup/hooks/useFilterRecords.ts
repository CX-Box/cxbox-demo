import { useCallback, useState } from 'react'
import { BcFilter, DataItem } from '@cxbox-ui/core'
import { TagType } from '@components/widgets/AssocListPopup/ui/Title'

const emptyDataItems: DataItem[] = []

export const useFilterRecords = (filter?: BcFilter) => {
    const initialPredefinedFilters = Array.isArray(filter?.value)
        ? (filter?.value as string[]).map(item => ({
              id: item,
              vstamp: 0
          }))
        : emptyDataItems
    const [selectedFilterRecords, setSelectedFilterRecords] = useState(filter?.assocItems || initialPredefinedFilters)

    const handleDelete = useCallback((id: string) => setSelectedFilterRecords(prev => prev.filter(item => item.id !== id)), [])

    const handleDeleteTag = useCallback((value: TagType) => handleDelete(value.id), [handleDelete])

    const handleSelect = useCallback(
        (record: DataItem, selected: boolean) => {
            selected ? setSelectedFilterRecords(prev => [...prev, record]) : handleDelete(record.id)
        },
        [handleDelete]
    )

    const handleSelectAll = useCallback((selected: boolean, selectedRows: DataItem[], changedRows: DataItem[]) => {
        const changedRowsIds = changedRows.map(item => item.id)
        setSelectedFilterRecords(prev => (selected ? [...prev, ...changedRows] : prev?.filter(item => !changedRowsIds.includes(item.id))))
    }, [])

    return {
        selectedFilterRecords,
        handleSelect,
        handleDeleteTag,
        handleSelectAll
    }
}
