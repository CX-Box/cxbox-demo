import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ColumnProps, TableProps as AntdTableProps } from 'antd/es/table'
import Pagination from '../../ui/Pagination/Pagination'
import { useExpandableForm, useExpandableGroup } from './hooks/useExpandableForm'
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
import { DataItem, FieldType } from '@interfaces/core'
import { TableEventListeners } from 'antd/lib/table/interface'
import { ExpandIconProps } from 'antd/lib/table'
import { WidgetListField } from '@cxbox-ui/schema'
import { usePrevious } from '@hooks/usePrevious'
import Button from '@components/ui/Button/Button'
import { createTree, getNodesPathsToLeaf } from '@components/widgets/Table/utils/createTree'
import { interfaces } from '@cxbox-ui/core'
import ColumnTitle from '@components/ColumnTitle/ColumnTitle'
import ExpandIcon from '@components/widgets/Table/components/ExpandIcon'
import { isFullVisibleElement } from '@components/widgets/Table/utils/elements'

export type ControlColumn = { column: ColumnProps<DataItem>; position: 'left' | 'right' }

const ROW_KEY = 'id'

interface TableProps extends AntdTableProps<DataItem> {
    meta: AppWidgetTableMeta | AppWidgetGroupingHierarchyMeta
    primaryColumn?: ControlColumn
    disablePagination?: boolean
    hideRowActions?: boolean
    disableCellEdit?: boolean
    isGroupingHierarchy?: boolean
}

