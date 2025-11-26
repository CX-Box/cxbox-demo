import React from 'react'
import Table from '@components/widgets/Table/Table'
import { TableRowSelection } from 'antd/lib/table'
import { AssociatedItem, DataItem, interfaces } from '@cxbox-ui/core'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { TableProps } from 'antd/es/table'

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
