import React, { ComponentType } from 'react'
import cn from 'classnames'
import ColumnFilter, { ColumnFilterOwnProps } from './ColumnFilter'
import ColumnSort from './ColumnSort'
import TemplatedTitle from '@cxboxComponents/TemplatedTitle/TemplatedTitle'
import { numberFieldTypes } from '@constants/field'
import { interfaces } from '@cxbox-ui/core'
import styles from './ColumnTitle.less'

export interface ColumnTitleProps {
    widgetName: string
    /**
     * Field meta actually
     */
    widgetMeta: interfaces.WidgetListField
    /**
     * Field row meta
     */
    rowMeta: interfaces.RowMetaField
    components?: {
        filter?: ComponentType<ColumnFilterOwnProps>
    }
    className?: string
}

const { FieldType } = interfaces
export const notSortableFields: readonly interfaces.FieldType[] = [
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
export const ColumnTitle: React.FC<ColumnTitleProps> = props => {
    if (!props.widgetMeta && !props.rowMeta) {
        return null
    }

    const title = <TemplatedTitle widgetName={props.widgetName} title={props.widgetMeta.title} />

    if (!props.rowMeta) {
        return (
            <div
                className={cn({
                    [styles.rightAlignment]: numberFieldTypes.includes(props.widgetMeta.type)
                })}
            >
                {title}
            </div>
        )
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
        <div
            className={cn(styles.container, props.className, {
                [styles.rightAlignment]: numberFieldTypes.includes(props.widgetMeta.type)
            })}
        >
            {title}
            {filter}
            {sort}
        </div>
    )
}

export default ColumnTitle
