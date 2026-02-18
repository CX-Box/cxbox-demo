import React, { useCallback } from 'react'
import { Icon } from 'antd'
import cn from 'classnames'
import ColumnSort from './ColumnSort'
import TemplatedTitle from '@components/TemplatedTitle/TemplatedTitle'
import ColumnFilter from './ColumnFilter'
import Button from '../ui/Button/Button'
import { useAppSelector } from '@store'
import { numberFieldTypes } from '@constants/field'
import { interfaces } from '@cxbox-ui/core'
import { EFeatureSettingKey } from '@interfaces/session'
import { CustomFieldTypes } from '@interfaces/widget'
import { RowMetaField } from '@interfaces/rowMeta'
import styles from './ColumnTitle.module.less'

interface ColumnTitleProps {
    widgetName: string
    widgetMeta: interfaces.WidgetListField
    rowMeta: RowMetaField | undefined
    onClose?: (fieldKey: string) => void
    showCloseButton?: boolean
    disableSort?: boolean
    disableFilter?: boolean
    className?: string
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

const ColumnTitle = ({
    className,
    widgetName,
    widgetMeta,
    rowMeta,
    onClose,
    showCloseButton,
    disableFilter,
    disableSort
}: ColumnTitleProps) => {
    const sortingSetting = useAppSelector(state =>
        state.session.featureSettings?.find(feature => feature.key === EFeatureSettingKey.sortEnabled)
    )
    const isServerSideSortingEnabled = sortingSetting?.value === 'true' || rowMeta?.sortable === true
    const isSortingEnabled = !disableSort && !notSortableFields.includes(widgetMeta.type) && isServerSideSortingEnabled
    const isFilteringEnabled = !disableFilter && rowMeta?.filterable

    const handleColumnClose = useCallback(() => {
        onClose?.(widgetMeta.key)
    }, [onClose, widgetMeta.key])

    const close = (
        <Button
            type="empty"
            style={{
                visibility: showCloseButton ? 'visible' : 'hidden'
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

    const sort = isSortingEnabled && <ColumnSort widgetName={widgetName} fieldKey={widgetMeta.key} className={styles.sort} />

    const filter = isFilteringEnabled && (
        <ColumnFilter className={styles.filter} widgetName={widgetName} widgetMeta={widgetMeta} rowMeta={rowMeta} />
    )

    return (
        <div className={cn(styles.container, className, { [styles.rightAlignment]: numberFieldTypes.includes(widgetMeta.type) })}>
            {title}
            {filter}
            {sort}
            {close}
        </div>
    )
}

export default ColumnTitle
