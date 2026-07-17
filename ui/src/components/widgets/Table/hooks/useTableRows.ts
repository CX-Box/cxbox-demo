import { useCallback, useMemo } from 'react'
import { TableProps as AntdTableProps } from 'antd/es/table'
import { ExpandIconProps } from 'antd/lib/table'
import { TableEventListeners } from 'antd/lib/table/interface'
import { DataItem, FieldType } from '@cxbox-ui/core'
import { actions } from '@actions'
import { fieldShowCondition, rowShowCondition } from '@components/widgets/Table/groupingHierarchy'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { useRowMenu } from '@hooks/useRowMenu'
import { selectBc } from '@selectors/selectors'
import { useAppSelector } from '@store'
import { useDispatch } from 'react-redux'
import { WidgetListField } from '@cxbox-ui/schema'

interface UseTableRowsParams<T extends CustomDataItem> {
    widgetName: string
    bcName: string
    isGroupingHierarchy?: boolean
    enabledGrouping: boolean
    enabledMassMode: boolean
    selectEditableRow: boolean
    allowEdit: boolean
    groupingHierarchyModeAggregate: boolean
    fields: WidgetListField[] | undefined
    sortedGroupKeys: string[]
    expandedParentRowKeys: string[]
    expandedRowId: string | undefined
    tree: T[]
    bcData: T[] | undefined
    expandIcon: AntdTableProps<T>['expandIcon']
    getGroupingRowKeyByRecordId: (id: string | undefined) => string | undefined
    onRow: AntdTableProps<T>['onRow']
}

export function useTableRows<T extends CustomDataItem>({
    widgetName,
    bcName,
    isGroupingHierarchy,
    enabledGrouping,
    enabledMassMode,
    selectEditableRow,
    allowEdit,
    groupingHierarchyModeAggregate,
    fields,
    sortedGroupKeys,
    expandedParentRowKeys,
    expandedRowId,
    tree,
    bcData,
    expandIcon,
    getGroupingRowKeyByRecordId,
    onRow
}: UseTableRowsParams<T>) {
    const dispatch = useDispatch()
    const bc = useAppSelector(selectBc(bcName))
    const selectedRow = useAppSelector(state => state.view.selectedRow)
    const [operationsRef, parentRef, handleRowMenu] = useRowMenu()

    const expandedRowKeys = useMemo(() => {
        if (!enabledGrouping) {
            return expandedRowId ? [expandedRowId, ...expandedParentRowKeys] : expandedParentRowKeys
        }

        const expandedGroupingRowKey = getGroupingRowKeyByRecordId(expandedRowId)
        return expandedGroupingRowKey && !expandedParentRowKeys.includes(expandedGroupingRowKey)
            ? [expandedGroupingRowKey, ...expandedParentRowKeys]
            : expandedParentRowKeys
    }, [enabledGrouping, expandedParentRowKeys, expandedRowId, getGroupingRowKeyByRecordId])

    const needHideActions = useCallback(
        (record: T) => {
            const firstDataField = fields
                ?.filter(item => item.type !== FieldType.hidden && !item.hidden)
                .find(field => !sortedGroupKeys.includes(field.key))

            return (
                isGroupingHierarchy &&
                (!(
                    fieldShowCondition(firstDataField?.key as string, record, sortedGroupKeys, expandedRowKeys) ||
                    typeof record._groupLevel !== 'number'
                ) ||
                    (groupingHierarchyModeAggregate && typeof record._groupLevel === 'number'))
            )
        },
        [expandedRowKeys, fields, groupingHierarchyModeAggregate, isGroupingHierarchy, sortedGroupKeys]
    )

    const needHideRow = useCallback(
        (record: T) => isGroupingHierarchy && enabledGrouping && !rowShowCondition(record, sortedGroupKeys, expandedParentRowKeys),
        [enabledGrouping, expandedParentRowKeys, isGroupingHierarchy, sortedGroupKeys]
    )

    const handleRow = useCallback(
        (record: T, index: number) => {
            const tableEventListeners = {
                ...handleRowMenu(record as DataItem),
                onClick: event => {
                    if (event.defaultPrevented || enabledMassMode) {
                        return
                    }

                    const selection = window.getSelection()
                    if (selection !== null && selection.type === 'Range') {
                        return
                    }

                    if (selectEditableRow && record.id !== selectedRow?.rowId) {
                        dispatch(actions.selectTableRowInit({ widgetName, rowId: record.id }))
                    } else if (!selectEditableRow && record.id !== bc?.cursor) {
                        dispatch(actions.bcSelectRecord({ bcName: bc?.name as string, cursor: record.id }))
                    }
                }
            } as TableEventListeners
            const rowProperties: Record<string, unknown> = {
                'data-test-widget-list-row-id': record.id,
                'data-test-widget-list-row-type': typeof record._groupLevel === 'number' ? 'GroupingRow' : 'Row'
            }

            if (needHideActions(record)) {
                Object.keys(tableEventListeners).forEach(key => {
                    delete tableEventListeners[key as keyof TableEventListeners]
                })
            }

            if (needHideRow(record)) {
                rowProperties.style = { display: 'none' }
            }

            return {
                ...tableEventListeners,
                ...onRow?.(record, index),
                ...rowProperties
            } as TableEventListeners
        },
        [
            bc?.cursor,
            bc?.name,
            dispatch,
            enabledMassMode,
            handleRowMenu,
            needHideActions,
            needHideRow,
            onRow,
            selectEditableRow,
            selectedRow?.rowId,
            widgetName
        ]
    )

    const resultExpandIcon = useCallback(
        (props: ExpandIconProps<T>) => (!needHideActions(props.record) ? expandIcon?.(props) : null),
        [expandIcon, needHideActions]
    )

    const isEditMode = useCallback(
        (record: T) =>
            allowEdit &&
            selectedRow !== null &&
            widgetName === selectedRow.widgetName &&
            record.id === selectedRow.rowId &&
            bc?.cursor === selectedRow.rowId,
        [allowEdit, bc?.cursor, selectedRow, widgetName]
    )

    return {
        operationsRef,
        parentRef,
        expandedRowKeys,
        handleRow,
        needHideActions,
        resultExpandIcon,
        isEditMode,
        dataSource: enabledGrouping ? tree : bcData
    }
}
