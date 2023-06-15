import React from 'react'
import { WidgetTableMeta } from '@cxbox-ui/core/interfaces/widget'
import { TableWidget } from '@cxbox-ui/core'
import styles from './Table.module.css'
import { ColumnProps } from 'antd/es/table'
import { DataItem } from '@cxbox-ui/core/interfaces/data'
import MenuColumn from './components/MenuColumn'
import Pagination from '../../ui/Pagination/Pagination'
import { TableWidgetOwnProps } from '@cxbox-ui/core/components/widgets/TableWidget/TableWidget'
import { useExpandableForm } from './hooks/useExpandableForm'

interface TableProps extends TableWidgetOwnProps {
    meta: WidgetTableMeta
}

function Table({ meta, ...rest }: TableProps) {
    const { expandIcon, expandIconColumn, expandable, getExpandIconColumnIndex, expandedRowRender, expandedRowKeys } =
        useExpandableForm(meta)

    const menuColumn: ColumnProps<DataItem> = React.useMemo(() => {
        return {
            title: '',
            key: '_menuColumn',
            width: '42px',
            render: function renderDotsColumn(text, dataItem) {
                return <MenuColumn meta={meta} rowKey={dataItem.id} />
            }
        }
    }, [meta])

    const controlColumns = React.useMemo(() => {
        const resultColumns: Array<{ column: ColumnProps<DataItem>; position: 'left' | 'right' }> = []

        if (expandIconColumn) {
            resultColumns.push({ column: expandIconColumn, position: 'right' })
        }

        resultColumns.push({ column: menuColumn, position: 'right' })
        return [...resultColumns]
    }, [expandIconColumn, menuColumn])

    return (
        <div className={styles.tableContainer}>
            <TableWidget
                meta={meta}
                controlColumns={controlColumns}
                disablePagination
                {...rest}
                expandedRowKeys={expandedRowKeys}
                allowEdit={!expandable}
                expandIconColumnIndex={getExpandIconColumnIndex(controlColumns)}
                expandIconAsCell={false}
                expandIcon={expandIcon}
                expandedRowRender={expandedRowRender}
            />
            <Pagination meta={meta} />
        </div>
    )
}

export default React.memo(Table)
