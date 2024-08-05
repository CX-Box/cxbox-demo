import React from 'react'
import { TableRowSelection } from 'antd/lib/table'
import { interfaces } from '@cxbox-ui/core'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { TableProps } from 'antd/es/table'
import Table from '@components/widgets/Table/Table'
import { useDefaultAssociations } from './hooks/useDefaultAssociations'

interface SelectionTableProps {
    meta: AppWidgetTableMeta
    disablePagination?: boolean
}

const SelectionTable: React.FC<SelectionTableProps> = props => {
    const { values, select, selectAll } = useDefaultAssociations(props.meta.bcName)
    const rowSelection: TableProps<interfaces.AssociatedItem>['rowSelection'] = {
        type: 'checkbox',
        selectedRowKeys: values.map(item => item.id),
        onSelect: select,
        onSelectAll: selectAll,
        getCheckboxProps: () => ({
            'data-test-widget-list-column-select': true
        })
    }

    return (
        <Table
            meta={props.meta}
            rowSelection={rowSelection as TableRowSelection<interfaces.DataItem>}
            disablePagination={props.disablePagination}
        />
    )
}

export default React.memo(SelectionTable)
