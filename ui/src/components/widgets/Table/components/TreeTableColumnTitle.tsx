import React from 'react'
import { Checkbox } from 'antd'
import { WidgetListField } from '@cxbox-ui/schema'
import ColumnTitle from '@components/ColumnTitle/ColumnTitle'
import { TREE_ROOT_ID } from '@components/widgets/Table/constants'
import { useTreeRowSelection } from '@components/widgets/Table/tree/hooks/useTreeRowSelection'
import { RowMetaField } from '@interfaces/rowMeta'
import styles from '../Table.less'

interface TreeTableColumnTitleProps {
    field: WidgetListField
    rowMeta?: RowMetaField
    widgetName: string
    showSelection: boolean
    selectNode: ReturnType<typeof useTreeRowSelection>['selectNode']
    getNodeSelectionState: ReturnType<typeof useTreeRowSelection>['getNodeSelectionState']
    showCloseButton: boolean
    hideColumn: (fieldKey: string) => void
}

export function TreeTableColumnTitle({
    field,
    rowMeta,
    widgetName,
    showSelection,
    selectNode,
    getNodeSelectionState,
    showCloseButton,
    hideColumn
}: TreeTableColumnTitleProps) {
    const title = (
        <ColumnTitle showCloseButton={showCloseButton} onClose={hideColumn} widgetName={widgetName} widgetMeta={field} rowMeta={rowMeta} />
    )

    if (!showSelection) {
        return title
    }

    const { checked, indeterminate, implicit } = getNodeSelectionState(TREE_ROOT_ID)

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
                style={{ marginRight: 8 }}
                className={implicit ? styles.implicitCheckboxMuted : ''}
                checked={checked}
                indeterminate={indeterminate}
                onChange={event => selectNode(TREE_ROOT_ID, event.target.checked)}
                onClick={event => event.stopPropagation()}
            />
            {title}
        </div>
    )
}
