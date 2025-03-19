import React, { useCallback } from 'react'
import { Icon } from 'antd'
import cn from 'classnames'
import ColumnSort from './ColumnSort'
import { TemplatedTitle } from '@cxboxComponents'
import ColumnFilter from './ColumnFilter'
import Button from '../ui/Button/Button'
import { useAppSelector } from '@store'
import { numberFieldTypes } from '@constants/field'
import { interfaces } from '@cxbox-ui/core'
import { EFeatureSettingKey } from '@interfaces/session'
import { CustomFieldTypes } from '@interfaces/widget'
import { RowMetaField } from '@interfaces/rowMeta'
import styles from './ColumnTitle.less'

interface ColumnTitleProps {
    widgetName: string
    widgetMeta: interfaces.WidgetListField
    rowMeta: RowMetaField
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

const ColumnTitle = ({ widgetName, widgetMeta, rowMeta, onClose, showCloseButton }: ColumnTitleProps) => {
    const sortingSetting = useAppSelector(state =>
        state.session.featureSettings?.find(feature => feature.key === EFeatureSettingKey.sortEnabled)
    )
    const isSortingEnabled = sortingSetting?.value === 'true' || rowMeta?.sortable === true

    const handleColumnClose = useCallback(() => {
        onClose?.(widgetMeta.key)
    }, [onClose, widgetMeta.key])

    const fullyHideCloseButton = !widgetMeta.title && !showCloseButton

    const close = (
        <Button
            type="empty"
            style={{
                visibility: showCloseButton ? 'visible' : 'hidden',
                width: fullyHideCloseButton ? 0 : undefined // reduces the size of the header cell if title is missing
            }}
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
                    [styles.rightAlignment]: numberFieldTypes.includes(widgetMeta.type)
                })}
            >
                {title}
            </div>
        )
    }

    const sort = !notSortableFields.includes(widgetMeta.type) && isSortingEnabled && (
        <ColumnSort widgetName={widgetName} fieldKey={widgetMeta.key} className={styles.sort} />
    )

    const filter = rowMeta.filterable && <ColumnFilter widgetName={widgetName} widgetMeta={widgetMeta} rowMeta={rowMeta} />

    return (
        <div className={cn(styles.container, { [styles.rightAlignment]: numberFieldTypes.includes(widgetMeta.type) })}>
            {title}
            {filter}
            {sort}
            {close}
        </div>
    )
}

export default ColumnTitle
