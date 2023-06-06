import React, { FunctionComponent } from 'react'
import { Table, Icon } from 'antd'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Store } from '@interfaces/store'
import Field from '@teslerComponents/Field/Field'
import { ColumnProps, TableRowSelection, TableEventListeners } from 'antd/lib/table'
import styles from './SameBcHierarchyTable.less'
import { WidgetListField, WidgetTableMeta } from '@tesler-ui/core'
import { DataItem, PendingDataItem } from '@tesler-ui/core'
import { AssociatedItem } from '@tesler-ui/core'
import { Route } from '@tesler-ui/core'
import { useAssocRecords } from '@tesler-ui/core'
import { FieldType } from '@tesler-ui/core'
import { $do } from '@actions/types'

interface SameBcHierarchyTableOwnProps {
    meta: WidgetTableMeta
    assocValueKey?: string
    depth?: number
    selectable?: boolean
    onRow?: (record: DataItem, index: number) => TableEventListeners
}

export interface SameBcHierarchyTableProps extends SameBcHierarchyTableOwnProps {
    data: AssociatedItem[]
    cursor: string
    parentCursor: string
    route: Route
    loading: boolean
    pendingChanges: Record<string, PendingDataItem>
    onDeselectAll?: (bcName: string, depthFrom: number) => void
    onSelect?: (bcName: string, depth: number, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => void
    onSelectAll?: (bcName: string, depth: number, assocValueKey: string, selected: boolean) => void
    onDrillDown?: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
    onExpand: (bcName: string, depth: number, cursor: string) => void
}

export const Exp: FunctionComponent = (props: any) => {
    if (!props.onExpand) {
        return null
    }
    const type = props.expanded ? 'minus-square' : 'plus-square'
    return (
        <Icon
            style={{ fontSize: '20px' }}
            type={type}
            onClick={e => {
                props.onExpand(props.record, e)
            }}
        />
    )
}

const emptyArray: string[] = []
const emptyData: AssociatedItem[] = []

/**
 *
 * @param props
 * @deprecated TODO: Will be removed in 2.0.0
 * @category Components
 */
export const SameBcHierarchyTable: FunctionComponent<SameBcHierarchyTableProps> = ({
    depth = 1,
    meta,
    data,
    pendingChanges,
    selectable,
    assocValueKey,
    cursor,
    loading,
    onDeselectAll,
    onSelectAll,
    onSelect,
    onExpand,
    onRow
}) => {
    const { bcName, name: widgetName, fields, options = {} } = meta

    const hierarchyGroupSelection = options?.hierarchyGroupSelection
    const hierarchyRadioAll = options?.hierarchyRadioAll
    const hierarchyDisableRoot = options?.hierarchyDisableRoot
    const indentLevel = depth - 1
    const hasNested = data?.length

    const selectedRecords = useAssocRecords(data, pendingChanges, hierarchyRadioAll)

    const rowSelection: TableRowSelection<DataItem> = React.useMemo(() => {
        if (selectable) {
            return {
                type: 'checkbox',
                selectedRowKeys: selectedRecords.map(item => item.id),
                onSelect: (record: AssociatedItem, selected: boolean) => {
                    const dataItem = {
                        ...record,
                        _associate: selected,
                        _value: record[assocValueKey]
                    }

                    if (hierarchyRadioAll) {
                        onDeselectAll(bcName, depth)
                    }
                    if (cursor === record.id && hierarchyGroupSelection) {
                        onSelectAll(bcName, depth + 1, assocValueKey, selected)
                    }

                    onSelect(bcName, depth, dataItem, widgetName, assocValueKey)
                }
            }
        }
        return undefined
    }, [
        bcName,
        onSelect,
        cursor,
        selectedRecords,
        assocValueKey,
        depth,
        hierarchyGroupSelection,
        hierarchyRadioAll,
        onSelectAll,
        onDeselectAll,
        selectable,
        widgetName
    ])

    const [userClosedRecords, setUserClosedRecords] = React.useState([])
    const expandedRowKeys = React.useMemo(() => {
        if (userClosedRecords.includes(cursor)) {
            return emptyArray
        }
        return [cursor]
    }, [cursor, userClosedRecords])

    const handleExpand = (expanded: boolean, dataItem: DataItem) => {
        if (expanded) {
            setUserClosedRecords(userClosedRecords.filter(item => item !== dataItem.id))
            onExpand(bcName, depth, dataItem.id)
        } else {
            setUserClosedRecords([...userClosedRecords, dataItem.id])
        }
    }

    // Вложенный уровень иерархии рисуется новой таблицей
    const nested = (record: DataItem, index: number, indent: number, expanded: boolean) => {
        if (record.id !== cursor) {
            return null
        }
        return (
            <ConnectedHierarchyTable
                meta={meta}
                selectable={selectable}
                assocValueKey={assocValueKey}
                onDrillDown={null}
                depth={depth + 1}
                onRow={onRow}
            />
        )
    }

    // Уровни иерархии отбиваются отступом через пустую колонку с вычисляемой шириной
    const indentColumn = {
        title: '',
        key: '_indentColumn',
        dataIndex: null as string,
        className: styles.selectColumn,
        width: `${50 + indentLevel * 50}px`,
        render: (text: string, dataItem: AssociatedItem): React.ReactNode => {
            return null
        }
    }

    const processedFields: WidgetListField[] = React.useMemo(
        () =>
            fields.map(item => {
                return item.type === FieldType.multivalue ? { ...item, type: FieldType.multivalueHover } : item
            }),
        [fields]
    )

    const columns: Array<ColumnProps<DataItem>> = React.useMemo(() => {
        return [
            indentColumn,
            ...processedFields.map(item => ({
                title: item.title,
                key: item.key,
                dataIndex: item.key,
                render: (text: string, dataItem: any) => {
                    if ([FieldType.multifield, FieldType.multivalueHover].includes(item.type)) {
                        return <Field bcName={bcName} cursor={dataItem.id} widgetName={widgetName} widgetFieldMeta={item} readonly />
                    }
                    return text
                }
            }))
        ]
    }, [indentColumn, processedFields, widgetName, bcName])

    return (
        <div className={styles.container}>
            <Table
                className={styles.table}
                rowSelection={rowSelection}
                rowKey="id"
                columns={columns}
                pagination={false}
                showHeader={depth === 1}
                expandIcon={hasNested ? (Exp as any) : undefined}
                defaultExpandedRowKeys={[cursor]}
                expandedRowKeys={expandedRowKeys}
                onExpand={hasNested ? handleExpand : undefined}
                dataSource={data}
                expandedRowRender={hasNested ? nested : undefined}
                expandIconAsCell={false}
                expandIconColumnIndex={onRow ? 0 : 1}
                loading={loading}
                onRow={!(hierarchyDisableRoot && depth === 1) && onRow}
            />
        </div>
    )
}

function mapStateToProps(store: Store, ownProps: SameBcHierarchyTableOwnProps) {
    const depthLevel = ownProps.depth || 1
    const bcMap = store.screen.bo.bc
    const bcName = ownProps.meta.bcName
    const rootBc = bcMap[bcName]
    const currentBc = depthLevel === 1 ? rootBc : rootBc.depthBc?.[ownProps.depth]
    const parentBc = depthLevel === 1 ? null : depthLevel === 2 ? rootBc : rootBc.depthBc?.[ownProps.depth - 1]

    const loading = currentBc?.loading

    const cursor = currentBc?.cursor
    const parentCursor = parentBc?.cursor
    const pendingChanges = store.view.pendingDataChanges[bcName]
    return {
        data: loading ? emptyData : depthLevel === 1 ? store.data[bcName] : store.depthData[depthLevel]?.[bcName],
        pendingChanges,
        cursor,
        parentCursor,
        route: store.router,
        loading
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onExpand: (bcName: string, depth: number, cursor: string) => {
            dispatch($do.bcSelectDepthRecord({ bcName, depth, cursor }))
        },
        onSelect: (bcName: string, depth: number, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => {
            dispatch($do.changeAssociationSameBc({ bcName, depth, widgetName, dataItem, assocValueKey }))
        },
        onDeselectAll: (bcName: string, depthFrom: number) => {
            dispatch($do.dropAllAssociationsSameBc({ bcName, depthFrom }))
        },
        onSelectAll: (bcName: string, depth: number, assocValueKey: string, selected: boolean) => {
            dispatch($do.changeChildrenAssociationsSameBc({ bcName, depth, assocValueKey, selected }))
        }
    }
}

const ConnectedHierarchyTable = connect(mapStateToProps, mapDispatchToProps)(SameBcHierarchyTable)

/**
 * @deprecated TODO: Will be removed in 2.0.0
 * @category Components
 */
export default ConnectedHierarchyTable
