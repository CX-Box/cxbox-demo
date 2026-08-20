import React from 'react'
import { ColumnProps } from 'antd/es/table'
import { WidgetListField } from '@cxbox-ui/schema'
import { TreeTableCell } from '@components/widgets/Table/components/TreeTableCell'
import { TreeTableColumnTitle } from '@components/widgets/Table/components/TreeTableColumnTitle'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { TableTreeNode, useTableTree } from '@components/widgets/Table/tree/hooks/useTableTree'
import { useTreeRowSelection } from '@components/widgets/Table/tree/hooks/useTreeRowSelection'
import { AppWidgetGroupingHierarchyMeta, AppWidgetTableMeta, CustomWidgetTypes } from '@interfaces/widget'
import { RowMetaField } from '@interfaces/rowMeta'

interface BuildTreeTableColumnsParams {
    fields: AppWidgetTableMeta['fields']
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
}

export function buildTreeTableColumns<T extends CustomDataItem>({
    widget,
    fields,
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
    disableRowExpand
}: BuildTreeTableColumnsParams): Array<ColumnProps<T>> {
    const isGroupingHierarchy = (widget.type as string) === CustomWidgetTypes.GroupingHierarchy

    return (
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
                render: (text: string, dataItem: T) => (
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
                    />
                ),
                onHeaderCell: () => ({
                    'data-test-widget-tree-header-column-title': field.title,
                    'data-test-widget-tree-header-column-type': field.type,
                    'data-test-widget-tree-header-column-key': field.key
                })
            }
        }) ?? []
    )
}
