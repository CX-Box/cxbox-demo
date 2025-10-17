import React, { useCallback, useMemo } from 'react'
import { ColumnProps, TableProps as AntdTableProps } from 'antd/es/table'
import { useExpandableForm } from './hooks/useExpandableForm'
import styles from './Table.less'
import { AppWidgetGroupingHierarchyMeta, AppWidgetTableMeta, CustomWidgetTypes } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { useTableSetting } from '@components/widgets/Table/hooks/useTableSetting'
import { useVisibility } from '@components/widgets/Table/hooks/useVisibility'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { actions } from '@actions'
import { useExportTable } from '@components/widgets/Table/hooks/useExportTable'
import { Icon, Menu, Popover, Tooltip } from 'antd'
import DropdownSetting from './components/DropdownSetting'
import Operations from '../../Operations/Operations'
import FilterSettingModal from './components/FilterSettingModal'
import { usePresetFilterSettings } from './hooks/usePresetFilterSettings'
import cn from 'classnames'
import Field from '@components/Field/Field'
import { useRowMenu } from '@hooks/useRowMenu'
import { DataItem, FieldType, IdItemResponse } from '@cxbox-ui/core'
import { TableEventListeners } from 'antd/lib/table/interface'
import { ExpandIconProps } from 'antd/lib/table'
import { WidgetListField } from '@cxbox-ui/schema'
import Button from '@components/ui/Button/Button'
import { interfaces } from '@cxbox-ui/core'
import ColumnTitle from '@components/ColumnTitle/ColumnTitle'
import ExpandIcon from '@components/widgets/Table/components/ExpandIcon'
import { ControlColumn, CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { GroupingHierarchyCommonNode } from '@components/widgets/Table/groupingHierarchy'
import {
    fieldShowCondition,
    getGroupingHierarchyRowKey,
    getInternalGroupPath,
    rowShowCondition,
    useGroupingHierarchy
} from '@components/widgets/Table/groupingHierarchy'
import { numberFieldTypes } from '@constants/field'
import { aggCellBgColorRgba, totalRowKey } from './groupingHierarchy/constants'
import { getAggCellBgOpacity } from './groupingHierarchy/utils/aggregation'
import { selectBc, selectBcData } from '@selectors/selectors'
import ColumnOrderSettingModal from '@components/widgets/Table/components/ColumnOrderSettingModal'
import StandardTable from '@components/widgets/Table/StandardTable'
import MassLayout from '@components/widgets/Table/massOperations/Layout'
import { useRowSelection } from '@components/widgets/Table/massOperations/hooks/useRowSelection'
import ResultColumnTitle from '@components/widgets/Table/massOperations/ColumnTitle'
import { FIELDS } from '@constants'
import { useRowMetaWithCache } from '@hooks/useRowMetaWithCache'
import FieldBaseThemeWrapper from '@components/FieldBaseThemeWrapper/FieldBaseThemeWrapper'

const ROW_KEY = FIELDS.TECHNICAL.ID

interface TableProps<T extends CustomDataItem> extends AntdTableProps<T> {
    meta: AppWidgetTableMeta | AppWidgetGroupingHierarchyMeta
    primaryColumn?: ControlColumn<T>
    disablePagination?: boolean
    hideRowActions?: boolean
    disableCellEdit?: boolean
    disableMassMode?: boolean
    isGroupingHierarchy?: boolean
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
    ...rest
}: TableProps<T>) {
    const { t } = useTranslation()
    const { bcName, name: widgetName } = unprocessedMeta
    const bc = useAppSelector(state => selectBc(state, bcName))
    const bcRowMeta = useRowMetaWithCache(bcName, true)
    const selectedRow = useAppSelector(state => state.view.selectedRow)
    const bcData = useAppSelector(state => selectBcData(state, bcName)) as T[] | undefined
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
        renderTopButton,
        tableContainerRef,
        hierarchyToggleButtonElement,
        sortFieldsByGroupKeys
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

    const massResultColumn: ControlColumn<T> = useMemo(
        () => ({
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
                render: (text, record: Partial<IdItemResponse>) => {
                    let content: React.ReactNode
                    const resultRecord = { ...record, ...selectedRowsDictionary[record.id as string] }

                    if (typeof resultRecord.success !== 'boolean') {
                        content = <Icon className={styles.columnIcon} type="minus-circle" theme="filled" />
                    } else if (resultRecord.success) {
                        content = <Icon className={styles.columnIcon} type="check-circle" theme="filled" />
                    } else {
                        content = (
                            <Tooltip trigger="hover" title={resultRecord.errorMessage ?? ''}>
                                <Icon className={styles.columnIcon} type="close-square" theme="filled" />
                            </Tooltip>
                        )
                    }

                    return <div className={styles.massResultColum}>{content}</div>
                }
            },
            position: 'left'
        }),
        [bcName, selectedRowsDictionary, t, widgetName]
    )

    const controlColumns = useMemo(() => {
        const resultColumns: Array<ControlColumn<T>> = []

        if (processedMeta.options?.primary?.enabled && primaryColumn) {
            resultColumns.push(primaryColumn as any)
        }

        if (expandIconColumn && !enabledMassMode) {
            resultColumns.push({
                column: !isGroupingHierarchy
                    ? expandIconColumn
                    : {
                          ...expandIconColumn,
                          title: renderTopButton
                      },
                position: 'right'
            })
        }

        if (isGroupingHierarchy && !expandIconColumn) {
            resultColumns.push({
                column: {
                    width: '62px',
                    title: renderTopButton
                },
                position: 'right'
            })
        }

        if (enabledMassMode && step === 'View results') {
            resultColumns.push(massResultColumn)
        }

        return [...resultColumns]
    }, [
        processedMeta.options?.primary?.enabled,
        primaryColumn,
        expandIconColumn,
        isGroupingHierarchy,
        enabledMassMode,
        step,
        renderTopButton,
        massResultColumn
    ])

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

    const { showColumnSettings, allFields, resultedFields, currentAdditionalFields, changeOrder, changeColumnsVisibility, resetSetting } =
        useTableSetting(processedMeta, sortedGroupKeys, currentRowSelection?.type, controlColumns)

    const hideColumn = useCallback((fieldKey: string) => changeColumnsVisibility([fieldKey], false), [changeColumnsVisibility])

    const { saveCurrentFiltersAsGroup, filterGroups, removeFilterGroup, filtersExist } = usePresetFilterSettings(bcName)

    const handleSaveFilterGroup = useCallback(
        (values: { name: string }) => {
            saveCurrentFiltersAsGroup(values.name)
        },
        [saveCurrentFiltersAsGroup]
    )

    const dispatch = useDispatch()

    // TODO the condition is necessary because of editable table cells inside the core, so that there would not be duplicated actions of record change
    const needRowSelectRecord = !expandable && processedMeta.options?.readOnly !== true && processedMeta.options?.edit?.style !== 'none'

    const exportConfig = processedMeta.options?.export
    const showExport = exportConfig?.enabled
    const { exportTable } = useExportTable({
        bcName: bcName,
        fields: resultedFields,
        title: exportConfig?.title ?? processedMeta.title
    })

    const showSaveFiltersButton = processedMeta.options?.filterSetting?.enabled

    const showSettings = showSaveFiltersButton || showColumnSettings || showExport

    const isAllowEdit = !expandable && !processedMeta.options?.readOnly && !disableCellEdit && !enabledMassMode

    const [operationsRef, parentRef, handleRowMenu] = useRowMenu() // NOSONAR(S6440) hook is called conditionally, fix later

    const onHeaderRow = useCallback(() => {
        return {
            'data-test-widget-list-header': true,
            onDoubleClick: showColumnSettings ? closeButton.toggleVisibility : undefined
        }
    }, [showColumnSettings, closeButton.toggleVisibility])

    const expandedRowKeys = useMemo(() => {
        if (enabledGrouping) {
            const expandedRowKey = getGroupingHierarchyRowKeyByRecordId(expandedRowId)

            return expandedRowKey && !expandedParentRowKeys.includes(expandedRowKey)
                ? [expandedRowKey, ...expandedParentRowKeys]
                : expandedParentRowKeys
        }

        return expandedRowId ? [expandedRowId, ...expandedParentRowKeys] : expandedParentRowKeys
    }, [enabledGrouping, expandedParentRowKeys, expandedRowId, getGroupingHierarchyRowKeyByRecordId])

    const needHideActions = useCallback(
        (record: T) => {
            return (
                isGroupingHierarchy &&
                (!(
                    fieldShowCondition(
                        resultedFields
                            ?.filter(item => item.type !== FieldType.hidden && !item.hidden)
                            .find(field => !sortedGroupKeys.includes(field.key))?.key as string,
                        record,
                        sortedGroupKeys,
                        expandedRowKeys
                    ) || typeof record._groupLevel !== 'number'
                ) ||
                    (groupingHierarchyModeAggregate && typeof record._groupLevel === 'number'))
            )
        },
        [expandedRowKeys, groupingHierarchyModeAggregate, isGroupingHierarchy, resultedFields, sortedGroupKeys]
    )

    const needHideRow = useCallback(
        (record: T) => {
            return isGroupingHierarchy && enabledGrouping && !rowShowCondition(record, sortedGroupKeys, expandedParentRowKeys)
        },
        [enabledGrouping, expandedParentRowKeys, isGroupingHierarchy, sortedGroupKeys]
    )

    const handleRow = useCallback(
        (record: T, index: number) => {
            const rowMenuEventListeners = handleRowMenu(record as DataItem)

            const tableEventListeners = {
                ...rowMenuEventListeners,
                onClick: event => {
                    if (event.defaultPrevented) {
                        return
                    }

                    if (enabledMassMode) {
                        return
                    }

                    const selection = window.getSelection()
                    if (selection === null || selection.type !== 'Range') {
                        if (needRowSelectRecord) {
                            if (record.id !== selectedRow?.rowId) {
                                dispatch(actions.selectTableRowInit({ widgetName: widgetName, rowId: record.id }))
                            }
                        } else {
                            if (record.id !== bc?.cursor) {
                                dispatch(actions.bcSelectRecord({ bcName: bc?.name as string, cursor: record.id }))
                            }
                        }
                    }
                }
            } as TableEventListeners

            const otherProperties = {
                'data-test-widget-list-row-id': record.id,
                'data-test-widget-list-row-type': typeof record._groupLevel === 'number' ? 'GroupingRow' : 'Row'
            } as Record<string, unknown>

            if (needHideActions(record)) {
                Object.keys(tableEventListeners).forEach(key => {
                    delete tableEventListeners[key as keyof typeof tableEventListeners]
                })
            }

            if (needHideRow(record)) {
                otherProperties.style = { display: 'none' } // more performant than components.row
            }

            return {
                ...tableEventListeners,
                ...onRow?.(record, index),
                ...otherProperties
            } as TableEventListeners
        },
        [
            handleRowMenu,
            needHideActions,
            needHideRow,
            onRow,
            enabledMassMode,
            needRowSelectRecord,
            selectedRow?.rowId,
            dispatch,
            widgetName,
            bc?.cursor,
            bc?.name
        ]
    )

    const dataSource = useMemo(() => {
        return enabledGrouping ? (tree as T[]) : bcData
    }, [enabledGrouping, tree, bcData])

    const resultExpandIcon = useCallback(
        (expandIconProps: ExpandIconProps<T>) => {
            return !needHideActions(expandIconProps.record) ? expandIcon?.(expandIconProps) : null
        },
        [expandIcon, needHideActions]
    )

    // after: Expanding a record when changing a record or changing the order

    const isEditMode = useCallback(
        (record: T) => {
            return (
                isAllowEdit &&
                selectedRow !== null &&
                widgetName === selectedRow.widgetName &&
                record.id === selectedRow.rowId &&
                bc?.cursor === selectedRow.rowId
            )
        },
        [bc?.cursor, isAllowEdit, selectedRow, widgetName]
    )

    const columns: Array<ColumnProps<T>> = React.useMemo(() => {
        return (
            resultedFields?.map(item => {
                const fieldRowMeta = bcRowMeta?.fields?.find(field => field.key === item.key)
                const isGroupingHierarchy = (processedMeta?.type as string) === CustomWidgetTypes.GroupingHierarchy
                const isGroupingField = !!processedMeta?.options?.groupingHierarchy?.fields?.includes(item.key)

                return {
                    title: (
                        <ColumnTitle
                            showCloseButton={isGroupingHierarchy ? !isGroupingField && closeButton.visibility : closeButton.visibility}
                            onClose={hideColumn}
                            widgetName={widgetName}
                            widgetMeta={item as WidgetListField}
                            rowMeta={fieldRowMeta as interfaces.RowMetaField}
                        />
                    ),
                    key: item.key,
                    dataIndex: item.key,
                    width: item.width,
                    render: (text: string, dataItem: T & GroupingHierarchyCommonNode) => {
                        const editMode =
                            isGroupingHierarchy && enabledGrouping
                                ? isEditMode(dataItem) && !needHideActions(dataItem)
                                : isEditMode(dataItem)

                        const expandRowId = isGroupingHierarchy
                            ? getInternalGroupPath(item.key, dataItem, sortedGroupKeys)
                            : dataItem[ROW_KEY]
                        const expanded = expandedParentRowKeys?.includes(expandRowId) ?? false

                        const isGroupingField = !!processedMeta?.options?.groupingHierarchy?.fields?.includes(item.key)
                        const aggFunction = dataItem._aggFunctions?.[item.key]
                        const groupLevel = dataItem._groupLevel
                        let showReadonlyField

                        if (groupingHierarchyModeAggregate) {
                            showReadonlyField = enabledGrouping
                                ? (groupLevel && (sortedGroupKeys[groupLevel - 1] === item.key || aggFunction)) ||
                                  (!groupLevel && (!sortedGroupKeys.includes(item.key) || !dataItem._parentGroupPath))
                                : true
                        } else {
                            showReadonlyField =
                                isGroupingHierarchy && enabledGrouping
                                    ? fieldShowCondition(item.key, dataItem, sortedGroupKeys, expandedParentRowKeys)
                                    : true
                        }

                        const showExpandIcon =
                            isGroupingField && dataItem[item.key] && enabledGrouping && showReadonlyField && !!dataItem.children
                        const fieldGroupLevel = sortedGroupKeys.findIndex(sortedGroupKey => sortedGroupKey === item.key) + 1
                        const countOfRecords = dataItem._countOfRecordsPerLevel?.[fieldGroupLevel] ?? 0
                        const counterMode = processedMeta?.options?.groupingHierarchy?.counterMode || 'none'
                        const showCounter =
                            showExpandIcon &&
                            fieldGroupLevel &&
                            !editMode &&
                            (counterMode === 'always' || (counterMode === 'collapsed' && !expanded))
                        const showField = !!showReadonlyField || editMode
                        const rightAlignment = numberFieldTypes.includes(item.type) && {
                            justifyContent: 'flex-end'
                        }

                        const field = showField && (
                            <FieldBaseThemeWrapper
                                data-test="FIELD"
                                data-test-field-type={item.type}
                                data-test-field-title={item.label || item.title}
                                data-test-field-key={item.key}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    ...rightAlignment
                                }}
                            >
                                {showExpandIcon && (
                                    <ExpandIcon
                                        className={styles.parentExpandIcon}
                                        expanded={expanded}
                                        onClick={event => {
                                            event.preventDefault()
                                            onParentExpand?.(!expanded, expandRowId)
                                        }}
                                        openIcon="up"
                                        openRotate={90}
                                        closeIcon="down"
                                    />
                                )}
                                <Field
                                    data={dataItem as DataItem}
                                    bcName={bcName}
                                    cursor={dataItem.id}
                                    widgetName={widgetName}
                                    widgetFieldMeta={item as WidgetListField}
                                    readonly={!editMode}
                                    forceFocus={editMode}
                                    className={cn(editMode ? styles.fullWidth : styles.fitContentWidth)}
                                />
                                {showCounter ? <span className={styles.counter}>({countOfRecords})</span> : null}
                            </FieldBaseThemeWrapper>
                        )

                        if (groupingHierarchyModeAggregate) {
                            const backgroundEnabled =
                                groupLevel &&
                                (!sortedGroupKeys.slice(0, groupLevel).includes(item.key) || dataItem.id === totalRowKey) &&
                                !!dataItem._aggFunctions
                            const fieldElement = backgroundEnabled ? (
                                <div
                                    className={styles.aggCell}
                                    style={{
                                        backgroundColor: `rgba(${aggCellBgColorRgba}, ${getAggCellBgOpacity(dataItem.id, groupLevel)})`
                                    }}
                                >
                                    {field}
                                </div>
                            ) : (
                                field
                            )

                            return aggFunction ? (
                                <Popover content={aggFunction} trigger="hover">
                                    {fieldElement}
                                </Popover>
                            ) : (
                                fieldElement
                            )
                        }

                        return field
                    },
                    onHeaderCell: () => {
                        return {
                            'data-test-widget-list-header-column-title': item?.title,
                            'data-test-widget-list-header-column-type': item?.type,
                            'data-test-widget-list-header-column-key': item?.key
                        }
                    }
                }
            }) ?? []
        )
    }, [
        resultedFields,
        bcRowMeta?.fields,
        processedMeta?.type,
        processedMeta?.options?.groupingHierarchy?.fields,
        processedMeta?.options?.groupingHierarchy?.counterMode,
        closeButton.visibility,
        hideColumn,
        widgetName,
        enabledGrouping,
        isEditMode,
        needHideActions,
        sortedGroupKeys,
        expandedParentRowKeys,
        groupingHierarchyModeAggregate,
        bcName,
        onParentExpand
    ])

    const resultColumns = React.useMemo(() => {
        const controlColumnsLeft: Array<ColumnProps<T>> = []
        const controlColumnsRight: Array<ColumnProps<T>> = []
        controlColumns?.forEach(item => {
            item.position === 'left' ? controlColumnsLeft.push(item.column) : controlColumnsRight.push(item.column)
        })
        return [...controlColumnsLeft, ...columns, ...controlColumnsRight]
    }, [columns, controlColumns])

    const tableElement = (
        <StandardTable<T>
            operationsRef={operationsRef as any}
            wrapperRef={parentRef as any}
            widgetName={widgetName}
            onColumnDragEnd={showColumnSettings ? changeOrder : undefined}
            columns={resultColumns}
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
            stickyWithHorizontalScroll={enabledGrouping}
            hidePagination={disablePagination || enabledGrouping}
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
                        <Operations
                            operations={bcRowMeta?.actions}
                            bcName={bcName}
                            widgetMeta={processedMeta}
                            additionalOperations={
                                <>
                                    {enabledGrouping && (
                                        <Tooltip
                                            title={!expandedParentRowKeys.length ? t(`No expanded columns`) : t('Collapse columns')}
                                            trigger="hover"
                                        >
                                            <div style={{ display: 'inline-block' }}>
                                                <Button
                                                    type="empty"
                                                    className={cn(styles.collapseTreeButton)}
                                                    disabled={!expandedParentRowKeys.length}
                                                    onClick={clearParentExpand}
                                                >
                                                    <Icon type="unordered-list" />
                                                </Button>
                                            </div>
                                        </Tooltip>
                                    )}
                                    {hierarchyToggleButtonElement}
                                    {showSettings && (
                                        <DropdownSetting
                                            buttonClassName={styles.settingButton}
                                            overlay={
                                                <Menu>
                                                    {showColumnSettings && (
                                                        <Menu.ItemGroup key="additionalColumns" title={t('Additional columns')}>
                                                            <Menu.Item key="0" onClick={transfer.toggleVisibility}>
                                                                {t('Change')}
                                                            </Menu.Item>
                                                            <Menu.Item key="1" onClick={resetSetting}>
                                                                {t('Reset')}
                                                            </Menu.Item>
                                                        </Menu.ItemGroup>
                                                    )}
                                                    {showExport && (
                                                        <Menu.ItemGroup key="export" title={t('Export to')}>
                                                            <Menu.Item key="3" onClick={() => exportTable()}>
                                                                {t('Excel')}
                                                                <Icon type="file-excel" style={{ fontSize: 14, marginLeft: 4 }} />
                                                            </Menu.Item>
                                                        </Menu.ItemGroup>
                                                    )}
                                                    {showSaveFiltersButton && (
                                                        <Menu.ItemGroup key="filtersSettings" title={t('Filters settings')}>
                                                            <Menu.Item key="4" onClick={filterSetting.toggleVisibility}>
                                                                {t('Save filters')}
                                                            </Menu.Item>
                                                        </Menu.ItemGroup>
                                                    )}
                                                </Menu>
                                            }
                                        />
                                    )}
                                </>
                            }
                        />
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
