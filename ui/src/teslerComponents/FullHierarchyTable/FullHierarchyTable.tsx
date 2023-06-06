import React, { FunctionComponent } from 'react'
import styles from './FullHierarchyTable.less'
import { Store } from '@interfaces/store'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { Icon, Skeleton, Table } from 'antd'
import { ColumnProps, TableRowSelection, TableEventListeners } from 'antd/lib/table'
import Field from '@teslerComponents/Field/Field'
import ColumnTitle from '@teslerComponents/ColumnTitle/ColumnTitle'
import cn from 'classnames'
import { useHierarchyCache } from './utils/useHierarchyCache'
import { useExpandedKeys } from './utils/useExpandedKeys'
import { WidgetListField, WidgetTableMeta } from '@tesler-ui/core'
import { DataItem, PendingDataItem } from '@tesler-ui/core'
import { BcFilter, FilterType } from '@tesler-ui/core'
import { RowMetaField } from '@tesler-ui/core'
import { AssociatedItem } from '@tesler-ui/core'
import { buildBcUrl, useAssocRecords } from '@tesler-ui/core'
import { FieldType } from '@tesler-ui/core'
import { $do } from '@actions/types'
import { getColumnWidth } from '@utils/hierarchy'

export interface FullHierarchyTableOwnProps {
    meta: WidgetTableMeta
    nestedData?: FullHierarchyDataItem[]
    assocValueKey?: string
    depth?: number
    parentId?: string
    selectable?: boolean
    expandedRowKeys?: string[]
    onRow?: (record: DataItem, index: number) => TableEventListeners
    /**
     * @deprecated TODO: No longer in use, remove in 2.0.0,
     */
    searchPlaceholder?: string
}

interface FullHierarchyTableProps {
    data: FullHierarchyDataItem[]
    loading: boolean
    pendingChanges: Record<string, PendingDataItem>
    bcFilters: BcFilter[]
    rowMetaFields: RowMetaField[]
}

