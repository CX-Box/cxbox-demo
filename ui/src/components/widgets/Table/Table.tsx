import React, { useCallback, useMemo } from 'react'
import { ColumnProps, TableProps as AntdTableProps } from 'antd/es/table'
import Pagination from '../../ui/Pagination/Pagination'
import { useExpandableForm } from './hooks/useExpandableForm'
import styles from './Table.less'
import { AppWidgetGroupingHierarchyMeta, AppWidgetTableMeta, CustomWidgetTypes } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { useTableSetting } from '@components/widgets/Table/hooks/useTableSetting'
import { useVisibility } from '@components/widgets/Table/hooks/useVisibility'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useDispatch } from 'react-redux'
import { actions } from '@actions'
import { buildBcUrl } from '@utils/buildBcUrl'
import { useExportTable } from '@components/widgets/Table/hooks/useExportTable'
import ReactDragListView, { DragListViewProps } from 'react-drag-listview'
import { Icon, Menu, Modal, Table as AntdTable, Tooltip, Transfer } from 'antd'
import DropdownSetting from './components/DropdownSetting'
import Operations from '../../Operations/Operations'
import FilterSettingModal from './components/FilterSettingModal'
import { usePresetFilterSettings } from './hooks/usePresetFilterSettings'
import cn from 'classnames'
import Header from '@components/widgets/Table/components/Header'
import { Field, RowOperationsButton } from '@cxboxComponents'
import { useRowMenu } from '@hooks/useRowMenu'
import { DataItem, FieldType } from '@cxbox-ui/core'
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

const ROW_KEY = 'id'

interface TableProps<T extends CustomDataItem> extends AntdTableProps<T> {
    meta: AppWidgetTableMeta | AppWidgetGroupingHierarchyMeta
    primaryColumn?: ControlColumn<T>
    disablePagination?: boolean
    hideRowActions?: boolean
    disableCellEdit?: boolean
    isGroupingHierarchy?: boolean
}

