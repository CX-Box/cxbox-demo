/**
 * Opens when column filter requested
 */

import React, { FormEvent, useMemo } from 'react'
import { Button, Form } from 'antd'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { FieldType, WidgetField, WidgetTypes } from '@cxbox-ui/schema'
import { useAppSelector } from '@store'
import { useAssociateFieldKeyForPickList } from '../ColumnTitle/ColumnFilter'
import { actions } from '@actions'
import { PickListFieldMeta, BcFilter, DataValue, FilterType as CoreFilterType, RowMetaField } from '@cxbox-ui/core'
import { getFilterType } from '@utils/filters'
import { checkboxFilterCounterLimit, checkboxFilterMaxVisibleItems } from '@constants/filter'
import { numberFieldTypes } from '@constants/field'
import { checkboxFilterFieldTypes } from './constants'
import { FilterType } from '@interfaces/filters'
import { CustomFieldTypes } from '@interfaces/widget'
import styles from './FilterPopup.less'

interface FilterPopupProps {
    widgetName: string
    fieldKey: string
    value: DataValue | DataValue[]
    children: React.ReactNode
    rowFieldMeta: RowMetaField
    fieldType?: FieldType
    filterByRangeEnabled?: boolean
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

    const filtersCounter = useMemo(() => {
        if (checkboxFilterFieldTypes.includes(props?.fieldType as FieldType)) {
            const filterValuesLength = props.rowFieldMeta?.filterValues?.length || 0

            if (filterValuesLength > checkboxFilterMaxVisibleItems) {
                const selectedFilterValuesLength = (props.value as DataValue[])?.length || 0

                return selectedFilterValuesLength > checkboxFilterCounterLimit
                    ? ` (${checkboxFilterCounterLimit}+)`
                    : ` (${selectedFilterValuesLength})`
            }
        }

        return null
    }, [props?.fieldType, props.rowFieldMeta?.filterValues?.length, props.value])

    if (!widgetMeta) {
        return null
    }

    const handleApply = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newFilter: BcFilter = {
            type: ([
                FieldType.date,
                FieldType.dateTime,
                FieldType.dateTimeWithSeconds,
                CustomFieldTypes.Time,
                ...(props.filterByRangeEnabled ? numberFieldTypes : [])
            ].includes(props?.fieldType as FieldType | CustomFieldTypes)
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
        if ((props.value === null || props.value === undefined) && FieldType.checkbox === props.fieldType) {
            dispatch(
                actions.bcAddFilter({
                    bcName: widget?.bcName as string,
                    filter: { ...newFilter, value: false },
                    widgetName: widget?.name as string
                })
            )
        } else if (props.value === null || props.value === undefined || (Array.isArray(props.value) && !props.value?.length)) {
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
                    {filtersCounter}
                </Button>
                <Button className={styles.button} data-test-filter-popup-clear={true} onClick={handleCancel}>
                    {t('Clear')}
                </Button>
            </div>
        </Form>
    )
}

export default React.memo(FilterPopup)
