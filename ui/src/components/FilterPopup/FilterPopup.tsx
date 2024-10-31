/**
 * Opens when column filter requested
 */

import React, { FormEvent } from 'react'
import { Button, Form } from 'antd'
import styles from './FilterPopup.less'
import { CustomFieldTypes } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { useTranslation } from 'react-i18next'
import { FieldType, WidgetField, WidgetTypes } from '@cxbox-ui/schema'
import { useAssociateFieldKeyForPickList } from '../ColumnTitle/ColumnFilter'
import { useDispatch } from 'react-redux'
import { actions } from '@actions'
import { FilterType } from '@interfaces/filters'
import { PickListFieldMeta, BcFilter, DataValue, FilterType as CoreFilterType } from '@cxbox-ui/core'

interface FilterPopupProps {
    widgetName: string
    fieldKey: string
    value: DataValue | DataValue[]
    children: React.ReactNode
    additionalFieldMetaKey?: string
    fieldType?: FieldType
    onApply?: () => void
    onCancel?: () => void
}

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
    const allFilters = useAppSelector(state => {
        return state.screen.filters[widget?.bcName as string]
    })
    const widgetMeta = (widget?.fields as WidgetField[])?.find(item => item.key === props.fieldKey)

    const additionalFieldMetaKey = props.additionalFieldMetaKey as string
    const activeAdditionalFilter = useAppSelector(state => {
        return state.screen.filters[widget?.bcName as string]?.find(item => item.fieldName === additionalFieldMetaKey)
    })
    const localAdditionalFilterValue = useAppSelector(
        state => state.screen.bo.bc[widget?.bcName as string]?.localFilterValues?.[additionalFieldMetaKey]
    )

    const fieldMetaPickListField = widgetMeta as PickListFieldMeta

    const { associateFieldKeyForPickList } = useAssociateFieldKeyForPickList(fieldMetaPickListField)

    const pickListPopupBcName = fieldMetaPickListField?.popupBcName

    const picklistPopupWidget = useAppSelector(state => {
        return state.view.widgets.find(item => {
            return item.type === WidgetTypes.PickListPopup && item.bcName === pickListPopupBcName
        })
    })

    const dispatch = useDispatch()
    const { t } = useTranslation()

    if (!widgetMeta) {
        return null
    }

    const handleApply = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newFilter: BcFilter = {
            type: ([FieldType.date, FieldType.dateTime, FieldType.dateTimeWithSeconds].includes(props?.fieldType as FieldType)
                ? FilterType.range
                : getFilterType(widgetMeta.type)) as CoreFilterType,
            value: props.value,
            fieldName: props.fieldKey,
            viewName,
            widgetName: widget?.name as string
        }
        if (FieldType.pickList === props.fieldType) {
            const foundPickListFilter = allFilters?.find(filter => {
                return filter.fieldName === associateFieldKeyForPickList
            })
            if (foundPickListFilter) {
                dispatch(actions.bcRemoveFilter({ bcName: widget?.bcName as string, filter: foundPickListFilter as BcFilter }))
                picklistPopupWidget?.bcName && dispatch(actions.bcCancelPendingChanges({ bcNames: [picklistPopupWidget?.bcName] }))
            }
        }
        if (additionalFieldMetaKey && localAdditionalFilterValue?.toString()) {
            dispatch(
                actions.bcAddFilter({
                    bcName: widget?.bcName as string,
                    filter: {
                        ...newFilter,
                        type: FilterType.equalsOneOf,
                        fieldName: additionalFieldMetaKey,
                        value: localAdditionalFilterValue
                    },
                    widgetName: widget?.name as string
                })
            )
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
            dispatch(actions.bcRemoveFilter({ bcName: widget?.bcName as string, filter: filter as BcFilter }))
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
        if (filter || activeAdditionalFilter) {
            if (filter) {
                dispatch(actions.bcRemoveFilter({ bcName: widget?.bcName as string, filter }))
            }

            if (activeAdditionalFilter) {
                dispatch(actions.bcRemoveFilter({ bcName: widget?.bcName as string, filter: activeAdditionalFilter }))
            }

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
        case FieldType.pickList:
        case FieldType.input:
        case FieldType.fileUpload:
        case FieldType.text: {
            return FilterType.contains
        }
        default:
            return FilterType.equals
    }
}
