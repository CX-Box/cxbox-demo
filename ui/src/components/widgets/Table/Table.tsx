import React from 'react'
import { TableWidget } from '@cxboxComponents'
import { ColumnProps } from 'antd/es/table'
import Pagination from '../../ui/Pagination/Pagination'
import ColumnTitle from '../../ColumnTitle/ColumnTitle'
import { useExpandableForm } from './hooks/useExpandableForm'
import styles from './Table.less'
import { AppWidgetMeta, AppWidgetTableMeta } from '@interfaces/widget'
import { TableWidgetOwnProps } from '@cxboxComponents/widgets/TableWidget/TableWidget'
import { interfaces } from '@cxbox-ui/core'

export type ControlColumn = { column: ColumnProps<interfaces.DataItem>; position: 'left' | 'right' }
interface TableProps extends TableWidgetOwnProps {
    meta: AppWidgetTableMeta
    primaryColumn?: ControlColumn
}

function Table({ meta, primaryColumn, disablePagination, ...rest }: TableProps) {
    const { expandable, expandIcon, expandIconColumn, getExpandIconColumnIndex, expandedRowRender, expandedRowKeys } = useExpandableForm(
        meta as AppWidgetMeta
    )

    const controlColumns = React.useMemo(() => {
        const resultColumns: Array<ControlColumn> = []
        if (meta.options?.primary?.enabled && primaryColumn) {
            resultColumns.push(primaryColumn as any)
        }

        if (expandIconColumn) {
            resultColumns.push({ column: expandIconColumn, position: 'right' })
        }

        return [...resultColumns]
    }, [expandIconColumn, meta.options?.primary?.enabled, primaryColumn])

    return (
        <div className={styles.tableContainer}>
            <TableWidget
                meta={meta}
                showRowActions={true}
                controlColumns={controlColumns}
                disablePagination={true}
                {...rest}
                columnTitleComponent={props => props && <ColumnTitle {...props} />}
                expandedRowKeys={expandedRowKeys}
                allowEdit={!expandable}
                expandIconColumnIndex={getExpandIconColumnIndex(controlColumns)}
                expandIconAsCell={false}
                expandIcon={expandIcon}
                expandedRowRender={expandedRowRender}
            />
            {!disablePagination && <Pagination meta={meta} />}
        </div>
    )
}

export default React.memo(Table)
