import React, { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { TableProps as AntdTableProps } from 'antd/es/table'
import { actions } from '@actions'
import Operations from '@components/Operations/Operations'
import { RESTORE_ANCESTORS_ID, ROW_KEY, UNALLOCATED_NODES_ID } from '@components/widgets/Table/constants'
import StandardTable from '@components/widgets/Table/StandardTable'
import { ControlColumn, CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { useExpandableForm } from '@components/widgets/Table/hooks/useExpandableForm'
import { useTableRows } from '@components/widgets/Table/hooks/useTableRows'
import { TableTreeNode, useTableTree } from '@components/widgets/Table/tree/hooks/useTableTree'
import { useTreeRowSelection } from '@components/widgets/Table/tree/hooks/useTreeRowSelection'
import { buildTreeTableColumns } from '@components/widgets/Table/tree/utils/buildTreeTableColumns'
import { useWidgetPaginationLimit } from '@features/pagination/hooks/useWidgetPaginationLimit'
import { useRowMetaWithCache } from '@hooks/useRowMetaWithCache'
import { AppWidgetGroupingHierarchyMeta, AppWidgetTableMeta } from '@interfaces/widget'
import type { TreeSearchModes } from '@interfaces/widget'
import { selectBcTree } from '@selectors/selectors'
import { useAppSelector } from '@store'
import { useDispatch } from 'react-redux'
import styles from './Table.less'
import ColumnOrderSettingModal from '@components/widgets/Table/components/ColumnOrderSettingModal'
import FilterSettingModal from '@components/widgets/Table/components/FilterSettingModal'
import { useVisibility } from '@hooks/useVisibility'
import { useTableSetting, useTableSettingReset, useTableSettingResultedFields } from '@components/widgets/Table/hooks/useTableSetting'
import { usePresetFilterSettings } from '@components/widgets/Table/hooks/usePresetFilterSettings'
import TableSettings from '@components/widgets/Table/components/TableSettings'
import { useExportTable } from '@components/widgets/Table/hooks/useExportTable'
import { treeActions } from '@slices/tree'
import { normalizeTreeSearchModes } from '@constants/tree'
import { isDefined } from '@utils/isDefined'

interface TreeTableProps<T extends CustomDataItem> extends AntdTableProps<T> {
    meta: AppWidgetTableMeta | AppWidgetGroupingHierarchyMeta
    treeRowSelection?: ReturnType<typeof useTreeRowSelection>
    disableRowSelection?: boolean
    settingsComponent?: ReactNode
    hideRowActions?: boolean
    disableCellEdit?: boolean
}

function TreeTable<T extends CustomDataItem>({
    meta: widget,
    onRow,
    rowSelection,
    treeRowSelection,
    disableRowSelection = true,
    rowClassName,
    settingsComponent: outerSettingsComponent,
    hideRowActions,
    disableCellEdit = false,
    ...rest
}: TreeTableProps<T>) {
    const { bcName, name: widgetName } = widget
    const dispatch = useDispatch()
    const bcRowMeta = useRowMetaWithCache(bcName, true)
    const searchModes = useMemo(() => normalizeTreeSearchModes(widget.options?.tree?.searchModes), [widget.options?.tree?.searchModes])
    const currentSearchMode = useAppSelector(state => selectBcTree(state, bcName)?.searchMode) ?? searchModes[0]

    const {
        dataSource: treeDataSource,
        handleExpand: handleTreeExpandBase,
        expandedRowKeys: treeExpandedRowKeys,
        createFetchNodesHandler,
        restoreAncestorPaths,
        filterActive
    } = useTableTree(widget)
    const {
        expandable,
        onExpand: onFormExpand,
        expandIcon,
        expandIconColumn,
        getExpandIconColumnIndex,
        expandedRowRender,
        expandedRowId
    } = useExpandableForm<T>(widget)
    const defaultTreeRowSelection = useTreeRowSelection(widgetName)
    const { selectNode, getNodeSelectionState } = treeRowSelection ?? defaultTreeRowSelection
    const { changePageLimit, hideLimitOptions, value: pageLimit, options } = useWidgetPaginationLimit(widget)
    const showColumnSettings = !!widget?.options?.additional?.enabled
    const resetSetting = useTableSettingReset(widget)
    const firstColumn = widget?.fields?.[0] ?? undefined
    const blockedFields = firstColumn.key ? [] : []

    const closeButton = useVisibility(false)
    const transfer = useVisibility(false)
    const filterSetting = useVisibility(false)

    const controlColumns = useMemo<Array<ControlColumn<T>>>(
        () => (expandIconColumn ? [{ column: expandIconColumn, position: 'right' }] : []),
        [expandIconColumn]
    )

    const { resultedFields } = useTableSettingResultedFields(widget, blockedFields)

    const isNode = useCallback((record: T) => (record as T & TableTreeNode)._recordType === 'node', [])
    const treeOnRow = useCallback(
        (record: T, index: number) => {
            const treeRecord = record as T & TableTreeNode

            return {
                ...onRow?.(record, index),
                'data-test-widget-tree-row-id': record.id,
                'data-test-widget-tree-row-type': isNode(record) ? 'Row' : 'PseudoRow',
                'data-record-type': treeRecord._recordType,
                'data-hidden-tree-row': treeRecord._recordType === 'restore-ancestors' && !treeRecord._separatorText
            }
        },
        [isNode, onRow]
    )
    const getGroupingRowKeyByRecordId = useCallback(() => undefined, [])
    const needRowSelectRecord = !expandable && widget.options?.readOnly !== true && widget.options?.edit?.style !== 'none'
    const isAllowEdit = !expandable && !widget.options?.readOnly && !disableCellEdit
    const { operationsRef, parentRef, expandedRowKeys, handleRow, resultExpandIcon, isEditMode } = useTableRows<T>({
        widgetName,
        bcName,
        enabledGrouping: false,
        enabledMassMode: false,
        selectEditableRow: needRowSelectRecord,
        allowEdit: isAllowEdit,
        groupingHierarchyModeAggregate: false,
        fields: resultedFields,
        sortedGroupKeys: [],
        expandedParentRowKeys: [UNALLOCATED_NODES_ID, RESTORE_ANCESTORS_ID, ...treeExpandedRowKeys],
        expandedRowId,
        tree: treeDataSource as unknown as T[],
        bcData: treeDataSource as unknown as T[],
        expandIcon,
        getGroupingRowKeyByRecordId,
        onRow: treeOnRow,
        isInteractiveRow: isNode
    })

    const handleTreeExpand = useCallback(
        (expanded: boolean, record: CustomDataItem) => {
            if (!expanded && record.id === expandedRowId) {
                onFormExpand?.(false, record as T)
            }
            handleTreeExpandBase(expanded, record)
        },
        [expandedRowId, handleTreeExpandBase, onFormExpand]
    )

    const handleHeaderRow = useCallback(() => {
        return {
            'data-test-widget-tree-header': true,
            onDoubleClick: showColumnSettings ? closeButton.toggleVisibility : undefined
        }
    }, [showColumnSettings, closeButton?.toggleVisibility])

    const { allFields, currentAdditionalFields, changeOrder, changeColumnsVisibility } = useTableSetting(
        widget,
        blockedFields,
        rowSelection?.type,
        controlColumns
    )

    const hideColumn = useCallback((fieldKey: string) => changeColumnsVisibility([fieldKey], false), [changeColumnsVisibility])

    const { saveCurrentFiltersAsGroup, filterGroups, removeFilterGroup, filtersExist } = usePresetFilterSettings(bcName)

    const restoreAncestorsNode = useMemo(() => treeDataSource.find(node => node._recordType === 'restore-ancestors'), [treeDataSource])
    const restoreAllPaths = useCallback(
        () => restoreAncestorPaths(restoreAncestorsNode?.children?.map(node => node._treeParentId).filter(isDefined) ?? []),
        [restoreAncestorPaths, restoreAncestorsNode]
    )

    const handleSaveFilterGroup = useCallback(
        (values: { name: string }) => {
            saveCurrentFiltersAsGroup(values.name)
        },
        [saveCurrentFiltersAsGroup]
    )

    const exportConfig = widget.options?.export
    const showExport = false ?? exportConfig?.enabled
    useEffect(() => {
        if (exportConfig?.enabled) {
            console.log(
                `"${widget.type}" "${widget.name}": options.export is not supported yet - Excel export for Tree-like widgets will be supported soon.`
            )
        }
    }, [exportConfig?.enabled, widget.name, widget.type])

    const showSaveFiltersButton = widget.options?.filterSetting?.enabled
    const showPaginationLimit = !hideLimitOptions
    const showSettings =
        showSaveFiltersButton || showColumnSettings || showExport || showPaginationLimit || searchModes.length > 0 || !!restoreAncestorsNode

    const { exportTable } = useExportTable({
        bcName: bcName,
        fields: resultedFields,
        title: exportConfig?.title ?? widget.title
    })

    const handleChangeSearchMode = useCallback(
        (searchMode: TreeSearchModes) => {
            if (!searchModes.includes(searchMode) || searchMode === currentSearchMode) {
                return
            }

            dispatch(treeActions.changeSearchMode({ bcName, searchMode }))
            dispatch(actions.bcForceUpdate({ bcName }))
        },
        [bcName, currentSearchMode, dispatch, searchModes]
    )

    const settings =
        outerSettingsComponent || showSettings ? (
            <TableSettings
                showSearchMode={true}
                searchMode={currentSearchMode}
                searchModes={searchModes}
                onChangeSearchMode={handleChangeSearchMode}
                showRestorePath={!!restoreAncestorsNode}
                onRestoreAllPaths={restoreAllPaths}
                customSettings={outerSettingsComponent}
                showSettings={showSettings}
                showColumnSettings={showColumnSettings}
                showExport={showExport}
                showSaveFiltersButton={showSaveFiltersButton}
                enabledGrouping={false}
                isGroupingHierarchy={false}
                isIncorrectLimit={false}
                bcPageLimit={0}
                bcCountForShowing={0}
                showUp={false}
                onChangeColumns={transfer.toggleVisibility}
                onResetColumns={resetSetting}
                onExport={exportTable}
                onSaveFilters={filterSetting.toggleVisibility}
                onCollapseAll={() => false}
                onChangeGroupingMode={() => false}
                onScrollToTop={() => false}
                showPaginationLimit={showPaginationLimit}
                availableLimitsList={options}
                paginationLimit={pageLimit}
                onChangePaginationLimit={changePageLimit}
            />
        ) : null

    const columns = React.useMemo(
        () =>
            buildTreeTableColumns<T>({
                disableRowExpand: currentSearchMode === 'hide' && filterActive,
                dataSource: treeDataSource as TableTreeNode[],
                showCloseButton: closeButton.visibility,
                hideColumn: hideColumn,
                fields: resultedFields,
                widget,
                rowMetaFields: bcRowMeta?.fields,
                expandedRowKeys,
                showSelection: !disableRowSelection,
                selectNode,
                getNodeSelectionState,
                handleExpand: handleTreeExpand,
                createFetchNodesHandler,
                restoreAncestorPaths,
                controlColumns,
                isEditMode
            }),
        [
            bcRowMeta?.fields,
            closeButton.visibility,
            createFetchNodesHandler,
            currentSearchMode,
            controlColumns,
            disableRowSelection,
            expandedRowKeys,
            filterActive,
            getNodeSelectionState,
            handleTreeExpand,
            hideColumn,
            isEditMode,
            restoreAncestorPaths,
            resultedFields,
            selectNode,
            treeDataSource,
            widget
        ]
    )

    const getRowClassName = React.useCallback(
        (record: T, index: number) => {
            const originalClassName = rowClassName?.(record, index)
            const filterMatchClassName = (record as unknown as TableTreeNode)._matchesFilter ? styles.treeFilterMatch : ''

            return [originalClassName, filterMatchClassName].filter(Boolean).join(' ')
        },
        [rowClassName]
    )

    return (
        <div className={styles.tableContainer}>
            <div className={styles.operations}>
                <Operations operations={bcRowMeta?.actions} bcName={bcName} widgetMeta={widget} />
            </div>
            <StandardTable<T>
                operationsRef={operationsRef as any}
                expandedRowKeys={expandedRowKeys}
                wrapperRef={parentRef as any}
                widgetName={widgetName}
                onColumnDragEnd={showColumnSettings ? changeOrder : undefined}
                columns={columns}
                dataSource={treeDataSource as unknown as T[]}
                rowKey={ROW_KEY}
                expandIconColumnIndex={getExpandIconColumnIndex(controlColumns, resultedFields, rowSelection?.type)}
                expandIcon={resultExpandIcon}
                expandedRowRender={record => (isNode(record) ? expandedRowRender?.(record) : null)}
                onExpand={(expanded, record) => {
                    if (isNode(record)) {
                        onFormExpand?.(expanded, record)
                    }
                }}
                hideRowActions={hideRowActions}
                hidePagination={true}
                indentSize={0}
                rowSelection={rowSelection}
                rowClassName={getRowClassName}
                onRow={handleRow}
                settingsRender={settings}
                onHeaderRow={handleHeaderRow}
                {...rest}
            />

            <ColumnOrderSettingModal
                visible={transfer.visibility}
                onCancel={transfer.toggleVisibility}
                dataSource={allFields}
                targetKeys={currentAdditionalFields}
                onChange={changeColumnsVisibility}
            />

            <FilterSettingModal
                filtersExist={filtersExist}
                onDelete={removeFilterGroup}
                filterGroups={filterGroups}
                visible={filterSetting.visibility}
                onCancel={filterSetting.toggleVisibility}
                onSubmit={handleSaveFilterGroup}
            />
        </div>
    )
}

export default React.memo(TreeTable) as typeof TreeTable
