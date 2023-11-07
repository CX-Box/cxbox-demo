/**
 * Opens when column filter requested
 */

import React, { FormEvent } from 'react'
import { Button, Form } from 'antd'
import styles from './FilterPopup.less'
import { CustomFieldTypes } from '@interfaces/widget'
import { actions, interfaces } from '@cxbox-ui/core'
import { useAppDispatch, useAppSelector } from '@store'
import { useTranslation } from 'react-i18next'

interface FilterPopupProps {
    widgetName: string
    fieldKey: string
    value: interfaces.DataValue | interfaces.DataValue[]
    children: React.ReactNode
    fieldType?: interfaces.FieldType
    onApply?: () => void
    onCancel?: () => void
}

const { FieldType, FilterType } = interfaces

const FilterPopup: React.FC<FilterPopupProps> = props => {
    const widget = useAppSelector(state => {
        return state.view.widgets.find(item => item.name === props.widgetName)
    })
    const viewName = useAppSelector(state => {
        return state.view.name
    })
    const filter = useAppSelector(state => {
        return state.screen.filters[widget?.bcName as string]?.find(item => item.fieldName === props.fieldKey)
    })
    const widgetMeta = (widget?.fields as interfaces.WidgetField[])?.find(item => item.key === props.fieldKey)
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    if (!widgetMeta) {
        return null
    }

    const handleApply = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newFilter: interfaces.BcFilter = {
            type: [FieldType.date, FieldType.dateTime, FieldType.dateTimeWithSeconds].includes(props?.fieldType as interfaces.FieldType)
                ? FilterType.range
                : getFilterType(widgetMeta.type),
            value: props.value,
            fieldName: props.fieldKey,
            viewName,
            widgetName: widget?.name as string
        }
        if ((props.value === null || props.value === undefined) && FieldType.checkbox === props.fieldType) {
            dispatch(
                actions.bcAddFilter({
                    bcName: widget?.bcName as string,
                    filter: { ...newFilter, value: false },
                    widgetName: widget?.name as string
                })
            )
        } else if (props.value === null || props.value === undefined) {
            dispatch(actions.bcRemoveFilter({ bcName: widget?.bcName as string, filter: filter as interfaces.BcFilter }))
        } else {
            dispatch(actions.bcAddFilter({ bcName: widget?.bcName as string, filter: newFilter, widgetName: widget?.name as string }))
        }
        // FullHierarchy has its own implementation of data search without backend query filtered data
        if (!widget?.options?.hierarchyFull) {
            dispatch(actions.bcForceUpdate({ bcName: widget?.bcName as string }))
        }
        props.onApply?.()
    }

    const handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        if (filter) {
            dispatch(actions.bcRemoveFilter({ bcName: widget?.bcName as string, filter }))
            if (!widget?.options?.hierarchyFull) {
                dispatch(actions.bcForceUpdate({ bcName: widget?.bcName as string }))
            }
        }
        props.onCancel?.()
    }

    return (
        <Form onSubmit={handleApply} layout="vertical">
            {props.children}
            <div className={styles.operators}>
                <Button className={styles.button} data-test-filter-popup-apply={true} htmlType="submit">
                    {t('Apply')}
                </Button>
                <Button className={styles.button} data-test-filter-popup-clear={true} onClick={handleCancel}>
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
export function getFilterType(fieldType: interfaces.FieldType | CustomFieldTypes) {
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