interface FullHierarchyTableDispatchProps {
    onSelect: (bcName: string, depth: number, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => void
    onDeselectAll: (bcName: string, depthFrom: number) => void
    onSelectAll: (bcName: string, parentId: string, depth: number, assocValueKey: string, selected: boolean) => void
    onSelectFullTable?: (bcName: string, dataItems: AssociatedItem[], assocValueKey: string, selected: boolean) => void
    addFilter?: (bcName: string, filter: BcFilter) => void
    removeFilter?: (bcName: string, filter: BcFilter) => void
}

export interface FullHierarchyDataItem extends AssociatedItem {
    parentId: string
    level: number
}

export type FullHierarchyTableAllProps = FullHierarchyTableOwnProps & FullHierarchyTableProps & FullHierarchyTableDispatchProps

type ChildrenAwaredHierarchyItem = FullHierarchyDataItem & { noChildren: boolean }

const emptyData: FullHierarchyDataItem[] = []

const Exp: FunctionComponent = (props: any) => {
    if (!props.onExpand || props.record.noChildren) {
        return null
    }
    return (
        <Icon
            style={{ fontSize: '20px' }}
            type={props.expanded ? 'minus-square' : 'plus-square'}
            onClick={e => props.onExpand(props.record, e)}
        />
    )
}

/**
 *
 * @param props
 * @category Components
 */
export const FullHierarchyTable: React.FunctionComponent<FullHierarchyTableAllProps> = ({
    meta,
    data,
    loading,
    parentId,
    depth = 1,
    bcFilters,
    nestedData,
    pendingChanges,
    expandedRowKeys,
    selectable,
    assocValueKey,
    rowMetaFields,
    onSelectFullTable,
    onSelect,
    onSelectAll,
    onDeselectAll,
    onRow
}) => {
    const { bcName, fields, name: widgetName, options } = meta
    const levelValues = data?.map(item => item.level)
    const maxDepth = (levelValues && levelValues?.length && Math.max(...levelValues)) || 1
    const textFilters = React.useMemo(
        () => bcFilters?.filter(filter => [FilterType.contains, FilterType.equals].includes(filter.type)),
        [bcFilters]
    )
    const [filteredData, searchedAncestorsKeys] = useHierarchyCache(
        widgetName,
        textFilters,
        data,
        depth,
        options?.hierarchyDisableDescendants
    )

    const displayedData = nestedData?.length > 0 && depth > 1 ? nestedData : bcFilters?.length > 0 ? filteredData : data

    const selectedRecords = useAssocRecords(displayedData, pendingChanges)

    const [expandedKeys, setExpandedKeys] = useExpandedKeys(
        expandedRowKeys,
        selectedRecords,
        filteredData,
        textFilters,
        searchedAncestorsKeys,
        meta.options?.hierarchyDisableDescendants
    )

    const handleExpand = (expanded: boolean, dataItem: DataItem) => {
        setExpandedKeys(expanded ? [...expandedKeys, dataItem.id] : [...expandedKeys].filter(item => item !== dataItem.id))
    }

    const {
        hierarchyGroupSelection,
        hierarchyGroupDeselection,
        hierarchyRadioAll,
        hierarchyRadio: hierarchyRootRadio,
        hierarchyDisableRoot,
        hierarchyDisableParent
    } = options ?? {}

    const tableRecords = React.useMemo<ChildrenAwaredHierarchyItem[]>(() => {
        return displayedData
            ?.filter(dataItem => {
                return dataItem.level === depth && (dataItem.level === 1 || dataItem.parentId === parentId)
            })
            .map(filteredItem => {
                return {
                    ...filteredItem,
                    noChildren: !displayedData.find(dataItem => dataItem.parentId === filteredItem.id)
                }
            })
    }, [displayedData, parentId, depth])

    const rowSelection: TableRowSelection<DataItem> = React.useMemo(() => {
        if (selectable) {
            return {
                type: 'checkbox',
                selectedRowKeys: selectedRecords.map(item => item.id),
                onSelectAll: () => {
                    const selected = selectedRecords?.length ? false : true
                    onSelectFullTable(bcName, data, assocValueKey, selected)
                },
                onSelect: (record: AssociatedItem, selected: boolean) => {
                    const dataItem = {
                        ...record,
                        _associate: selected,
                        _value: record[assocValueKey]
                    }

                    if (hierarchyRadioAll) {
                        onDeselectAll(bcName, depth)
                    } else if (hierarchyRootRadio && depth === 1 && selected) {
                        const rootSelectedRecord = selectedRecords.find(item => item.level === 1)
                        if (rootSelectedRecord) {
                            onSelect(bcName, depth, { ...rootSelectedRecord, _associate: false }, widgetName, assocValueKey)
                        }
                    }

                    if ((!selected && hierarchyGroupDeselection) || (selected && hierarchyGroupSelection)) {
                        onSelectAll(bcName, record.id, depth + 1, assocValueKey, selected)
                    }

                    onSelect(bcName, depth, dataItem, widgetName, assocValueKey)
                }
            }
        }
        return undefined
    }, [
        bcName,
        onSelect,
        selectedRecords,
        assocValueKey,
        depth,
        hierarchyRootRadio,
        hierarchyGroupSelection,
        hierarchyGroupDeselection,
        hierarchyRadioAll,
        data,
        onDeselectAll,
        onSelectAll,
        onSelectFullTable,
        selectable,
        widgetName
    ])

    // Nested hierarchy level is drown by another table
    const nestedHierarchy = (record: DataItem, index: number, indent: number, expanded: boolean) => {
        return (
            <ConnectedFullHierarchyTable
                meta={meta}
                assocValueKey={assocValueKey}
                depth={depth + 1}
                parentId={record.id}
                selectable={selectable}
                onRow={onRow}
            />
        )
    }

    // Hierarchy levels are indented by empty columns with calculated width
    const indentColumn = React.useMemo(() => {
        return {
            title: '',
            key: '_indentColumn',
            dataIndex: null as string,
            className: cn(styles.selectColumn, styles[`padding${depth - 1}`]),
            width: getColumnWidth('_indentColumn', depth, fields, rowMetaFields, maxDepth),
            render: (text: string, dataItem: AssociatedItem): React.ReactNode => {
                return null
            }
        }
    }, [depth, fields, rowMetaFields, maxDepth])

    const processedFields: WidgetListField[] = React.useMemo(
        () =>
            fields?.map(item => {
                return item.type === FieldType.multivalue ? { ...item, type: FieldType.multivalueHover } : item
            }),
        [fields]
    )

    const columns: Array<ColumnProps<DataItem>> = React.useMemo(() => {
        return [
            indentColumn,
            ...processedFields
                ?.filter(item => item.type !== FieldType.hidden && !item.hidden)
                .map(item => ({
                    title: (
                        <ColumnTitle widgetName={widgetName} widgetMeta={item} rowMeta={rowMetaFields?.find(rm => rm.key === item.key)}>
                            {item.title}
                        </ColumnTitle>
                    ),
                    key: item.key,
                    dataIndex: item.key,
                    width: getColumnWidth(item.key, depth, processedFields, rowMetaFields, maxDepth, item.width),
                    render: (text: string, dataItem: AssociatedItem) => {
                        return (
                            /**
                             * Column width problems
                             * https://github.com/ant-design/ant-design/issues/13825
                             */
                            <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
                                <Field bcName={bcName} cursor={dataItem.id} widgetName={widgetName} widgetFieldMeta={item} readonly />
                            </div>
                        )
                    }
                }))
        ]
    }, [depth, processedFields, widgetName, indentColumn, bcName, maxDepth, rowMetaFields])

    const handleRow = React.useCallback(
        (record: ChildrenAwaredHierarchyItem, index: number) => {
            if (hierarchyDisableRoot && depth === 1) {
                return undefined
            }
            if (hierarchyDisableParent && !record.noChildren) {
                return undefined
            }
            return onRow?.(record, index)
        },
        [onRow, hierarchyDisableRoot, hierarchyDisableParent, depth]
    )

    return loading ? (
        <Skeleton loading paragraph={{ rows: 5 }} />
    ) : (
        <div className={styles.container}>
            <Table
                className={styles.table}
                rowSelection={rowSelection}
                rowKey="id"
                columns={columns}
                pagination={false}
                showHeader={depth === 1}
                expandIcon={Exp as any}
                defaultExpandedRowKeys={undefined}
                expandedRowKeys={expandedKeys}
                onExpand={handleExpand}
                dataSource={tableRecords}
                expandedRowRender={nestedHierarchy}
                expandIconAsCell={false}
                expandIconColumnIndex={selectable ? 1 : 0}
                loading={loading}
                onRow={handleRow}
                getPopupContainer={(trigger: HTMLElement) => trigger.parentNode.parentNode as HTMLElement}
            />
        </div>
    )
}

function mapStateToProps(store: Store, ownProps: FullHierarchyTableOwnProps): FullHierarchyTableProps {
    const bcName = ownProps.meta.bcName
    const bc = store.screen.bo.bc[bcName]
    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = store.view.rowMeta[bcName]?.[bcUrl]
    const loading = bc?.loading || !rowMeta
    return {
        loading: loading,
        data: loading ? emptyData : (store.data[bcName] as FullHierarchyDataItem[]),
        pendingChanges: store.view.pendingDataChanges[bcName],
        bcFilters: store.screen.filters[bcName],
        rowMetaFields: store.view.rowMeta[bcName]?.[bcUrl]?.fields
    }
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: FullHierarchyTableOwnProps): FullHierarchyTableDispatchProps {
    return {
        onSelect: (bcName: string, depth: number, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => {
            dispatch($do.changeAssociationFull({ bcName, depth, widgetName: widgetName, dataItem, assocValueKey }))
        },
        onDeselectAll: (bcName: string, depthFrom: number) => {
            dispatch($do.dropAllAssociationsFull({ bcName, depth: depthFrom, dropDescendants: true }))
        },
        onSelectAll: (bcName: string, parentId: string, depth: number, assocValueKey: string, selected: boolean) => {
            dispatch($do.changeDescendantsAssociationsFull({ bcName, parentId, depth, assocValueKey, selected }))
        },
        onSelectFullTable: (bcName: string, dataItems: AssociatedItem[], assocValueKey: string, selected: boolean) => {
            dispatch($do.changeChildrenAssociations({ bcName, assocValueKey, selected }))
        }
    }
}

const ConnectedFullHierarchyTable = connect(mapStateToProps, mapDispatchToProps)(FullHierarchyTable)
/**
 * @category Components
 */
export default ConnectedFullHierarchyTable
