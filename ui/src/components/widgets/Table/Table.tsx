import React from 'react'
import { WidgetTableMeta } from '@cxbox-ui/core/interfaces/widget'
import { TableWidget } from '@cxbox-ui/core'
import { ColumnProps } from 'antd/es/table'
import { DataItem } from '@cxbox-ui/core/interfaces/data'
import Pagination from '../../ui/Pagination/Pagination'
import { TableWidgetOwnProps } from '@cxbox-ui/core/components/widgets/TableWidget/TableWidget'
import ColumnTitle from '../../ColumnTitle/ColumnTitle'
import { useExpandableForm } from './hooks/useExpandableForm'
import styles from './Table.less'
import { AppWidgetMeta } from '../../../interfaces/widget'

interface TableProps extends TableWidgetOwnProps {
    meta: WidgetTableMeta
}

function Table({ meta, ...rest }: TableProps) {
    const { expandable, expandIcon, expandIconColumn, getExpandIconColumnIndex, expandedRowRender, expandedRowKeys } = useExpandableForm(
        meta as AppWidgetMeta
    )

    const controlColumns = React.useMemo(() => {
        const resultColumns: Array<{ column: ColumnProps<DataItem>; position: 'left' | 'right' }> = []

        if (expandIconColumn) {
            resultColumns.push({ column: expandIconColumn, position: 'right' })
        }

        return [...resultColumns]
    }, [expandIconColumn])

    return (
        <div className={styles.tableContainer}>
            <TableWidget
                meta={meta}
                showRowActions={true}
                controlColumns={controlColumns}
                disablePagination
                {...rest}
                columnTitleComponent={props => props && <ColumnTitle {...props} />}
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