function Table<T extends CustomDataItem>({
    meta,
    isGroupingHierarchy,
    primaryColumn,
    disablePagination,
    hideRowActions = false,
    disableCellEdit = false,
    onRow,
    ...rest
}: TableProps<T>) {
    const { bcName = '', name: widgetName = '' } = meta || {}
    const bcUrl = useAppSelector(state => state.screen.bo.bc[meta.bcName] && buildBcUrl(meta.bcName, true))
    const operations = useAppSelector(state => state.view.rowMeta?.[meta.bcName]?.[bcUrl]?.actions)
    const { bc, selectedRow, cursor } = useAppSelector(state => {
        const bc = bcName ? state.screen.bo.bc[bcName] : undefined

        return {
            bc: bc,
            cursor: bc?.cursor,
            selectedRow: state.view.selectedRow
        }
    }, shallowEqual)

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
        hierarchyToggleButtonElement
    } = useGroupingHierarchy(meta as AppWidgetGroupingHierarchyMeta, isGroupingHierarchy)

    const sortedFieldsByGroupKeys = useMemo(() => {
        if (!isGroupingHierarchy) {
            return meta.fields
        }

        let firstFields = sortedGroupKeys
            .map(fieldKey => meta.fields.find(field => field.key === fieldKey))
            .filter(field => !!field) as WidgetListField[]

        return [...firstFields, ...meta.fields.filter(field => !sortedGroupKeys.includes(field.key))]
    }, [isGroupingHierarchy, meta.fields, sortedGroupKeys])

    const { onExpand, expandable, expandIcon, expandIconColumn, getExpandIconColumnIndex, expandedRowRender, expandedRowId } =
        useExpandableForm<T>(meta)

    const { showColumnSettings, allFields, resultedFields, currentAdditionalFields, changeOrder, changeColumnsVisibility, resetSetting } =
        useTableSetting(meta.name, sortedFieldsByGroupKeys, meta.options, sortedGroupKeys)

    const processedTransferFields = useMemo(() => {
        const transferFields: (WidgetListField & { disabled?: boolean })[] = [...allFields]

        sortedGroupKeys.forEach(groupingFieldKey => {
            const groupingFieldIndex = allFields?.findIndex(field => field.key === groupingFieldKey) ?? -1

            if (groupingFieldIndex !== -1) {
                transferFields[groupingFieldIndex] = {
                    ...transferFields[groupingFieldIndex],
                    disabled: true
                }
            }
        })

        return transferFields
    }, [allFields, sortedGroupKeys])

    const { visibility: showCloseButton, toggleVisibility: toggleCloseButtonVisibility } = useVisibility(false)

    const handleColumnClose = useCallback((fieldKey: string) => changeColumnsVisibility([fieldKey], false), [changeColumnsVisibility])

    const { visibility: transferVisible, toggleVisibility: toggleTransferVisible } = useVisibility(false)

    const handleTransferChange = useCallback(
        (nextTargetKeys: string[], direction, moveKeys) => {
            if (direction === 'right') {
                changeColumnsVisibility([...moveKeys], false)
            }

            if (direction === 'left') {
                changeColumnsVisibility(moveKeys, true)
            }
        },
        [changeColumnsVisibility]
    )

    const { visibility: filterSettingVisible, toggleVisibility: toggleFilterSettingVisible } = useVisibility(false)

    const { saveCurrentFiltersAsGroup, filterGroups, removeFilterGroup, filtersExist } = usePresetFilterSettings(meta.bcName)

    const handleSaveFilterGroup = useCallback(
        (values: { name: string }) => {
            saveCurrentFiltersAsGroup(values.name)
        },
        [saveCurrentFiltersAsGroup]
    )

    const dispatch = useDispatch()

    // TODO the condition is necessary because of editable table cells inside the core, so that there would not be duplicated actions of record change
    const needRowSelectRecord = !expandable && meta.options?.readOnly !== true && meta.options?.edit?.style !== 'none'

    const exportConfig = meta.options?.export
    const showExport = exportConfig?.enabled
    const { exportTable } = useExportTable({ bcName, fields: resultedFields, title: exportConfig?.title ?? meta.title })

    const showSaveFiltersButton = meta.options?.filterSetting?.enabled

    const showSettings = showSaveFiltersButton || showColumnSettings || showExport

    const dragColumnProps: DragListViewProps | null = showColumnSettings ? { onDragEnd: changeOrder, nodeSelector: 'th' } : null

    const isAllowEdit = !expandable && !meta.options?.readOnly && !disableCellEdit

    const [operationsRef, parentRef, handleRowMenu] = useRowMenu() // NOSONAR(S6440) hook is called conditionally, fix later

    const onHeaderRow = () => {
        return {
            'data-test-widget-list-header': true,
            onDoubleClick: showColumnSettings ? toggleCloseButtonVisibility : undefined
        }
    }

    const bcData = useAppSelector(state => state.data[meta.bcName] as T[] | undefined)

    const expandedRowKeys = useMemo(() => {
        if (isGroupingHierarchy) {
            const expandedRowKey = getGroupingHierarchyRowKeyByRecordId(expandedRowId)

            return expandedRowKey && !expandedParentRowKeys.includes(expandedRowKey)
                ? [expandedRowKey, ...expandedParentRowKeys]
                : expandedParentRowKeys
        }

        return expandedRowId ? [expandedRowId, ...expandedParentRowKeys] : expandedParentRowKeys
    }, [expandedParentRowKeys, expandedRowId, getGroupingHierarchyRowKeyByRecordId, isGroupingHierarchy])

    const needHideActions = useCallback(
        (record: T) => {
            return (
                isGroupingHierarchy &&
                !(
                    fieldShowCondition(
                        resultedFields
                            ?.map(item => {
                                return item.type === FieldType.multivalue ? { ...item, type: FieldType.multivalueHover } : item
                            })
                            ?.filter(item => item.type !== FieldType.hidden && !item.hidden)
                            .find(field => !sortedGroupKeys.includes(field.key))?.key as string,
                        record,
                        sortedGroupKeys,
                        expandedRowKeys
                    ) || typeof record._groupLevel !== 'number'
                )
            )
        },
        [expandedRowKeys, isGroupingHierarchy, resultedFields, sortedGroupKeys]
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

                    const selection = window.getSelection()
                    if (selection === null || selection.type !== 'Range') {
                        if (needRowSelectRecord) {
                            if (record.id !== selectedRow?.rowId) {
                                dispatch(actions.selectTableRowInit({ widgetName: meta.name, rowId: record.id }))
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
            bc?.cursor,
            bc?.name,
            dispatch,
            handleRowMenu,
            meta.name,
            needHideActions,
            needHideRow,
            needRowSelectRecord,
            onRow,
            selectedRow?.rowId
        ]
    )

    const dataSource = useMemo(() => {
        return enabledGrouping ? (tree as T[]) : bcData
    }, [enabledGrouping, tree, bcData])

    const controlColumns = useMemo(() => {
        const resultColumns: Array<ControlColumn<T>> = []

        if (meta.options?.primary?.enabled && primaryColumn) {
            resultColumns.push(primaryColumn as any)
        }

        if (expandIconColumn) {
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

        return [...resultColumns]
    }, [expandIconColumn, isGroupingHierarchy, meta.options?.primary?.enabled, primaryColumn, renderTopButton])

    const resultExpandIcon = useCallback(
        (expandIconProps: ExpandIconProps<T>) => {
            return !needHideActions(expandIconProps.record) ? expandIcon?.(expandIconProps) : null
        },
        [expandIcon, needHideActions]
    )

    // after: Expanding a record when changing a record or changing the order

    const { t } = useTranslation()

    const bcRowMeta = useAppSelector(state => {
        const bcUrl = buildBcUrl(bcName, true, state)

        return bcUrl ? state.view.rowMeta[bcName]?.[bcUrl] : undefined
    })

    const isEditMode = useCallback(
        (record: T) => {
            return (
                isAllowEdit &&
                selectedRow !== null &&
                widgetName === selectedRow.widgetName &&
                record.id === selectedRow.rowId &&
                cursor === selectedRow.rowId
            )
        },
        [cursor, isAllowEdit, selectedRow, widgetName]
    )

    const columns: Array<ColumnProps<T>> = React.useMemo(() => {
        return (
            resultedFields
                ?.map(item => {
                    return item.type === FieldType.multivalue ? { ...item, type: FieldType.multivalueHover } : item
                })
                ?.filter(item => item.type !== FieldType.hidden && !item.hidden)
                ?.map(item => {
                    const fieldRowMeta = bcRowMeta?.fields?.find(field => field.key === item.key)
                    const isGroupingHierarchy = (meta?.type as string) === CustomWidgetTypes.GroupingHierarchy
                    const isGroupingField = !!meta?.options?.groupingHierarchy?.fields?.includes(item.key)

                    return {
                        title: (
                            <ColumnTitle
                                showCloseButton={isGroupingHierarchy ? !isGroupingField && showCloseButton : showCloseButton}
                                onClose={handleColumnClose}
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

                            const isGroupingField = !!meta?.options?.groupingHierarchy?.fields?.includes(item.key)
                            const showReadonlyField =
                                isGroupingHierarchy && enabledGrouping
                                    ? fieldShowCondition(item.key, dataItem, sortedGroupKeys, expandedParentRowKeys)
                                    : true
                            const showExpandIcon =
                                isGroupingField && dataItem[item.key] && enabledGrouping && showReadonlyField && !!dataItem.children
                            const fieldGroupLevel = sortedGroupKeys.findIndex(sortedGroupKey => sortedGroupKey === item.key) + 1
                            const countOfRecords = dataItem._countOfRecordsPerLevel?.[fieldGroupLevel] ?? 0
                            const counterMode = meta?.options?.groupingHierarchy?.counterMode || 'none'
                            const showCounter =
                                showExpandIcon &&
                                fieldGroupLevel &&
                                !editMode &&
                                (counterMode === 'always' || (counterMode === 'collapsed' && !expanded))
                            const showField = showReadonlyField || editMode

                            return (
                                showField && (
                                    <div
                                        data-test="FIELD"
                                        data-test-field-type={item.type}
                                        data-test-field-title={item.label || item.title}
                                        data-test-field-key={item.key}
                                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
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
                                        {showCounter && `(${countOfRecords})`}
                                    </div>
                                )
                            )
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
        bcName,
        bcRowMeta?.fields,
        enabledGrouping,
        expandedParentRowKeys,
        handleColumnClose,
        isEditMode,
        meta?.options?.groupingHierarchy?.counterMode,
        meta?.options?.groupingHierarchy?.fields,
        meta?.type,
        needHideActions,
        onParentExpand,
        resultedFields,
        showCloseButton,
        sortedGroupKeys,
        widgetName
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
        <div className={cn(styles.tableContainer, { [styles.stickyWithHorizontalScroll]: enabledGrouping })} ref={parentRef as any}>
            <Header meta={meta} />
            <AntdTable
                className={cn(styles.table, { [styles.tableWithRowMenu]: !hideRowActions })}
                columns={resultColumns}
                dataSource={dataSource}
                rowKey={isGroupingHierarchy ? getGroupingHierarchyRowKey : ROW_KEY}
                pagination={false}
                onRow={handleRow}
                onHeaderRow={onHeaderRow}
                rowClassName={record => (record.id === bc?.cursor ? 'ant-table-row-selected' : '')}
                expandedRowKeys={expandedRowKeys}
                expandIconColumnIndex={getExpandIconColumnIndex(controlColumns, resultedFields)}
                expandIconAsCell={false}
                expandIcon={resultExpandIcon}
                expandedRowRender={expandedRowRender}
                onExpand={onExpand}
                indentSize={0}
                scroll={enabledGrouping ? { y: true, x: 'calc(700px + 50%)' } : undefined}
                {...rest}
            />
            {!hideRowActions && (
                <RowOperationsButton meta={meta as AppWidgetTableMeta} ref={operationsRef as any} parent={parentRef as any} />
            )}
        </div>
    )

    return (
        <div ref={tableContainerRef} className={styles.tableContainer}>
            <div className={styles.operations}>
                <Operations
                    operations={operations}
                    bcName={meta.bcName}
                    widgetMeta={meta}
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
                                            onClick={() => {
                                                clearParentExpand()
                                            }}
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
                                                    <Menu.Item key="0" onClick={toggleTransferVisible}>
                                                        {t('Change')}
                                                    </Menu.Item>
                                                    <Menu.Item key="1" onClick={resetSetting}>
                                                        {t('Reset')}
                                                    </Menu.Item>
                                                </Menu.ItemGroup>
                                            )}
                                            {showExport && (
                                                <Menu.ItemGroup key="export" title={t('Export to')}>
                                                    <Menu.Item key="3" onClick={exportTable}>
                                                        {t('Excel')}
                                                        <Icon type="file-excel" style={{ fontSize: 14, marginLeft: 4 }} />
                                                    </Menu.Item>
                                                </Menu.ItemGroup>
                                            )}
                                            {showSaveFiltersButton && (
                                                <Menu.ItemGroup key="filtersSettings" title={t('Filters settings')}>
                                                    <Menu.Item key="4" onClick={toggleFilterSettingVisible}>
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

            <Modal visible={transferVisible} onCancel={toggleTransferVisible} footer={null}>
                <Transfer
                    locale={{ itemUnit: t('column'), itemsUnit: t('columns') }}
                    dataSource={processedTransferFields}
                    titles={[t('Main'), t('Additional')]}
                    targetKeys={currentAdditionalFields}
                    onChange={handleTransferChange}
                    render={item => item.title ?? ''}
                    listStyle={{ width: '44%' }}
                />
            </Modal>

            <FilterSettingModal
                filtersExist={filtersExist}
                onDelete={removeFilterGroup}
                filterGroups={filterGroups}
                visible={filterSettingVisible}
                onCancel={toggleFilterSettingVisible}
                onSubmit={handleSaveFilterGroup}
            />
            {dragColumnProps ? (
                <ReactDragListView.DragColumn {...dragColumnProps}>{tableElement}</ReactDragListView.DragColumn>
            ) : (
                tableElement
            )}
            {!disablePagination && !enabledGrouping && <Pagination disabledLimit={isGroupingHierarchy} meta={meta} />}
        </div>
    )
}

export default React.memo(Table) as typeof Table
