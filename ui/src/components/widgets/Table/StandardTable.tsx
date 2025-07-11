import React, { MutableRefObject } from 'react'
import styles from '@components/widgets/Table/Table.less'
import { Table as AntdTable } from 'antd'
import cn from 'classnames'
import ReactDragListView from 'react-drag-listview'
import Pagination from '@components/ui/Pagination/Pagination'
import Header from '@components/widgets/Table/components/Header'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { selectBc, selectWidget } from '@selectors/selectors'
import { TableProps } from 'antd/es/table'
import RowOperationsButton, { RowOperationsButtonInstance } from '@components/RowOperations/RowOperationsButton'

interface StandardTableProps<T> extends Omit<TableProps<T>, 'scroll' | 'pagination' | 'className' | 'rowClassName'> {
    widgetName: string
    wrapperRef: MutableRefObject<HTMLDivElement>
    operationsRef?: MutableRefObject<RowOperationsButtonInstance>
    hideRowActions?: boolean
    hidePagination?: boolean
    disabledLimit?: boolean
    stickyWithHorizontalScroll?: boolean

    onColumnDragEnd?: (fromIndex: number, toIndex: number) => void
}

const COLUMN_SELECTOR = 'th'

function StandardTable<T extends { id: unknown }>({
    columns,
    widgetName,
    wrapperRef,
    hideRowActions = false,
    rowKey,
    dataSource,
    onRow,
    onHeaderRow,
    expandedRowKeys,
    expandedRowRender,
    expandIcon,
    expandIconColumnIndex,
    onExpand,
    operationsRef,
    onColumnDragEnd,
    disabledLimit,
    hidePagination,
    stickyWithHorizontalScroll = false,
    ...rest
}: StandardTableProps<T>) {
    const widget = useAppSelector(state => selectWidget(state, widgetName)) as AppWidgetTableMeta
    const bc = useAppSelector(state => selectBc(state, widget?.bcName))

    if (!widget) {
        return null
    }

    const tableElement = (
        <div className={cn(styles.tableContainer, { [styles.stickyWithHorizontalScroll]: stickyWithHorizontalScroll })} ref={wrapperRef}>
            <Header meta={widget} />
            <AntdTable
                className={cn(styles.table, { [styles.tableWithRowMenu]: !hideRowActions })}
                columns={columns}
                dataSource={dataSource}
                rowKey={rowKey}
                pagination={false}
                onRow={onRow}
                onHeaderRow={onHeaderRow}
                rowClassName={record => (record.id === bc?.cursor ? 'ant-table-row-selected' : '')}
                expandedRowKeys={expandedRowKeys}
                expandIconColumnIndex={expandIconColumnIndex}
                expandIconAsCell={false}
                expandIcon={expandIcon}
                expandedRowRender={expandedRowRender}
                onExpand={onExpand}
                indentSize={0}
                scroll={stickyWithHorizontalScroll ? { y: true, x: 'calc(700px + 50%)' } : undefined}
                {...rest}
            />
            {!hideRowActions && <RowOperationsButton meta={widget as AppWidgetTableMeta} ref={operationsRef} parent={wrapperRef} />}
        </div>
    )

    const enableDragList = !!onColumnDragEnd

    return (
        <>
            {enableDragList ? (
                <ReactDragListView.DragColumn onDragEnd={onColumnDragEnd} nodeSelector={COLUMN_SELECTOR}>
                    {tableElement}
                </ReactDragListView.DragColumn>
            ) : (
                tableElement
            )}
            {!hidePagination && <Pagination disabledLimit={disabledLimit} meta={widget} />}
        </>
    )
}

export default StandardTable
