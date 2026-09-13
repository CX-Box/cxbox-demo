import React, { ReactNode, useCallback, useMemo } from 'react'
import { TableProps as AntdTableProps } from 'antd/es/table'
import { useExpandableForm } from './hooks/useExpandableForm'
import styles from './Table.less'
import { AppWidgetGroupingHierarchyMeta, AppWidgetTableMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { useTableSetting, useTableSettingReset, useTableSettingResultedFields } from '@components/widgets/Table/hooks/useTableSetting'
import { useVisibility } from '@hooks/useVisibility'
import { useTranslation } from 'react-i18next'
import { useExportTable } from '@components/widgets/Table/hooks/useExportTable'
import Operations from '../../Operations/Operations'
import FilterSettingModal from './components/FilterSettingModal'
import { usePresetFilterSettings } from './hooks/usePresetFilterSettings'
import { DataItem, IdItemResponse } from '@cxbox-ui/core'
import { ControlColumn, CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { getGroupingHierarchyRowKey, useGroupingHierarchy } from '@components/widgets/Table/groupingHierarchy'
import { selectBcData } from '@selectors/selectors'
import ColumnOrderSettingModal from '@components/widgets/Table/components/ColumnOrderSettingModal'
import StandardTable from '@components/widgets/Table/StandardTable'
import MassLayout from '@components/widgets/Table/massOperations/Layout'
import { useRowSelection } from '@components/widgets/Table/massOperations/hooks/useRowSelection'
import ResultColumnTitle from '@components/widgets/Table/massOperations/ColumnTitle'
import { FIELDS } from '@constants'
import { useRowMetaWithCache } from '@hooks/useRowMetaWithCache'
import ResultColumnCell from '@components/widgets/Table/massOperations/ResultColumnCell'
import StickyTable from '@components/widgets/Table/StickyTable'
import { ROW_KEY } from '@components/widgets/Table/constants'
import TableSettings from '@components/widgets/Table/components/TableSettings'
import { buildTableColumns } from '@components/widgets/Table/utils/buildTableColumns'
import { useTableRows } from '@components/widgets/Table/hooks/useTableRows'

interface TableProps<T extends CustomDataItem> extends AntdTableProps<T> {
    meta: AppWidgetTableMeta | AppWidgetGroupingHierarchyMeta
    primaryColumn?: ControlColumn<T>
    disablePagination?: boolean
    hideRowActions?: boolean
    disableCellEdit?: boolean
    disableMassMode?: boolean
    isGroupingHierarchy?: boolean
    settingsComponent?: ReactNode
}

function Table<T extends CustomDataItem>({
    meta: unprocessedMeta,
    isGroupingHierarchy,
    primaryColumn,
    disablePagination,
    hideRowActions: hideRowActionsExternal = false,
    disableCellEdit = false,
    disableMassMode = false,
    onRow,
    settingsComponent: outerSettingsComponent,
    ...rest
}: TableProps<T>) {
    const { t } = useTranslation()
    const { bcName, name: widgetName } = unprocessedMeta
    const bcRowMeta = useRowMetaWithCache(bcName, true)
    const bcData = useAppSelector(selectBcData(bcName)) as T[] | undefined
    const groupingHierarchyModeAggregate = !!(
        unprocessedMeta.options?.groupingHierarchy?.aggFields || unprocessedMeta.options?.groupingHierarchy?.aggLevels
    )

    const closeButton = useVisibility(false)
    const transfer = useVisibility(false)
    const filterSetting = useVisibility(false)

    const enabledMassMode = useAppSelector(state => state.screen.viewerMode[bcName]?.mode === 'mass' && !disableMassMode)
    const step = useAppSelector(state => state.screen.viewerMode[bcName]?.step)

    const hideRowActions = hideRowActionsExternal || enabledMassMode

    const {
        enabledGrouping,
        expandedParentRowKeys,
        changeExpand: onParentExpand,
        clearExpand: clearParentExpand,
        sortedGroupKeys,
        tree,
        getGroupingHierarchyRowKeyByRecordId,
        tableContainerRef,
        setEnabledGrouping,
        sortFieldsByGroupKeys,
        isIncorrectLimit,
        bcCountForShowing,
        bcPageLimit,
        scrollToTop,
        showUp
    } = useGroupingHierarchy(unprocessedMeta as AppWidgetGroupingHierarchyMeta, isGroupingHierarchy)

    const processedMeta = useMemo(
        () => ({ ...unprocessedMeta, fields: sortFieldsByGroupKeys(unprocessedMeta.fields) }),
        [unprocessedMeta, sortFieldsByGroupKeys]
    )

    const { onExpand, expandable, expandIcon, expandIconColumn, getExpandIconColumnIndex, expandedRowRender, expandedRowId } =
        useExpandableForm<T>(processedMeta)

    const { selectedRows, selectedRowKeys, selectAll, select } = useRowSelection(widgetName)

    const selectedRowsDictionary = useMemo(() => {
        const selectedRowsDictionary: Record<string, Omit<DataItem, 'vstamp'>> = {}

        selectedRows?.forEach(row => {
            selectedRowsDictionary[row.id as string] = row
        })

        return selectedRowsDictionary
    }, [selectedRows])

    const showSaveFiltersButton = processedMeta.options?.filterSetting?.enabled

    const disabledCheckboxForMassMode = step !== 'Select rows'
    const showCheckboxForMassMode = (['Select rows', 'Review rows'] as (typeof step)[]).includes(step)

    const rowSelectionForMassMode: AntdTableProps<DataItem>['rowSelection'] = useMemo(
        () =>
            showCheckboxForMassMode
                ? {
                      type: 'checkbox',
                      selectedRowKeys,
                      onSelect: select,
                      onSelectAll: selectAll,
                      getCheckboxProps: () => ({
                          'data-test-widget-list-column-select': true,
                          disabled: disabledCheckboxForMassMode
                      })
                  }
                : undefined,
        [disabledCheckboxForMassMode, select, selectAll, selectedRowKeys, showCheckboxForMassMode]
    )

    const currentRowSelection = enabledMassMode ? rowSelectionForMassMode : rest.rowSelection
    const showColumnSettings = !!processedMeta?.options?.additional?.enabled
    const exportConfig = processedMeta.options?.export
    const showExport = exportConfig?.enabled
    const showSettings = showSaveFiltersButton || showColumnSettings || showExport || enabledGrouping || isGroupingHierarchy
    const resetSetting = useTableSettingReset(processedMeta)
    const { resultedFields } = useTableSettingResultedFields(processedMeta, sortedGroupKeys)
    const { exportTable } = useExportTable({
        bcName: bcName,
        fields: resultedFields,
        title: exportConfig?.title ?? processedMeta.title
    })

    const controlColumns = useMemo(() => {
        const resultColumns: Array<ControlColumn<T>> = []

        if (processedMeta.options?.primary?.enabled && primaryColumn) {
            resultColumns.push(primaryColumn as any)
        }

        if (expandIconColumn && !enabledMassMode) {
            resultColumns.push({
                column: expandIconColumn,
                position: 'right'
            })
        }

        if (enabledMassMode && step === 'View results') {
            resultColumns.push({
                column: {
                    title: (
                        <ResultColumnTitle
                            title={t('Result')}
                            widgetName={widgetName}
                            bcName={bcName}
                            filterable={true}
                            fieldName={FIELDS.TECHNICAL.ID}
                        />
                    ),
                    key: '_mass-result',
                    render: (text, record: Partial<IdItemResponse>) => (
                        <ResultColumnCell record={record} selectedRow={selectedRowsDictionary[record.id as string]} />
                    )
                },
                position: 'left'
            })
        }
        return [...resultColumns]
    }, [
        processedMeta.options?.primary?.enabled,
        primaryColumn,
        expandIconColumn,
        enabledMassMode,
        step,
        t,
        widgetName,
        bcName,
        selectedRowsDictionary
    ])

    const { allFields, currentAdditionalFields, changeOrder, changeColumnsVisibility } = useTableSetting(
        processedMeta,
        sortedGroupKeys,
        currentRowSelection?.type,
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

    // TODO the condition is necessary because of editable table cells inside the core, so that there would not be duplicated actions of record change
    const needRowSelectRecord = !expandable && processedMeta.options?.readOnly !== true && processedMeta.options?.edit?.style !== 'none'

    const isAllowEdit = !expandable && !processedMeta.options?.readOnly && !disableCellEdit && !enabledMassMode

    const { operationsRef, parentRef, expandedRowKeys, handleRow, needHideActions, resultExpandIcon, isEditMode, dataSource } =
        useTableRows<T>({
            widgetName,
            bcName,
            isGroupingHierarchy,
            enabledGrouping,
            enabledMassMode,
            selectEditableRow: needRowSelectRecord,
            allowEdit: isAllowEdit,
            groupingHierarchyModeAggregate,
            fields: resultedFields,
            sortedGroupKeys,
            expandedParentRowKeys,
            expandedRowId,
            tree: tree as T[],
            bcData,
            expandIcon,
            getGroupingRowKeyByRecordId: getGroupingHierarchyRowKeyByRecordId,
            onRow
        })

    const settings =
        outerSettingsComponent || showSettings ? (
            <TableSettings
                customSettings={outerSettingsComponent}
                showSettings={showSettings}
                showColumnSettings={showColumnSettings}
                showExport={showExport}
                showSaveFiltersButton={showSaveFiltersButton}
                enabledGrouping={enabledGrouping}
                isGroupingHierarchy={isGroupingHierarchy}
                isIncorrectLimit={isIncorrectLimit}
                bcPageLimit={bcPageLimit}
                bcCountForShowing={bcCountForShowing}
                showUp={showUp}
                onChangeColumns={transfer.toggleVisibility}
                onResetColumns={resetSetting}
                onExport={exportTable}
                onSaveFilters={filterSetting.toggleVisibility}
                onCollapseAll={clearParentExpand}
                onChangeGroupingMode={setEnabledGrouping}
                onScrollToTop={scrollToTop}
            />
        ) : null

    const onHeaderRow = useCallback(() => {
        return {
            'data-test-widget-list-header': true,
            onDoubleClick: showColumnSettings ? closeButton.toggleVisibility : undefined
        }
    }, [showColumnSettings, closeButton.toggleVisibility])

    const columns = useMemo(
        () =>
            buildTableColumns<T>({
                fields: resultedFields,
                rowMetaFields: bcRowMeta?.fields,
                meta: processedMeta,
                controlColumns,
                showCloseButton: closeButton.visibility,
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
            }),
        [
            bcName,
            bcRowMeta?.fields,
            closeButton.visibility,
            controlColumns,
            enabledGrouping,
            expandedParentRowKeys,
            groupingHierarchyModeAggregate,
            hideColumn,
            isEditMode,
            needHideActions,
            onParentExpand,
            processedMeta,
            resultedFields,
            sortedGroupKeys,
            widgetName
        ]
    )

    const stickyWithHorizontalScroll = enabledGrouping && !!dataSource?.length

    const TableComponent = stickyWithHorizontalScroll ? StickyTable : StandardTable

    const tableElement = (
        <TableComponent<T>
            operationsRef={operationsRef as any}
            wrapperRef={parentRef as any}
            widgetName={widgetName}
            onColumnDragEnd={showColumnSettings ? changeOrder : undefined}
            columns={columns}
            dataSource={dataSource}
            rowKey={isGroupingHierarchy ? getGroupingHierarchyRowKey : ROW_KEY}
            onRow={handleRow}
            onHeaderRow={onHeaderRow}
            expandedRowKeys={expandedRowKeys}
            expandIconColumnIndex={getExpandIconColumnIndex(controlColumns, resultedFields, currentRowSelection?.type)}
            expandIcon={enabledMassMode ? undefined : resultExpandIcon}
            expandedRowRender={enabledMassMode ? undefined : expandedRowRender}
            onExpand={onExpand}
            hideRowActions={hideRowActions}
            hidePagination={disablePagination || enabledGrouping}
            settingsRender={settings}
            {...rest}
            rowSelection={currentRowSelection}
        />
    )

    return (
        <div ref={tableContainerRef} className={styles.tableContainer}>
            {enabledMassMode ? (
                <MassLayout widgetName={widgetName} bcName={bcName}>
                    {tableElement}
                </MassLayout>
            ) : (
                <>
                    <div className={styles.operations}>
                        <Operations operations={bcRowMeta?.actions} bcName={bcName} widgetMeta={processedMeta} />
                    </div>
                    {tableElement}
                </>
            )}

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

export default React.memo(Table) as typeof Table
