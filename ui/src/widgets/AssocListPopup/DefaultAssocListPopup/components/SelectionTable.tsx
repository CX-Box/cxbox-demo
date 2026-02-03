import React from 'react'
import Table from '@components/widgets/Table/Table'
import { TableRowSelection } from 'antd/lib/table'
import { AssociatedItem, DataItem, interfaces } from '@cxbox-ui/core'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { TableProps } from 'antd/es/table'
<<<<<<<< HEAD:ui/src/components/widgets/AssocListPopup/DefaultAssocListPopup/components/SelectionTable.tsx
========
import Table from '@components/Table/Table'
import { useDefaultAssociations } from './hooks/useDefaultAssociations'
>>>>>>>> 2745e8d6 (CXBOX-1123 | Fixed. File system rework):ui/src/widgets/AssocListPopup/DefaultAssocListPopup/SelectionTable.tsx

interface SelectionTableProps {
    meta: AppWidgetTableMeta
    selectedRecords: DataItem[]
    onSelect: (record: AssociatedItem, selected: boolean) => void
    onSelectAll: (selected: boolean, selectedRows: DataItem[], changedRows: DataItem[]) => void
}

const SelectionTable: React.FC<SelectionTableProps> = ({ meta, selectedRecords, onSelect, onSelectAll }) => {
    const rowSelection: TableProps<interfaces.AssociatedItem>['rowSelection'] = {
        type: 'checkbox',
        selectedRowKeys: selectedRecords.map(item => item.id),
        onSelect,
        onSelectAll,
        getCheckboxProps: () => ({
            'data-test-widget-list-column-select': true
        })
    }

    return (
        <Table
            meta={meta}
            rowSelection={rowSelection as TableRowSelection<interfaces.DataItem>}
            disableMassMode={true}
            disablePagination={true}
        />
    )
}

export default React.memo(SelectionTable)
