/**
 * Opens when column filter requested
 */

import React, { FormEvent } from 'react'
import { Button, Form } from 'antd'
import styles from './FilterPopup.less'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FieldType } from '@cxbox-ui/schema'
import { DataValue } from '@cxbox-ui/core/interfaces/data'
import { AppState } from '../../interfaces/storeSlices'
import { WidgetField } from '@cxbox-ui/core/interfaces/widget'
import { BcFilter, FilterType } from '@cxbox-ui/core/interfaces/filters'
import { $do } from '../../actions/types'
import { CustomFieldTypes } from '../../interfaces/widget'

interface FilterPopupProps {
    widgetName: string
    fieldKey: string
    value: DataValue | DataValue[]
    children: React.ReactNode
    fieldType?: FieldType
    onApply?: () => void
    onCancel?: () => void
}

const FilterPopup: React.FC<FilterPopupProps> = props => {
    const widget = useSelector((store: AppState) => {
        return store.view.widgets.find(item => item.name === props.widgetName)
    })
    const viewName = useSelector((store: AppState) => {
        return store.view.name
    })
    const filter = useSelector((store: AppState) => {
        return store.screen.filters[widget?.bcName as string]?.find(item => item.fieldName === props.fieldKey)
    })
    const widgetMeta = (widget?.fields as WidgetField[])?.find(item => item.key === props.fieldKey)
    const dispatch = useDispatch()
    const { t } = useTranslation()
    if (!widgetMeta) {
        return null
    }

    const handleApply = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newFilter: BcFilter = {
            type: [FieldType.date, FieldType.dateTime, FieldType.dateTimeWithSeconds].includes(props?.fieldType as FieldType)
                ? FilterType.range
                : getFilterType(widgetMeta.type),
            value: props.value,
            fieldName: props.fieldKey,
            viewName,
            widgetName: widget?.name as string
        }
        if ((props.value === null || props.value === undefined) && FieldType.checkbox === props.fieldType) {
            dispatch(
                $do.bcAddFilter({
                    bcName: widget?.bcName as string,
                    filter: { ...newFilter, value: false },
                    widgetName: widget?.name as string
                })
            )
        } else if (props.value === null || props.value === undefined) {
            dispatch($do.bcRemoveFilter({ bcName: widget?.bcName as string, filter: filter as BcFilter }))
        } else {
            dispatch($do.bcAddFilter({ bcName: widget?.bcName as string, filter: newFilter, widgetName: widget?.name as string }))
        }
        // FullHierarchy has its own implementation of data search without backend query filtered data
        if (!widget?.options?.hierarchyFull) {
            dispatch($do.bcForceUpdate({ bcName: widget?.bcName as string }))
        }
        props.onApply?.()
    }

    const handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        if (filter) {
            dispatch($do.bcRemoveFilter({ bcName: widget?.bcName as string, filter }))
            if (!widget?.options?.hierarchyFull) {
                dispatch($do.bcForceUpdate({ bcName: widget?.bcName as string }))
            }
        }
        props.onCancel?.()
    }

    return (
        <Form onSubmit={handleApply} layout="vertical">
            {props.children}
            <div className={styles.operators}>
                <Button className={styles.button} htmlType="submit">
                    {t('Apply')}
                </Button>
                <Button className={styles.button} onClick={handleCancel}>
                    {t('Clear')}
                </Button>
            </div>
        </Form>
    )
}

/**
 * @category Components
 */
export default React.memo(FilterPopup)

/**
 * Returns appropriate filtration type for specified field type.
 *
 * - Text-based fields use `contains`
 * - Checkbox fields use `specified` (boolean)
 * - Dictionary fiels use `equalsOneOf`
 *
 * All other field types use strict `equals`
 *
 * @param fieldType Field type
 */
export function getFilterType(fieldType: FieldType | CustomFieldTypes) {
    switch (fieldType) {
        case CustomFieldTypes.MultipleSelect:
        case FieldType.radio:
        case FieldType.dictionary: {
            return FilterType.equalsOneOf
        }
        case FieldType.checkbox: {
            return FilterType.specified
        }
        case FieldType.inlinePickList:
        case FieldType.input:
        case FieldType.fileUpload:
        case FieldType.text: {
            return FilterType.contains
        }
        default:
            return FilterType.equals
    }
}