function Table({
    meta,
    isGroupingHierarchy,
    primaryColumn,
    disablePagination,
    hideRowActions = false,
    disableCellEdit = false,
    onRow,
    ...rest
}: TableProps) {
    const { bcName = '', name: widgetName = '' } = meta || {}
    const bcUrl = useAppSelector(state => state.screen.bo.bc[meta.bcName] && buildBcUrl(meta.bcName, true))
    const operations = useAppSelector(state => state.view.rowMeta?.[meta.bcName]?.[bcUrl]?.actions)
    const { bc, selectedCell, cursor } = useAppSelector(state => {
        const bc = bcName ? state.screen.bo.bc[bcName] : undefined

        return {
            bc: bc,
            cursor: bc?.cursor,
            selectedCell: state.view.selectedCell
        }
    }, shallowEqual)

    const groupingHierarchy = meta.options?.groupingHierarchy
    const sortedGroupKeys = useMemo(
        () => meta.fields.filter(field => groupingHierarchy?.fields.includes(field.key)).map(field => field.key),
        [groupingHierarchy?.fields, meta.fields]
    )
    const sortedFieldsByGroupKeys = useMemo(() => {
        if (!isGroupingHierarchy) {
            return meta.fields
        }

        let firstFields = sortedGroupKeys
            .map(fieldKey => meta.fields.find(field => field.key === fieldKey))
            .filter(field => !!field) as WidgetListField[]

        return [...firstFields, ...meta.fields.filter(field => !sortedGroupKeys.includes(field.key))]
    }, [isGroupingHierarchy, meta.fields, sortedGroupKeys])

    const { onExpand, expandable, expandIcon, expandIconColumn, getExpandIconColumnIndex, expandedRowRender, expandedRowKey } =
        useExpandableForm(meta)

    const { showColumnSettings, allFields, resultedFields, currentAdditionalFields, changeOrder, changeColumnsVisibility, resetSetting } =
        useTableSetting(meta.name, sortedFieldsByGroupKeys, meta.options, groupingHierarchy?.fields)

    const processedTransferFields = useMemo(() => {
        const transferFields: (WidgetListField & { disabled?: boolean })[] = [...allFields]

        groupingHierarchy?.fields.forEach(groupingFieldKey => {
            const groupingFieldIndex = allFields?.findIndex(field => field.key === groupingFieldKey) ?? -1

            if (groupingFieldIndex !== -1) {
                transferFields[groupingFieldIndex] = {
                    ...transferFields[groupingFieldIndex],
                    disabled: true
                }
            }
        })

        return transferFields
    }, [allFields, groupingHierarchy?.fields])

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

    const changeCursor = (rowId: string) => {
        if (rowId !== bc?.cursor) {
            dispatch(actions.bcSelectRecord({ bcName: bc?.name as string, cursor: rowId }))
        }
    }

    // TODO the condition is necessary because of editable table cells inside the core, so that there would not be duplicated actions of record change
    const needRowSelectRecord = expandable || meta.options?.readOnly

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

    const handleRow = (record: DataItem, index: number) => {
        const tableEventListeners = {
            ...handleRowMenu(record),
            onDoubleClick: needRowSelectRecord ? () => changeCursor(record.id) : undefined
        }

        const isParentRow = record.children
        const removeRowMenu = isGroupingHierarchy && isParentRow
        const rowType = removeRowMenu ? 'GroupingRow' : 'Row'

        return {
            ...(!removeRowMenu ? tableEventListeners : undefined),
            ...onRow?.(record, index),
            ...({ 'data-test-widget-list-row-id': record.id, 'data-test-widget-list-row-type': rowType } as Record<string, unknown>)
        } as TableEventListeners
    }

    const { expandedParentRowKeys, changeExpand: onParentExpand, clearExpand: clearParentExpand } = useExpandableGroup()

    const expandedRowKeys = useMemo(() => {
        return expandedRowKey ? [expandedRowKey, ...expandedParentRowKeys] : expandedParentRowKeys
    }, [expandedParentRowKeys, expandedRowKey])

    const [showUp, setShowUp] = useState(false)

    const bcData = useAppSelector(state => state.data[meta.bcName])
    const [enabledGrouping, setEnabledGrouping] = useState<boolean>(false)

    const dataSource = useMemo(() => {
        return enabledGrouping ? createTree(bcData, sortedGroupKeys, meta.fields) : bcData
    }, [enabledGrouping, bcData, meta.fields, sortedGroupKeys])

    const getFirstUnallocatedRowKey = useCallback(() => {
        return !(dataSource as Record<string, unknown | boolean>[])?.[0]?.pseudoRow ? dataSource?.[0]?.id : undefined
    }, [dataSource])

    const scrollToTop = useCallback(() => {
        const rowKey = getFirstUnallocatedRowKey()
        const element = tableContainerRef.current?.querySelector(`[data-row-key="${rowKey}"]`)

        setTimeout(() => {
            element?.scrollIntoView({ block: 'center' })
        }, 0)
    }, [getFirstUnallocatedRowKey])

    const controlColumns = useMemo(() => {
        const resultColumns: Array<ControlColumn> = []
        const topButton = () => {
            return showUp ? (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Button
                        className={styles.moveToTop}
                        type="empty"
                        onClick={() => {
                            scrollToTop()
                        }}
                        icon="arrow-up"
                    />
                </div>
            ) : undefined
        }

        if (meta.options?.primary?.enabled && primaryColumn) {
            resultColumns.push(primaryColumn as any)
        }

        if (expandIconColumn) {
            resultColumns.push({
                column: !isGroupingHierarchy
                    ? expandIconColumn
                    : {
                          ...expandIconColumn,
                          title: topButton
                      },
                position: 'right'
            })
        }

        if (isGroupingHierarchy && !expandIconColumn) {
            resultColumns.push({
                column: {
                    width: '62px',
                    title: topButton
                },
                position: 'right'
            })
        }

        return [...resultColumns]
    }, [expandIconColumn, isGroupingHierarchy, meta.options?.primary?.enabled, primaryColumn, scrollToTop, showUp])

    const resultExpandIcon = useCallback(
        (expandIconProps: ExpandIconProps<DataItem>) => {
            return !expandIconProps.record.children ? expandIcon?.(expandIconProps) : undefined
        },
        [expandIcon]
    )

    const previousCursor = usePrevious(cursor)

    const openTreeToLeaf = useCallback(
        (id: string) => {
            const leaf: Record<string, any> | undefined = bcData?.find(item => item.id === id)

            if (leaf) {
                getNodesPathsToLeaf(leaf, groupingHierarchy?.fields, meta.fields)?.forEach(groupKey => {
                    onParentExpand(true, groupKey)
                })
            }
        },
        [bcData, groupingHierarchy?.fields, meta.fields, onParentExpand]
    )

    const scrollToLeaf = useCallback(
        (rowKey: string) => {
            openTreeToLeaf(rowKey)

            setTimeout(() => {
                const element = tableContainerRef.current?.querySelector(`[data-row-key="${rowKey}"]`)
                element?.scrollIntoView({ block: 'center' })
            }, 0)
        },
        [openTreeToLeaf]
    )

    // before: Expanding a record when changing a record or changing the order
    const previousIndex = usePrevious(bcData?.find(item => item.id === cursor))

    useEffect(() => {
        const currentIndex = bcData?.find(item => item.id === cursor)
        const rowKey = cursor as string
        const rowElement = tableContainerRef.current?.querySelector(`[data-row-key="${rowKey}"]`)

        if ((previousCursor !== cursor || previousIndex !== currentIndex) && (!rowElement || !isFullVisibleElement(rowElement))) {
            const rowKey = cursor as string

            scrollToLeaf(rowKey)
        }
    }, [bcData, cursor, previousCursor, previousIndex, scrollToLeaf])
    // after: Expanding a record when changing a record or changing the order

    const tableContainerRef = useRef<HTMLDivElement>(null)

    const intersectionObserverRef = useRef<IntersectionObserver | undefined>()

    useEffect(() => {
        intersectionObserverRef.current = enabledGrouping
            ? new IntersectionObserver(entries => {
                  const [entry] = entries

                  setShowUp(!entry.isIntersecting)
              })
            : undefined

        return () => {
            intersectionObserverRef.current?.disconnect()
        }
    }, [enabledGrouping])

    useEffect(() => {
        if (!enabledGrouping) {
            return
        }
        const rowKey = getFirstUnallocatedRowKey()
        const element = tableContainerRef.current?.querySelector(`[data-row-key="${rowKey}"]`)

        if (element) {
            intersectionObserverRef.current?.observe(element)
        }

        return () => {
            if (!enabledGrouping) {
                return
            }

            if (element) {
                intersectionObserverRef.current?.unobserve(element)
            }
        }
    }, [enabledGrouping, getFirstUnallocatedRowKey])

    const bcPageLimit = useAppSelector(state => state.screen.bo.bc[meta.bcName].limit)
    const bcCount = useAppSelector(state => state.view.bcRecordsCount[meta.bcName]?.count)
    const correctGroupingCount = bcPageLimit != null && bcCount != null && bcPageLimit >= bcCount

    useEffect(() => {
        if (isGroupingHierarchy) {
            setEnabledGrouping(correctGroupingCount)
        }
    }, [correctGroupingCount, isGroupingHierarchy])

    const { t } = useTranslation()

    const bcRowMeta = useAppSelector(state => {
        const bcUrl = buildBcUrl(bcName, true, state)

        return bcUrl ? state.view.rowMeta[bcName]?.[bcUrl] : undefined
    })

    const selectCell = useCallback(
        (recordId: string, fieldKey: string) => {
            dispatch(actions.selectTableCellInit({ widgetName, rowId: recordId, fieldKey }))
        },
        [dispatch, widgetName]
    )

    const columns: Array<ColumnProps<interfaces.DataItem>> = React.useMemo(() => {
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
                        render: (text: string, dataItem: interfaces.DataItem) => {
                            const editMode =
                                isAllowEdit &&
                                selectedCell &&
                                item.key === selectedCell.fieldKey &&
                                widgetName === selectedCell.widgetName &&
                                dataItem.id === selectedCell.rowId &&
                                cursor === selectedCell.rowId
                            const expanded = expandedRowKeys?.includes(dataItem.id) ?? false

                            const isParentRow = !!dataItem.children
                            const isGroupingField = !!meta?.options?.groupingHierarchy?.fields?.includes(item.key)
                            const unallocatedRecord =
                                meta?.options?.groupingHierarchy?.fields.some(key => {
                                    // eslint-disable-next-line eqeqeq
                                    return dataItem?.[key] == undefined || dataItem?.[key] === ''
                                }) ?? false
                            const isExpandCell = isParentRow && isGroupingField && dataItem[item.key]
                            const hideFieldForGroupingHierarchy =
                                isGroupingHierarchy &&
                                ((dataItem.pseudoRow && !isGroupingField) || (!dataItem.pseudoRow && isGroupingField && !editMode))
                            const showField = !hideFieldForGroupingHierarchy || (unallocatedRecord && !isParentRow)

                            return (
                                showField && (
                                    <div
                                        data-test="FIELD"
                                        data-test-field-type={item.type}
                                        data-test-field-title={item.label || item.title}
                                        data-test-field-key={item.key}
                                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                                    >
                                        {isExpandCell && (
                                            <ExpandIcon
                                                className={styles.parentExpandIcon}
                                                expanded={expanded}
                                                onClick={() => {
                                                    onParentExpand?.(!expanded, dataItem.id)
                                                }}
                                                openIcon="up"
                                                openRotate={90}
                                                closeIcon="down"
                                            />
                                        )}
                                        <Field
                                            data={dataItem}
                                            bcName={bcName}
                                            cursor={dataItem.id}
                                            widgetName={widgetName}
                                            widgetFieldMeta={item as WidgetListField}
                                            readonly={!editMode}
                                            forceFocus={editMode}
                                            className={styles.tableField}
                                        />
                                    </div>
                                )
                            )
                        },
                        onCell: isAllowEdit
                            ? (record: interfaces.DataItem, rowIndex: number) => {
                                  const isParentRow = !!record.children

                                  return !isParentRow
                                      ? {
                                            onDoubleClick: (event: React.MouseEvent) => {
                                                selectCell(record.id, item.key)
                                            }
                                        }
                                      : {}
                              }
                            : undefined,
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
        meta?.type,
        meta?.options?.groupingHierarchy?.fields,
        showCloseButton,
        handleColumnClose,
        widgetName,
        isAllowEdit,
        selectedCell,
        cursor,
        expandedRowKeys,
        bcName,
        onParentExpand,
        selectCell
    ])

    const resultColumns = React.useMemo(() => {
        const controlColumnsLeft: Array<ColumnProps<interfaces.DataItem>> = []
        const controlColumnsRight: Array<ColumnProps<interfaces.DataItem>> = []
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
                rowKey={ROW_KEY}
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
                            {isGroupingHierarchy && (
                                <Tooltip
                                    title={
                                        !correctGroupingCount
                                            ? t(
                                                  `Worning! {{count}} rows were fetched from backend - limit for "Grouping Hierarhical" mode is {{limit}}. Only "List" mode is available`,
                                                  { limit: bcPageLimit, count: bcCount }
                                              )
                                            : undefined
                                    }
                                    trigger="hover"
                                >
                                    <div style={{ display: 'inline-block' }}>
                                        <Button
                                            type="empty"
                                            className={cn(styles.treeButton, { [styles.active]: enabledGrouping })}
                                            disabled={!correctGroupingCount}
                                            onClick={() => {
                                                setEnabledGrouping(!enabledGrouping)
                                            }}
                                        >
                                            <Icon type="apartment" />
                                        </Button>
                                    </div>
                                </Tooltip>
                            )}
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

export default React.memo(Table)
