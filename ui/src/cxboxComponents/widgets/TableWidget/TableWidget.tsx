import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Table } from 'antd'
import { ColumnProps, TableProps } from 'antd/es/table'
import ActionLink from '@cxboxComponents/ui/ActionLink/ActionLink'
import styles from './TableWidget.less'
import Field from '@cxboxComponents/Field/Field'
import ColumnTitle from '@cxboxComponents/ColumnTitle/ColumnTitle'
import cn from 'classnames'
import Pagination from '@cxboxComponents/ui/Pagination/Pagination'
import Select from '@cxboxComponents/ui/Select/Select'
import RowOperationsButton from '@cxboxComponents/RowOperations/RowOperationsButton'
import { RootState } from '@store'
import { actions, interfaces, utils } from '@cxbox-ui/core'
import { useTranslation } from 'react-i18next'
import { useRowMenu } from '@hooks/useRowMenu'
import { buildBcUrl } from '@utils/buildBcUrl'
import { BcFilter } from '@cxbox-ui/core'

const { FieldType, PaginationMode } = interfaces

const { bcAddFilter, bcForceUpdate, bcRemoveAllFilters, selectTableCellInit, showAllTableRecordsInit } = actions

type AdditionalAntdTableProps = Partial<Omit<TableProps<interfaces.DataItem>, 'rowSelection'>>
export interface TableWidgetOwnProps extends AdditionalAntdTableProps {
    columnTitleComponent?: (options?: {
        widgetName: string
        widgetMeta: interfaces.WidgetListField
        rowMeta: interfaces.RowMetaField
    }) => React.ReactNode
    meta: interfaces.WidgetTableMeta
    rowSelection?: TableProps<interfaces.DataItem>['rowSelection']
    showRowActions?: boolean
    allowEdit?: boolean
    paginationMode?: interfaces.PaginationMode
    disablePagination?: boolean
    disableDots?: boolean
    controlColumns?: Array<{ column: ColumnProps<interfaces.DataItem>; position: 'left' | 'right' }>
    header?: React.ReactNode
}

export interface TableWidgetProps extends TableWidgetOwnProps {
    data: interfaces.DataItem[]
    rowMetaFields?: interfaces.RowMetaField[]
    limitBySelf: boolean
    /**
     * @deprecated TODO: Remove in 2.0 in favor of `widgetName`
     */
    bcName?: string
    widgetName?: string
    /**
     * @deprecated TODO: Remove 2.0 as it is accessible from the store
     */
    route?: interfaces.Route
    cursor: string
    selectedCell?: interfaces.ViewSelectedCell
    /**
     * @deprecated TODO: Remove 2.0 as it is never used
     */
    pendingDataItem?: interfaces.PendingDataItem
    hasNext: boolean
    /**
     * @deprecated TODO: Remove in 2.0.0 as it's moved to RowOperationsMenu
     */
    operations?: Array<interfaces.Operation | interfaces.OperationGroup>
    /**
     * @deprecated TODO: Remove in 2.0.0 as it's moved to RowOperationsMenu
     */
    metaInProgress?: boolean
    filters: interfaces.BcFilter[]
    filterGroups?: interfaces.FilterGroup[]
    /**
     * @deprecated TODO: Remove 2.0 as it is never used
     */
    onDrillDown?: (widgetName: string, bcName: string, cursor: string, fieldKey: string) => void
    // TODO: Remove `route` in 2.0 as it is accessible from the store; remove `bcName`
    onShowAll: (bcName: string, cursor: string, route: interfaces.Route, widgetName: string) => void
    /**
     * @deprecated TODO: Remove in 2.0.0 as it's move to RowOperationsMenu
     */
    onOperationClick?: (bcName: string, operationType: string, widgetName: string) => void
    /**
     * @deprecated TODO: At the moment not used but might be useful when introducing table select
     */
    onSelectRow?: (bcName: string, cursor: string) => void
    onSelectCell: (cursor: string, widgetName: string, fieldKey: string) => void
    onRemoveFilters: (bcName: string) => void
    onApplyFilter: (bcName: string, filter: interfaces.BcFilter, widgetName?: string) => void
    onForceUpdate: (bcName: string) => void
}

/**
 *
 * @param props
 * @category Widgets
 */
