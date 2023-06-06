import React, { FunctionComponent, ComponentType } from 'react'
import cn from 'classnames'
import ColumnFilter, { ColumnFilterOwnProps } from './ColumnFilter'
import ColumnSort from './ColumnSort'
import styles from './ColumnTitle.less'
import TemplatedTitle from '@teslerComponents/TemplatedTitle/TemplatedTitle'
import { WidgetListField } from '@tesler-ui/core'
import { RowMetaField } from '@tesler-ui/core'
import { FieldType } from '@tesler-ui/core'

/**
 * TODO: Rename to ColumnTitleProps in 2.0.0
 */
export interface ColumnTitle {
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
        filter?: ComponentType<ColumnFilterOwnProps>
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
export const ColumnTitle: FunctionComponent<ColumnTitle> = props => {
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
