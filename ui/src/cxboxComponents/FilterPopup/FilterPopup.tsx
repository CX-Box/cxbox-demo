/**
 * Opens when column filter requested
 */

import React, { FormEvent } from 'react'
import { Button, Form } from 'antd'
import styles from './FilterPopup.less'
import { useAppDispatch, useAppSelector } from '@store'
import { actions, interfaces, utils } from '@cxbox-ui/core'
import { useTranslation } from 'react-i18next'

export interface FilterPopupProps {
    widgetName: string
    fieldKey: string
    value: interfaces.DataValue | interfaces.DataValue[]
    children: React.ReactNode
    fieldType?: interfaces.FieldType
    onApply?: () => void
    onCancel?: () => void
}

const { FieldType, FilterType } = interfaces

/**
 *
 * @param props
 * @category Components
 */
export const FilterPopup: React.FC<FilterPopupProps> = props => {
    const widget = useAppSelector(state => {
        return state.view.widgets.find(item => item.name === props.widgetName)
    })
    const widgetBcName = widget?.bcName as string

    const viewName = useAppSelector(state => {
        return state.view.name
    })
    const filter = useAppSelector(state => {
        return state.screen.filters[widgetBcName]?.find(item => item.fieldName === props.fieldKey)
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
            type:
                widget?.options?.filterDateByRange &&
                [FieldType.date, FieldType.dateTime, FieldType.dateTimeWithSeconds].includes(props.fieldType as interfaces.FieldType)
                    ? FilterType.range
                    : utils.getFilterType(widgetMeta.type),
            value: props.value,
            fieldName: props.fieldKey,
            viewName,
            widgetName: widget?.name
        }
        if (props.value === null || props.value === undefined) {
            dispatch(actions.bcRemoveFilter({ bcName: widgetBcName, filter: filter as interfaces.BcFilter }))
        } else {
            dispatch(actions.bcAddFilter({ bcName: widgetBcName, filter: newFilter, widgetName: widget?.name }))
        }
        // FullHierarchy has its own implementation of data search without backend query filtered data
        if (!widget?.options?.hierarchyFull) {
            dispatch(actions.bcForceUpdate({ bcName: widgetBcName }))
        }
        props.onApply?.()
    }

    const handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        if (filter) {
            dispatch(actions.bcRemoveFilter({ bcName: widgetBcName, filter }))
            if (!widget?.options?.hierarchyFull) {
                dispatch(actions.bcForceUpdate({ bcName: widgetBcName }))
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
