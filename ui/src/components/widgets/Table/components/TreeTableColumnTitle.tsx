import React from 'react'
import { Checkbox, Icon } from 'antd'
import { WidgetListField } from '@cxbox-ui/schema'
import ColumnTitle from '@components/ColumnTitle/ColumnTitle'
import { TREE_ROOT_ID } from '@components/widgets/Table/constants'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { useTableTree } from '@components/widgets/Table/tree/hooks/useTableTree'
import { useTreeRowSelection } from '@components/widgets/Table/tree/hooks/useTreeRowSelection'
import { RowMetaField } from '@interfaces/rowMeta'
import styles from '../Table.less'

interface TreeTableColumnTitleProps {
    field: WidgetListField
    rowMeta?: RowMetaField
    widgetName: string
    isFirstColumn: boolean
    showSelection: boolean
    selectNode: ReturnType<typeof useTreeRowSelection>['selectNode']
    getNodeSelectionState: ReturnType<typeof useTreeRowSelection>['getNodeSelectionState']
    handleExpand: ReturnType<typeof useTableTree>['handleExpand']
    isExpanded: boolean
    showCloseButton: boolean
    hideColumn: (fieldKey: string) => void
}

export function TreeTableColumnTitle({
    field,
    rowMeta,
    widgetName,
    isFirstColumn,
    showSelection,
    selectNode,
    getNodeSelectionState,
    handleExpand,
    isExpanded,
    showCloseButton,
    hideColumn
}: TreeTableColumnTitleProps) {
    const title = (
        <ColumnTitle showCloseButton={showCloseButton} onClose={hideColumn} widgetName={widgetName} widgetMeta={field} rowMeta={rowMeta} />
    )

    if (!isFirstColumn) {
        return title
    }

    const selectionState = showSelection ? getNodeSelectionState(TREE_ROOT_ID) : undefined

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icon
                type={isExpanded ? 'down' : 'right'}
                data-test-widget-tree-header-expand={true}
                style={{ marginRight: 8, cursor: 'pointer' }}
                onClick={event => {
                    event.stopPropagation()
                    handleExpand(!isExpanded, { id: null as any } as CustomDataItem)
                }}
            />
            {showSelection && (
                <Checkbox
                    data-test-widget-tree-column-select={true}
                    style={{ marginRight: 8 }}
                    className={selectionState?.implicit ? styles.implicitCheckboxMuted : ''}
                    checked={selectionState?.checked}
                    indeterminate={selectionState?.indeterminate}
                    onChange={event => selectNode(TREE_ROOT_ID, event.target.checked)}
                    onClick={event => event.stopPropagation()}
                />
            )}
            {title}
        </div>
    )
}
