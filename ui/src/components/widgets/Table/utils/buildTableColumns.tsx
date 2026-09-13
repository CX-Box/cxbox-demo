import React from 'react'
import { ColumnProps } from 'antd/es/table'
import { WidgetListField } from '@cxbox-ui/schema'
import ColumnTitle from '@components/ColumnTitle/ColumnTitle'
import { GroupingHierarchyCommonNode } from '@components/widgets/Table/groupingHierarchy'
import { ControlColumn, CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { TableCell } from '@components/widgets/Table/TableCell'
import { AppWidgetGroupingHierarchyMeta, AppWidgetTableMeta, CustomWidgetTypes } from '@interfaces/widget'
import { RowMetaField } from '@interfaces/rowMeta'

interface BuildTableColumnsParams<T extends CustomDataItem> {
    fields: WidgetListField[] | undefined
    rowMetaFields: RowMetaField[] | undefined
    meta: AppWidgetTableMeta | AppWidgetGroupingHierarchyMeta
    controlColumns: Array<ControlColumn<T>>
    showCloseButton: boolean
    enabledGrouping: boolean
    sortedGroupKeys: string[]
    expandedParentRowKeys: string[]
    groupingHierarchyModeAggregate: boolean
    bcName: string
    widgetName: string
    hideColumn: (fieldKey: string) => void
    isEditMode: (record: T) => boolean
    needHideActions: (record: T) => boolean | undefined
    onParentExpand: (expanded: boolean, expandRowId: string) => void
}

export function buildTableColumns<T extends CustomDataItem>({
    fields,
    rowMetaFields,
    meta,
    controlColumns,
    showCloseButton,
    enabledGrouping,
    sortedGroupKeys,
    expandedParentRowKeys,
    groupingHierarchyModeAggregate,
    bcName,
    widgetName,
    hideColumn,
    isEditMode,
    needHideActions,
    onParentExpand
}: BuildTableColumnsParams<T>): Array<ColumnProps<T>> {
    const isGroupingHierarchy = (meta.type as string) === CustomWidgetTypes.GroupingHierarchy
    const dataColumns =
        fields?.map(item => {
            const fieldRowMeta = rowMetaFields?.find(field => field.key === item.key)
            const isGroupingField = !!meta.options?.groupingHierarchy?.fields?.includes(item.key)

            return {
                title: (
                    <ColumnTitle
                        showCloseButton={isGroupingHierarchy ? !isGroupingField && showCloseButton : showCloseButton}
                        onClose={hideColumn}
                        widgetName={widgetName}
                        widgetMeta={item}
                        rowMeta={fieldRowMeta}
                    />
                ),
                key: item.key,
                dataIndex: item.key,
                width: item.width,
                render: (text: string, dataItem: T & GroupingHierarchyCommonNode) => (
                    <TableCell
                        item={item}
                        dataItem={dataItem}
                        isGroupingHierarchy={isGroupingHierarchy}
                        enabledGrouping={enabledGrouping}
                        isEditMode={isEditMode}
                        needHideActions={needHideActions}
                        sortedGroupKeys={sortedGroupKeys}
                        expandedParentRowKeys={expandedParentRowKeys}
                        groupingHierarchyModeAggregate={groupingHierarchyModeAggregate}
                        processedMeta={meta}
                        bcName={bcName}
                        widgetName={widgetName}
                        onParentExpand={onParentExpand}
                    />
                ),
                onHeaderCell: () => ({
                    'data-test-widget-list-header-column-title': item.title,
                    'data-test-widget-list-header-column-type': item.type,
                    'data-test-widget-list-header-column-key': item.key
                })
            }
        }) ?? []

    const leftColumns: Array<ColumnProps<T>> = []
    const rightColumns: Array<ColumnProps<T>> = []

    controlColumns.forEach(item => {
        const target = item.position === 'left' ? leftColumns : rightColumns
        target.push(item.column)
    })

    return [...leftColumns, ...dataColumns, ...rightColumns]
}