export const TableWidget: FunctionComponent<TableWidgetProps> = props => {
    const {
        meta,
        rowSelection,
        showRowActions,
        allowEdit,
        paginationMode,
        disablePagination,
        disableDots,
        controlColumns,
        data,
        rowMetaFields,
        limitBySelf,
        bcName,
        widgetName,
        route,
        cursor,
        selectedCell,
        pendingDataItem,
        hasNext,
        filters,
        filterGroups,
        columnTitleComponent,
        onDrillDown,
        onShowAll,
        onSelectCell,
        onRemoveFilters,
        onApplyFilter,
        onForceUpdate,
        onRow: customHandleRow,
        ...rest
    } = props
    /**
     * TODO: What's the difference between props.meta.name and props.widgetName?
     */
    const { bcName: widgetBcName, name: widgetMetaName, fields } = meta

    const isAllowEdit = (props.allowEdit ?? true) && !props.meta.options?.readOnly
    const { t } = useTranslation() // NOSONAR (S6440) hook is called conditionally, fix later

    // eslint-disable-next-line prettier/prettier
    const processCellClick = React.useCallback( // NOSONAR(S6440) hook is called conditionally, fix later
        (recordId: string, fieldKey: string) => {
            onSelectCell(recordId, widgetMetaName, fieldKey)
        },
        [onSelectCell, widgetMetaName]
    )
    // eslint-disable-next-line prettier/prettier
    const processedFields: interfaces.WidgetListField[] = React.useMemo( // NOSONAR(S6440) hook is called conditionally, fix later
        () =>
            fields.map(item => {
                return item.type === FieldType.multivalue ? { ...item, type: FieldType.multivalueHover } : item
            }),
        [fields]
    )

    // eslint-disable-next-line prettier/prettier
    const columns: Array<ColumnProps<interfaces.DataItem>> = React.useMemo(() => { // NOSONAR(S6440) hook is called conditionaly, fix later
        return processedFields
            .filter(item => item.type !== FieldType.hidden && !item.hidden)
            .map(item => {
                const fieldRowMeta = rowMetaFields?.find(field => field.key === item.key)
                return {
                    title: columnTitleComponent ? (
                        columnTitleComponent({
                            widgetName: widgetMetaName,
                            widgetMeta: item,
                            rowMeta: fieldRowMeta as interfaces.RowMetaField
                        })
                    ) : (
                        <ColumnTitle widgetName={widgetMetaName} widgetMeta={item} rowMeta={fieldRowMeta as interfaces.RowMetaField} />
                    ),
                    key: item.key,
                    dataIndex: item.key,
                    width: item.width,
                    render: (text: string, dataItem: interfaces.DataItem) => {
                        const editMode =
                            isAllowEdit &&
                            selectedCell &&
                            item.key === selectedCell.fieldKey &&
                            widgetMetaName === selectedCell.widgetName &&
                            dataItem.id === selectedCell.rowId &&
                            cursor === selectedCell.rowId
                        return (
                            <div
                                data-test="FIELD"
                                data-test-field-type={item.type}
                                data-test-field-title={item.label || item.title}
                                data-test-field-key={item.key}
                            >
                                <Field
                                    data={dataItem}
                                    bcName={widgetBcName}
                                    cursor={dataItem.id}
                                    widgetName={widgetMetaName}
                                    widgetFieldMeta={item}
                                    readonly={!editMode}
                                    forceFocus={editMode}
                                    className={styles.tableField}
                                />
                            </div>
                        )
                    },
                    onCell: isAllowEdit
                        ? (record: interfaces.DataItem, rowIndex: number) => {
                              return {
                                  onDoubleClick: (event: React.MouseEvent) => {
                                      processCellClick(record.id, item.key)
                                  }
                              }
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
            })
    }, [
        columnTitleComponent,
        processedFields,
        processCellClick,
        widgetBcName,
        rowMetaFields,
        widgetMetaName,
        cursor,
        isAllowEdit,
        selectedCell
    ])

    // eslint-disable-next-line prettier/prettier
    const resultColumns = React.useMemo(() => { // NOSONAR(S6440) hook is called conditionally, fix later
        const controlColumnsLeft: Array<ColumnProps<interfaces.DataItem>> = []
        const controlColumnsRight: Array<ColumnProps<interfaces.DataItem>> = []
        props.controlColumns?.forEach(item => {
            item.position === 'left' ? controlColumnsLeft.push(item.column) : controlColumnsRight.push(item.column)
        })
        return [...controlColumnsLeft, ...columns, ...controlColumnsRight]
    }, [columns, props.controlColumns])

    const [filterGroupName, setFilterGroupName] = React.useState<string | null>(null) // NOSONAR(S6440) hook is called conditionally, fix later
    const filtersCount = getFiltersCount(props.filters)
    const filtersExist = !!filtersCount

    // eslint-disable-next-line prettier/prettier
    const handleShowAll = React.useCallback(() => { // NOSONAR(S6440) hook is called conditionally, fix later
        onShowAll(widgetBcName, cursor, null as any, widgetName as string)
    }, [onShowAll, widgetBcName, cursor, widgetName])

    // eslint-disable-next-line prettier/prettier
    const handleRemoveFilters = React.useCallback(() => { // NOSONAR(S6440) hook is called conditionally, fix later
        onRemoveFilters(widgetBcName)
        onForceUpdate(widgetBcName)
    }, [onRemoveFilters, onForceUpdate, widgetBcName])

    // eslint-disable-next-line prettier/prettier
    const handleAddFilters = React.useMemo(() => { // NOSONAR(S6440) hook is called conditionally, fix later
        return (value: string) => {
            const filterGroup = filterGroups?.find(item => item.name === value)
            const parsedFilters = utils.parseFilters(filterGroup?.filters as string)
            setFilterGroupName(filterGroup?.name as string)
            onRemoveFilters(widgetBcName)
            parsedFilters?.forEach(item => onApplyFilter(widgetBcName, item, widgetName))
            onForceUpdate(widgetBcName)
        }
    }, [filterGroups, widgetBcName, widgetName, setFilterGroupName, onRemoveFilters, onApplyFilter, onForceUpdate])

    // eslint-disable-next-line prettier/prettier
    React.useEffect(() => { // NOSONAR(S6440) hook is called conditionally, fix later
        if (!filtersExist) {
            setFilterGroupName(null)
        }
    }, [filtersExist])

    // eslint-disable-next-line prettier/prettier
    const defaultHeader = React.useMemo(() => { // NOSONAR(S6440) hook is called conditionally, fix later
        return (
            <div className={styles.filtersContainer}>
                {!!filterGroups?.length && (
                    <Select
                        value={filterGroupName ?? t('Show all').toString()}
                        onChange={handleAddFilters}
                        dropdownMatchSelectWidth={false}
                    >
                        {filterGroups.map(group => (
                            <Select.Option key={group.name} value={group.name}>
                                <span>{group.name}</span>
                            </Select.Option>
                        ))}
                    </Select>
                )}
                {filtersExist && <ActionLink onClick={handleRemoveFilters}>{t('Clear filters', { count: filtersCount })}</ActionLink>}
                {props.limitBySelf && <ActionLink onClick={handleShowAll}> {t('Show all records')} </ActionLink>}
            </div>
        )
    }, [
        filterGroups,
        filterGroupName,
        t,
        handleAddFilters,
        filtersExist,
        handleRemoveFilters,
        filtersCount,
        props.limitBySelf,
        handleShowAll
    ])

    const [operationsRef, parentRef, onRow] = useRowMenu() // NOSONAR(S6440) hook is called conditionally, fix later
    const handleRow = (record: interfaces.DataItem, index: number) => {
        return {
            ...onRow(record),
            ...customHandleRow?.(record, index),
            'data-test-widget-list-row-id': record.id,
            'data-test-widget-list-row-type': 'Row'
        } as any
    }

    const onHeaderRow = () => {
        return {
            'data-test-widget-list-header': true
        }
    }

    return (
        <div className={styles.tableContainer} ref={parentRef as any}>
            {props.header ?? defaultHeader}
            <Table
                className={cn(styles.table, { [styles.tableWithRowMenu]: props.showRowActions })}
                columns={resultColumns}
                dataSource={props.data}
                rowKey="id"
                rowSelection={props.rowSelection}
                pagination={false}
                onRow={handleRow}
                onHeaderRow={onHeaderRow}
                {...rest}
            />
            {!props.disablePagination && (
                <Pagination bcName={props.meta.bcName} mode={props.paginationMode || PaginationMode.page} widgetName={props.meta.name} />
            )}
            {props.showRowActions && !props.disableDots && (
                <RowOperationsButton meta={props.meta} ref={operationsRef as any} parent={parentRef as any} />
            )}
        </div>
    )
}

function mapStateToProps(state: RootState, ownProps: TableWidgetOwnProps) {
    const bcName = ownProps.meta.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const fields = bcUrl ? state.view.rowMeta[bcName]?.[bcUrl]?.fields : undefined
    const bc = bcName ? state.screen.bo.bc[bcName] : undefined
    const cursor = bc?.cursor as string
    const hasNext = bc?.hasNext as boolean
    const limitBySelf = cursor ? !!state.router.bcPath?.includes(`${bcName}/${cursor}`) : false
    const filters = state.screen.filters[bcName]
    return {
        data: state.data[ownProps.meta.bcName],
        rowMetaFields: fields,
        limitBySelf,
        bcName,
        /**
         * @deprecated
         */
        route: null as unknown as interfaces.Route,
        cursor,
        hasNext,
        selectedCell: state.view.selectedCell,
        /**
         * @deprecated
         */
        pendingDataItem: null as unknown as interfaces.PendingDataItem,
        filters,
        filterGroups: bc?.filterGroups
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onSelectCell: (cursor: string, widgetName: string, fieldKey: string) => {
            dispatch(selectTableCellInit({ widgetName, rowId: cursor, fieldKey }))
        },
        onShowAll: (bcName: string, cursor: string, route?: interfaces.Route) => {
            dispatch(showAllTableRecordsInit({ bcName, cursor }))
        },
        /**
         * @deprecated TODO: Remove in 2.0
         */
        onDrillDown: null as unknown as (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void,
        onRemoveFilters: (bcName: string) => {
            dispatch(bcRemoveAllFilters({ bcName }))
        },
        onApplyFilter: (bcName: string, filter: interfaces.BcFilter, widgetName?: string) => {
            dispatch(bcAddFilter({ bcName, filter, widgetName }))
        },
        onForceUpdate: (bcName: string) => {
            dispatch(bcForceUpdate({ bcName }))
        }
    }
}
TableWidget.displayName = 'TableWidget'

/**
 * @category Widgets
 */
const ConnectedTable = connect(mapStateToProps, mapDispatchToProps)(TableWidget)

export default ConnectedTable

const getFiltersCount = (filters?: BcFilter[]) => {
    return filters?.length ?? 0
}
