import React from 'react'
import { ColumnProps } from 'antd/es/table'
import { WidgetListField } from '@cxbox-ui/schema'
import { PSEUDO_ROW_TYPES, TreeTableCell } from '@components/widgets/Table/components/TreeTableCell'
import { TreeTableColumnTitle } from '@components/widgets/Table/components/TreeTableColumnTitle'
import { ControlColumn, CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { TableTreeNode, useTableTree } from '@components/widgets/Table/tree/hooks/useTableTree'
import { useTreeRowSelection } from '@components/widgets/Table/tree/hooks/useTreeRowSelection'
import { AppWidgetGroupingHierarchyMeta, AppWidgetTableMeta, CustomWidgetTypes } from '@interfaces/widget'
import { RowMetaField } from '@interfaces/rowMeta'
import styles from '../../Table.less'
import { buildContinuingGuidesWidthById } from '@components/widgets/Table/tree/utils/buildContinuingGuidesWidthById'

type TreeLevelCellStyle = React.CSSProperties & {
    '--tree-level': number
    '--tree-continuing-guides-width': string
}

interface BuildTreeTableColumnsParams<T extends CustomDataItem> {
    fields: AppWidgetTableMeta['fields']
    dataSource: TableTreeNode[]
    widget: AppWidgetTableMeta | AppWidgetGroupingHierarchyMeta
    rowMetaFields: RowMetaField[] | undefined
    expandedRowKeys: string[]
    showSelection: boolean
    selectNode: ReturnType<typeof useTreeRowSelection>['selectNode']
    getNodeSelectionState: ReturnType<typeof useTreeRowSelection>['getNodeSelectionState']
    handleExpand: ReturnType<typeof useTableTree>['handleExpand']
    createFetchNodesHandler: ReturnType<typeof useTableTree>['createFetchNodesHandler']
    restoreAncestorPaths: ReturnType<typeof useTableTree>['restoreAncestorPaths']
    showCloseButton: boolean
    hideColumn: (fieldKey: string) => void
    disableRowExpand?: boolean
    controlColumns: Array<ControlColumn<T>>
    isEditMode: (record: T) => boolean
}

export function buildTreeTableColumns<T extends CustomDataItem>({
    widget,
    fields,
    dataSource,
    rowMetaFields,
    expandedRowKeys,
    showSelection,
    selectNode,
    getNodeSelectionState,
    handleExpand,
    createFetchNodesHandler,
    restoreAncestorPaths,
    showCloseButton,
    hideColumn,
    disableRowExpand,
    controlColumns,
    isEditMode
}: BuildTreeTableColumnsParams<T>): Array<ColumnProps<T>> {
    const isGroupingHierarchy = (widget.type as string) === CustomWidgetTypes.GroupingHierarchy
    const continuingGuidesWidthById = buildContinuingGuidesWidthById(dataSource, expandedRowKeys)

    const columnsLength = (fields?.length ?? 0) + controlColumns.length
    const dataColumns =
        fields?.map((field, index) => {
            const listField = field as WidgetListField
            const isFirstColumn = index === 0

            return {
                title: (
                    <TreeTableColumnTitle
                        showCloseButton={showCloseButton}
                        hideColumn={hideColumn}
                        field={listField}
                        rowMeta={rowMetaFields?.find(item => item.key === field.key)}
                        widgetName={widget.name}
                        showSelection={isFirstColumn && showSelection}
                        selectNode={selectNode}
                        getNodeSelectionState={getNodeSelectionState}
                    />
                ),
                key: field.key,
                dataIndex: field.key,
                width: field.width,
                render: (text: string, dataItem: T) => {
                    const cellElement = (
                        <TreeTableCell
                            disableRowExpand={disableRowExpand}
                            field={listField}
                            dataItem={dataItem as T & TableTreeNode}
                            isFirstColumn={isFirstColumn}
                            isGroupingHierarchy={isGroupingHierarchy}
                            showSelection={showSelection}
                            widget={widget}
                            expandedRowKeys={expandedRowKeys}
                            selectNode={selectNode}
                            getNodeSelectionState={getNodeSelectionState}
                            handleExpand={handleExpand}
                            createFetchNodesHandler={createFetchNodesHandler}
                            restoreAncestorPaths={restoreAncestorPaths}
                            isEditMode={isEditMode}
                        />
                    )

                    if (PSEUDO_ROW_TYPES.includes(dataItem._recordType)) {
                        if (isFirstColumn) {
                            return { props: { colSpan: columnsLength }, children: cellElement }
                        }

                        return { props: { colSpan: 0 }, children: null }
                    }

                    return cellElement
                },
                onCell: (dataItem: T) =>
                    isFirstColumn
                        ? {
                              className: styles.treeLevelCell,
                              style: {
                                  '--tree-level': (dataItem as T & TableTreeNode)._level ?? 0,
                                  '--tree-continuing-guides-width': continuingGuidesWidthById.get(String(dataItem.id)) ?? '0px'
                              } as TreeLevelCellStyle
                          }
                        : {},
                onHeaderCell: () => ({
                    'data-test-widget-tree-header-column-title': field.title,
                    'data-test-widget-tree-header-column-type': field.type,
                    'data-test-widget-tree-header-column-key': field.key
                })
            }
        }) ?? []

    const leftColumns: Array<ColumnProps<T>> = []
    const rightColumns: Array<ColumnProps<T>> = []

    controlColumns.forEach(({ position, column }) => {
        const target = position === 'left' ? leftColumns : rightColumns
        target.push({
            ...column,
            onCell: (record: T, rowIndex: number) =>
                PSEUDO_ROW_TYPES.includes(record._recordType) ? { colSpan: 0 } : column.onCell?.(record, rowIndex) ?? {}
        })
    })

    return [...leftColumns, ...dataColumns, ...rightColumns]
}
