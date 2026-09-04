import React from 'react'
import { Checkbox, Icon } from 'antd'
import { WidgetListField } from '@cxbox-ui/schema'
import { TableCell } from '@components/widgets/Table/TableCell'
import { TreeTablePseudoRow } from '@components/widgets/Table/components/TreeTablePseudoRow'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { TableTreeNode, useTableTree } from '@components/widgets/Table/tree/hooks/useTableTree'
import { useTreeRowSelection } from '@components/widgets/Table/tree/hooks/useTreeRowSelection'
import { AppWidgetGroupingHierarchyMeta, AppWidgetTableMeta } from '@interfaces/widget'
import styles from '../Table.less'
import Button from '@components/ui/Button/Button'
import { isDefined } from '@utils/isDefined'
import { TREE_INDENT_SIZE } from '@components/widgets/Table/constants'
import { ReactComponent as ListDotSvg } from '@assets/icons/listDot.svg'
import { ReactComponent as RightWithEllipseSvg } from '@assets/icons/rightWithEllipse.svg'

const EXPAND_ICON_WIDTH = 22
export const PSEUDO_ROW_TYPES: Array<TableTreeNode['_recordType']> = [
    'loading',
    'show-more',
    'empty',
    'restore-ancestors',
    'unallocated-nodes'
]
const EXPANDED_ICON_TYPE = 'down'
const COLLAPSED_ICON_TYPE = 'right'

interface TreeTableCellProps<T extends CustomDataItem> {
    field: WidgetListField
    dataItem: T & TableTreeNode
    isFirstColumn: boolean
    isGroupingHierarchy: boolean
    showSelection: boolean
    widget: AppWidgetTableMeta | AppWidgetGroupingHierarchyMeta
    expandedRowKeys: string[]
    selectNode: ReturnType<typeof useTreeRowSelection>['selectNode']
    getNodeSelectionState: ReturnType<typeof useTreeRowSelection>['getNodeSelectionState']
    handleExpand: ReturnType<typeof useTableTree>['handleExpand']
    createFetchNodesHandler: ReturnType<typeof useTableTree>['createFetchNodesHandler']
    restoreAncestorPaths: ReturnType<typeof useTableTree>['restoreAncestorPaths']
    disableRowExpand?: boolean
    isEditMode: (record: T) => boolean
}

export function TreeTableCell<T extends CustomDataItem>({
    field,
    dataItem,
    isFirstColumn,
    isGroupingHierarchy,
    showSelection,
    widget,
    expandedRowKeys,
    selectNode,
    getNodeSelectionState,
    handleExpand,
    createFetchNodesHandler,
    restoreAncestorPaths,
    disableRowExpand,
    isEditMode
}: TreeTableCellProps<T>) {
    const paddingLeft = (dataItem._level ?? 0) * TREE_INDENT_SIZE + TREE_INDENT_SIZE

    if (PSEUDO_ROW_TYPES.includes(dataItem._recordType)) {
        return isFirstColumn ? (
            <TreeTablePseudoRow
                dataItem={dataItem}
                paddingLeft={paddingLeft}
                showSelection={showSelection}
                selectNode={selectNode}
                getNodeSelectionState={getNodeSelectionState}
                createFetchNodesHandler={createFetchNodesHandler}
                restoreAncestorPaths={restoreAncestorPaths}
            />
        ) : null
    }

    const cell = (
        <TableCell
            item={field}
            dataItem={dataItem as any}
            isGroupingHierarchy={isGroupingHierarchy}
            enabledGrouping={false}
            isEditMode={isEditMode}
            needHideActions={() => false}
            sortedGroupKeys={[]}
            expandedParentRowKeys={[]}
            groupingHierarchyModeAggregate={false}
            processedMeta={widget}
            bcName={widget.bcName}
            widgetName={widget.name}
        />
    )

    if (!isFirstColumn) {
        return cell
    }

    const isExpanded = expandedRowKeys.includes(dataItem.id as string)
    const selectionState = getNodeSelectionState(dataItem)

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ paddingLeft, display: 'flex', alignItems: 'center' }}>
                {!dataItem._treeIsLeaf && dataItem._recordType === 'node' ? (
                    disableRowExpand ? (
                        <Icon component={ListDotSvg} style={{ marginRight: 8, cursor: 'initial', color: 'rgba(0, 0, 0, 0.65)' }} />
                    ) : (
                        <Icon
                            type={isExpanded ? EXPANDED_ICON_TYPE : COLLAPSED_ICON_TYPE}
                            style={{ marginRight: 8, cursor: 'pointer' }}
                            onClick={event => {
                                event.stopPropagation()
                                handleExpand(!isExpanded, dataItem)
                            }}
                        />
                    )
                ) : (
                    <span style={{ display: 'inline-block', width: EXPAND_ICON_WIDTH }} />
                )}
                {dataItem._restorePath && isDefined(dataItem._treeParentId) && (
                    <Button
                        type="Link"
                        size="small"
                        removeIndentation={true}
                        style={{
                            border: 'none',
                            marginRight: 8,
                            color: '#0088bb',
                            background: 'transparent',
                            display: 'inline-flex',
                            alignItems: 'center'
                        }}
                        onClick={event => {
                            event.stopPropagation()
                            restoreAncestorPaths([String(dataItem._treeParentId)])
                        }}
                    >
                        <Icon component={() => <RightWithEllipseSvg />} style={{ fontSize: 14, lineHeight: 1, verticalAlign: 'initial' }} />
                    </Button>
                )}
                {showSelection && dataItem._recordType === 'node' && (
                    <Checkbox
                        style={{ marginRight: 8 }}
                        className={selectionState.implicit ? styles.implicitCheckboxMuted : ''}
                        checked={selectionState.checked}
                        indeterminate={selectionState.indeterminate}
                        disabled={selectionState.disabled}
                        onChange={event => selectNode(dataItem, event.target.checked)}
                        onClick={event => event.stopPropagation()}
                    />
                )}
            </span>
            {cell}
        </div>
    )
}
