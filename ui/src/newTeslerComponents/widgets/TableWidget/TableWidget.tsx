import React, { useMemo } from 'react'
import { Table } from 'antd'
import { ColumnProps, TableProps, TableRowSelection } from 'antd/es/table'
import styles from './TableWidget.less'
import Field from '../../Field/Field'
import cn from 'classnames'
import Pagination from '../../ui/Pagination/Pagination'
import RowOperationsButton from '../../RowOperations/RowOperationsButton'
import DefaultHeader from './components/Header'
import CustomColumnTitle from './components/CustomColumnTitle'
import { DataItem } from '@cxbox-ui/core'
import {
    PaginationMode,
    RowMetaField,
    useControlColumnsMerge,
    useRowMenu,
    useViewCell,
    WidgetTableMeta,
    WidgetListField,
    useRowMetaProps,
    useDataProps,
    useFieldNormalization
} from '@cxbox-ui/core'
import FullHierarchyTable from '@teslerComponents/FullHierarchyTable/FullHierarchyTable'
import HierarchyTable from '@teslerComponents/HierarchyTable/HierarchyTable'

type AdditionalAntdTableProps = Partial<Omit<TableProps<DataItem>, 'rowSelection'>>

export interface TableWidgetProps extends AdditionalAntdTableProps {
    columnTitleComponent?: (options?: {
        widgetName: string
        widgetMeta: WidgetListField
        rowMeta: RowMetaField
    }) => React.ReactElement | null
    meta: WidgetTableMeta
    rowSelection?: TableRowSelection<DataItem>
    showRowActions?: boolean
    allowEdit?: boolean
    paginationMode?: PaginationMode
    disablePagination?: boolean
    disableDots?: boolean
    controlColumns?: Array<{ column: ColumnProps<DataItem>; position: 'left' | 'right' }>
    header?: React.ReactNode
}

/**
 *
 * @param props
 * @category Widgets
 */
export const TableWidget = ({
    meta,
    rowSelection,
    showRowActions,
    allowEdit,
    paginationMode,
    disablePagination,
    disableDots,
    controlColumns,
    columnTitleComponent,
    header,
    ...rest
}: TableWidgetProps) => {
    const { bcName, name: widgetName, fields } = meta
    const isAllowEdit = (allowEdit ?? true) && !meta.options?.readOnly

    const [operationsRef, parentRef, onRow] = useRowMenu()

    const { rowMetaFields } = useRowMetaProps({ bcName, includeSelf: true })
    const { data } = useDataProps({ bcName })

    const { selectCell, isEditModeForCell } = useViewCell({ widgetName, isAllowEdit })
    const normalizedFields = useFieldNormalization(fields)

    const columns: Array<ColumnProps<DataItem>> = useMemo(() => {
        return normalizedFields.map(item => {
            const fieldRowMeta = rowMetaFields?.find(field => field.key === item.key)
            return {
                title: (
                    <CustomColumnTitle
                        columnTitleComponent={columnTitleComponent}
                        widgetName={widgetName}
                        fieldMeta={item}
                        fieldRowMeta={fieldRowMeta}
                    />
                ),
                key: item.key,
                dataIndex: item.key,
                width: item.width,
                render: (text: string, dataItem: DataItem) => {
                    const editMode = isEditModeForCell(item.key, dataItem.id)
                    return (
                        <div>
                            <Field
                                forcedData={dataItem}
                                bcName={bcName}
                                cursor={dataItem.id}
                                widgetName={widgetName}
                                widgetField={item}
                                readonly={!editMode}
                                forceFocus={editMode}
                            />
                        </div>
                    )
                },
                onCell: (record: DataItem, rowIndex: number) => {
                    return !isAllowEdit
                        ? null
                        : {
                              onDoubleClick: (event: React.MouseEvent) => {
                                  selectCell(record.id, item.key)
                              }
                          }
                }
            }
        })
    }, [normalizedFields, rowMetaFields, columnTitleComponent, widgetName, isEditModeForCell, bcName, isAllowEdit, selectCell])
    const resultColumns = useControlColumnsMerge<ColumnProps<DataItem>>({ columns, controlColumns })

    if (meta.options?.hierarchyFull) {
        return <FullHierarchyTable meta={meta} />
    }

    if (meta.options?.hierarchy) {
        return <HierarchyTable meta={meta} showPagination widgetName={widgetName} />
    }

    return (
        <div className={styles.tableContainer} ref={parentRef}>
            {header ?? <DefaultHeader widgetName={widgetName} />}
            <Table
                className={cn(styles.table, { [styles.tableWithRowMenu]: showRowActions })}
                columns={resultColumns}
                dataSource={data}
                rowKey="id"
                rowSelection={rowSelection}
                pagination={false}
                onRow={onRow}
                {...rest}
            />
            {!disablePagination && <Pagination mode={paginationMode || PaginationMode.page} widgetName={meta.name} />}
            {showRowActions && !disableDots && <RowOperationsButton meta={meta} ref={operationsRef} parent={parentRef} />}
        </div>
    )
}

/**
 * @category Widgets
 */
export default React.memo(TableWidget)
