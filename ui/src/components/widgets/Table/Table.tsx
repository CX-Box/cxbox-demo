import React from 'react'
import { WidgetTableMeta } from '@cxbox-ui/core/interfaces/widget'
import { TableWidget } from '@cxbox-ui/core'
import styles from './Table.module.css'
import { ColumnProps } from 'antd/es/table'
import { DataItem } from '@cxbox-ui/core/interfaces/data'
import MenuColumn from './components/MenuColumn'
import Pagination from '../../ui/Pagination/Pagination'
import { TableWidgetOwnProps } from '@cxbox-ui/core/components/widgets/TableWidget/TableWidget'

interface TableProps extends TableWidgetOwnProps {
    meta: WidgetTableMeta
}

function Table({ meta, ...rest }: TableProps) {
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
        resultColumns.push({ column: menuColumn, position: 'right' })
        return [...resultColumns]
    }, [menuColumn])

    return (
        <div className={styles.tableContainer}>
            <TableWidget meta={meta} controlColumns={controlColumns} disablePagination {...rest} />
            <Pagination meta={meta} />
        </div>
    )
}

export default React.memo(Table)
