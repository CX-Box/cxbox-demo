import React, { FunctionComponent, ComponentType } from 'react'
import cn from 'classnames'
import ColumnFilter, { ColumnFilterProps } from './ColumnFilter'
import ColumnSort from './ColumnSort'
import styles from './ColumnTitle.less'
import { RowMetaField, WidgetListField, FieldType } from '@tesler-ui/core'
import { TemplatedTitle } from '@teslerComponents'

export interface ColumnTitleProps {
    widgetName: string
    /**
     * Field meta actually
     */
    widgetMeta: WidgetListField
    /**
     * Field row meta
     */
    rowMeta: RowMetaField
    components?: {
        filter?: ComponentType<ColumnFilterProps>
    }
    className?: string
}

export const notSortableFields: readonly FieldType[] = [
    FieldType.multivalue,
    FieldType.multivalueHover,
    FieldType.multifield,
    FieldType.hidden,
    FieldType.fileUpload,
    FieldType.inlinePickList,
    FieldType.hint
]

/**
 *
 * @param props
 * @category Components
 */
export const ColumnTitle: FunctionComponent<ColumnTitleProps> = props => {
    if (!props.widgetMeta && !props.rowMeta) {
        return null
    }
    const title = <TemplatedTitle widgetName={props.widgetName} title={props.widgetMeta.title} />
    if (!props.rowMeta) {
        return <div>{title}</div>
    }

    const sort = !notSortableFields.includes(props.widgetMeta.type) && (
        <ColumnSort widgetName={props.widgetName} fieldKey={props.widgetMeta.key} className={styles.sort} />
    )

    const filter =
        props.rowMeta.filterable &&
        (props.components?.filter ? (
            <props.components.filter widgetName={props.widgetName} widgetMeta={props.widgetMeta} rowMeta={props.rowMeta} />
        ) : (
            <ColumnFilter widgetName={props.widgetName} widgetMeta={props.widgetMeta} rowMeta={props.rowMeta} />
        ))
    return (
        <div className={cn(styles.container, props.className)}>
            {title}
            {filter}
            {sort}
        </div>
    )
}

export default ColumnTitle
