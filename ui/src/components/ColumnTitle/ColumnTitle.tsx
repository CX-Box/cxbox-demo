import React from 'react'
import { WidgetListField } from '@cxbox-ui/core/interfaces/widget'
import { RowMetaField } from '@cxbox-ui/core/interfaces/rowMeta'
import ColumnFilter from './ColumnFilter'
import { FieldType } from '@cxbox-ui/core/interfaces/view'
import cn from 'classnames'
import ColumnSort from './ColumnSort'
import { TemplatedTitle } from '@cxbox-ui/core'
import styles from './ColumnTitle.less'
import { CustomFieldTypes } from '../../interfaces/widget'

interface ColumnTitleProps {
    widgetName: string
    widgetMeta: WidgetListField
    rowMeta: RowMetaField
}

export const notSortableFields: readonly (FieldType | CustomFieldTypes)[] = [
    CustomFieldTypes.MultipleSelect,
    FieldType.multivalue,
    FieldType.multivalueHover,
    FieldType.multifield,
    FieldType.hidden,
    FieldType.inlinePickList,
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
