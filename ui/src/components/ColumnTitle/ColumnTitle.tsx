import React, { useCallback } from 'react'
import ColumnFilter from './ColumnFilter'
import cn from 'classnames'
import ColumnSort from './ColumnSort'
import styles from './ColumnTitle.less'
import { CustomFieldTypes } from '@interfaces/widget'
import { interfaces } from '@cxbox-ui/core'
import { TemplatedTitle } from '@cxboxComponents'
import { Icon } from 'antd'
import Button from '../ui/Button/Button'

interface ColumnTitleProps {
    widgetName: string
    widgetMeta: interfaces.WidgetListField
    rowMeta: interfaces.RowMetaField
    onClose?: (fieldKey: string) => void
    showCloseButton?: boolean
}

const { FieldType } = interfaces

export const notSortableFields: readonly (interfaces.FieldType | CustomFieldTypes)[] = [
    CustomFieldTypes.MultipleSelect,
    FieldType.multivalue,
    FieldType.multivalueHover,
    FieldType.multifield,
    FieldType.hidden,
    FieldType.hint
]

const rightAlignedFields: readonly (interfaces.FieldType | CustomFieldTypes)[] = [FieldType.number, FieldType.money, FieldType.percent]

const ColumnTitle = ({ widgetName, widgetMeta, rowMeta, onClose, showCloseButton }: ColumnTitleProps) => {
    const handleColumnClose = useCallback(() => {
        onClose?.(widgetMeta.key)
    }, [onClose, widgetMeta.key])

    const close = (
        <Button
            type="empty"
            style={{ visibility: showCloseButton ? 'visible' : 'hidden' }}
            className={styles.closeButton}
            onClick={handleColumnClose}
        >
            <Icon type="close" />
        </Button>
    )

    if (!widgetMeta && !rowMeta) {
        return null
    }

    const title = <TemplatedTitle widgetName={widgetName} title={widgetMeta.title} />

    if (!rowMeta) {
        return (
            <div
                className={cn({
                    [styles.rightAlignment]: rightAlignedFields.includes(widgetMeta.type)
                })}
            >
                {title}
            </div>
        )
    }

    const sort = !notSortableFields.includes(widgetMeta.type) && (
        <ColumnSort widgetName={widgetName} fieldKey={widgetMeta.key} className={styles.sort} />
    )

    const filter = rowMeta.filterable && <ColumnFilter widgetName={widgetName} widgetMeta={widgetMeta} rowMeta={rowMeta} />

    return (
        <div className={cn(styles.container, { [styles.rightAlignment]: rightAlignedFields.includes(widgetMeta.type) })}>
            {title}
            {filter}
            {sort}
            {close}
        </div>
    )
}

export default ColumnTitle
