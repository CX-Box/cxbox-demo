import React from 'react'
import SelectionTable from './SelectionTable'
import { useDefaultAssociations } from '../hooks/useDefaultAssociations'
import { AppWidgetTableMeta } from '@interfaces/widget'

interface AssocSelectionTableProps {
    meta: AppWidgetTableMeta
}

const AssocSelectionTable: React.FC<AssocSelectionTableProps> = ({ meta }) => {
    const { values, select, selectAll } = useDefaultAssociations(meta.bcName)

    return <SelectionTable meta={meta} selectedRecords={values} onSelect={select} onSelectAll={selectAll} />
}

export default React.memo(AssocSelectionTable)
