import React from 'react'
import ColumnFilter from './ColumnFilter'
import cn from 'classnames'
import ColumnSort from './ColumnSort'
import styles from './ColumnTitle.less'
import { CustomFieldTypes } from '@interfaces/widget'
import { interfaces } from '@cxbox-ui/core'
import { TemplatedTitle } from '@cxboxComponents'

interface ColumnTitleProps {
    widgetName: string
    widgetMeta: interfaces.WidgetListField
    rowMeta: interfaces.RowMetaField
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

const ColumnTitle = ({ widgetName, widgetMeta, rowMeta }: ColumnTitleProps) => {
    if (!widgetMeta && !rowMeta) {
        return null
    }

    const title = <TemplatedTitle widgetName={widgetName} title={widgetMeta.title} />

    if (!rowMeta) {
        return <div>{title}</div>
    }

    const sort = !notSortableFields.includes(widgetMeta.type) && (
        <ColumnSort widgetName={widgetName} fieldKey={widgetMeta.key} className={styles.sort} />
    )

    const filter = rowMeta.filterable && <ColumnFilter widgetName={widgetName} widgetMeta={widgetMeta} rowMeta={rowMeta} />

    return (
        <div className={cn(styles.container)}>
            {title}
            {filter}
            {sort}
        </div>
    )
}

export default ColumnTitle
