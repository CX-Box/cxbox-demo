import React, { ReactNode, useCallback, useMemo } from 'react'
import { TableProps as AntdTableProps } from 'antd/es/table'
import { TableEventListeners } from 'antd/lib/table/interface'
import { actions } from '@actions'
import Operations from '@components/Operations/Operations'
import { RESTORE_ANCESTORS_ID, ROW_KEY } from '@components/widgets/Table/constants'
import StandardTable from '@components/widgets/Table/StandardTable'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { TableTreeNode, useTableTree } from '@components/widgets/Table/tree/hooks/useTableTree'
import { useTreeRowSelection } from '@components/widgets/Table/tree/hooks/useTreeRowSelection'
import { buildTreeTableColumns } from '@components/widgets/Table/tree/utils/buildTreeTableColumns'
import { useWidgetPaginationLimit } from '@features/pagination/hooks/useWidgetPaginationLimit'
import { useRowMetaWithCache } from '@hooks/useRowMetaWithCache'
import { AppWidgetGroupingHierarchyMeta, AppWidgetTableMeta } from '@interfaces/widget'
import { selectBc, selectBcTree } from '@selectors/selectors'
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
import { Lookup } from '@utils/Lookup'
import { TREE_SEARCH_MODES } from '@constants/tree'

interface TreeTableProps<T extends CustomDataItem> extends AntdTableProps<T> {
    meta: AppWidgetTableMeta | AppWidgetGroupingHierarchyMeta
    treeRowSelection?: ReturnType<typeof useTreeRowSelection>
    disableRowSelection?: boolean
    settingsComponent?: ReactNode
}

function TreeTable<T extends CustomDataItem>({
    meta: widget,
    onRow,
    rowSelection,
    treeRowSelection,
    disableRowSelection = true,
    rowClassName,
    settingsComponent: outerSettingsComponent,
    ...rest
}: TreeTableProps<T>) {
    const { bcName, name: widgetName } = widget
    const bc = useAppSelector(state => selectBc(state, bcName))
    const dispatch = useDispatch()
    const bcRowMeta = useRowMetaWithCache(bcName, true)
    const parentRef = React.useRef()
    const currentSearchMode = useAppSelector(state => selectBcTree(state, bcName)?.searchMode)

    const { dataSource, handleExpand, expandedRowKeys, createFetchNodesHandler, restoreAncestorPaths, filterActive } = useTableTree(widget)
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

    const controlColumns = useMemo(() => {
        return []
    }, [])

    const { resultedFields } = useTableSettingResultedFields(widget, blockedFields)

    const handleHeaderRow = useCallback(() => {
        return {
            'data-test-widget-tree-header': true,
            onDoubleClick: showColumnSettings ? closeButton.toggleVisibility : undefined
        }
    }, [showColumnSettings, closeButton?.toggleVisibility])

    const handleRow = React.useCallback(
        (record: T, index: number) => {
            const treeRecord = record as T & TableTreeNode
            const tableEventListeners: TableEventListeners = {
                onClick: event => {
                    if (event.defaultPrevented || treeRecord._recordType !== 'node') {
                        return
                    }

                    const selection = window.getSelection()
                    if ((selection === null || selection.type !== 'Range') && record.id !== bc?.cursor) {
                        dispatch(actions.bcSelectRecord({ bcName: bc?.name as string, cursor: record.id }))
                    }
                }
            }

            return {
                ...tableEventListeners,
                ...onRow?.(record, index),
                'data-test-widget-tree-row-id': record.id,
                'data-test-widget-tree-row-type': treeRecord._recordType === 'node' ? 'Row' : 'PseudoRow',
                'data-record-type': treeRecord._recordType
            } as TableEventListeners
        },
        [bc?.cursor, bc?.name, dispatch, onRow]
    )

    const { allFields, currentAdditionalFields, changeOrder, changeColumnsVisibility } = useTableSetting(
        widget,
        blockedFields,
        rowSelection?.type,
        controlColumns
    )

    const hideColumn = useCallback((fieldKey: string) => changeColumnsVisibility([fieldKey], false), [changeColumnsVisibility])

    const { saveCurrentFiltersAsGroup, filterGroups, removeFilterGroup, filtersExist } = usePresetFilterSettings(bcName)

    const handleSaveFilterGroup = useCallback(
        (values: { name: string }) => {
            saveCurrentFiltersAsGroup(values.name)
        },
        [saveCurrentFiltersAsGroup]
    )

    const exportConfig = widget.options?.export
    const showExport = exportConfig?.enabled
    const showSaveFiltersButton = widget.options?.filterSetting?.enabled
    const showPaginationLimit = !hideLimitOptions
    const showSettings = showSaveFiltersButton || showColumnSettings || showExport || showPaginationLimit

    const { exportTable } = useExportTable({
        bcName: bcName,
        fields: resultedFields,
        title: exportConfig?.title ?? widget.title
    })

    const handleChangeSearchMode = useCallback(
        (searchMode: string) => {
            if (!Lookup.has(TREE_SEARCH_MODES, searchMode) || searchMode === currentSearchMode) {
                return
            }

            dispatch(treeActions.changeSearchMode({ bcName, searchMode }))
            dispatch(treeActions.initTree({ bcName, reset: true }))
            dispatch(actions.bcRemoveAllFilters({ bcName }))
            dispatch(actions.bcForceUpdate({ bcName }))
        },
        [bcName, currentSearchMode, dispatch]
    )

    const settings =
        outerSettingsComponent || showSettings ? (
            <TableSettings
                showSearchMode={true}
                searchMode={currentSearchMode}
                onChangeSearchMode={handleChangeSearchMode}
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
                showCloseButton: closeButton.visibility,
                hideColumn: hideColumn,
                fields: resultedFields,
                widget,
                rowMetaFields: bcRowMeta?.fields,
                expandedRowKeys,
                showSelection: !disableRowSelection,
                selectNode,
                getNodeSelectionState,
                handleExpand,
                createFetchNodesHandler,
                restoreAncestorPaths
            }),
        [
            bcRowMeta?.fields,
            closeButton.visibility,
            createFetchNodesHandler,
            currentSearchMode,
            disableRowSelection,
            expandedRowKeys,
            filterActive,
            getNodeSelectionState,
            handleExpand,
            hideColumn,
            restoreAncestorPaths,
            resultedFields,
            selectNode,
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
                expandedRowKeys={[RESTORE_ANCESTORS_ID, ...expandedRowKeys]}
                wrapperRef={parentRef as any}
                widgetName={widgetName}
                onColumnDragEnd={showColumnSettings ? changeOrder : undefined}
                columns={columns}
                dataSource={dataSource as unknown as T[]}
                rowKey={ROW_KEY}
                expandIconColumnIndex={-1}
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
