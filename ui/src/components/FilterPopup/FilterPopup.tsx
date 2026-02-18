/**
 * Opens when column filter requested
 */

import React, { FormEvent, useCallback, useMemo } from 'react'
import { Button, Form } from 'antd'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { FieldType, WidgetField } from '@cxbox-ui/schema'
import { useAppSelector } from '@store'
import { useAssociateFieldKeyForPickList } from '../ColumnTitle/hooks/useAssociateFieldKeyForPickList'
import { actions } from '@actions'
import { BcFilter, DataValue, FilterType as CoreFilterType, PickListFieldMeta, RowMetaField } from '@cxbox-ui/core'
import { getLocalFilterType } from '@utils/filters'
import { checkboxFilterCounterLimit, checkboxFilterMaxVisibleItems } from '@constants/filter'
import { checkboxFilterFieldTypes } from './constants'
import styles from './FilterPopup.module.less'
import { selectBcFilters } from '@selectors/selectors'
import { useCleanOldRangeFilters } from '@hooks/useCleanOldRangeFilters'

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

const isFilterValueEmpty = (value: unknown): boolean => {
    if (value === null || value === undefined) {
        return true
    }

    if (Array.isArray(value) && value.length === 0) {
        return true
    }

    return false
}

const FilterPopup: React.FC<FilterPopupProps> = props => {
    const { fieldType, filterByRangeEnabled, value, widgetName, fieldKey, onApply } = props

    const widget = useAppSelector(state => {
        return state.view.widgets.find(item => item.name === widgetName)
    })
    const viewName = useAppSelector(state => {
        return state.view.name
    })
    const filters = useAppSelector(selectBcFilters(widget?.bcName))

    const filter = filters?.find(item => item.fieldName === fieldKey)
    const widgetMeta = (widget?.fields as WidgetField[])?.find(item => item.key === props.fieldKey)
    const fieldMetaPickListField = widgetMeta as PickListFieldMeta

    const { associateFieldKeyForPickList } = useAssociateFieldKeyForPickList(fieldMetaPickListField)
    const associatedFilter = associateFieldKeyForPickList
        ? filters?.find(filter => filter.fieldName === associateFieldKeyForPickList)
        : undefined

    const dispatch = useDispatch()
    const { t } = useTranslation()

    const cleanOldRangeFilters = useCleanOldRangeFilters(widget?.bcName)

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

    const clearAssociatedFilter = useCallback(() => {
        if (associatedFilter) {
            dispatch(actions.bcRemoveFilter({ bcName: widget?.bcName as string, filter: associatedFilter }))
        }
    }, [associatedFilter, dispatch, widget?.bcName])

    if (!widgetMeta) {
        return null
    }

    const handleApply = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!widget?.name || !widget.bcName) {
            return
        }

        const newFilter: BcFilter = {
            type: getLocalFilterType(fieldType!, { filterByRangeEnabled }) as CoreFilterType,
            value: value,
            fieldName: fieldKey,
            viewName,
            widgetName: widget.name
        }

        const isValueEmpty = isFilterValueEmpty(value)

        if (fieldType === FieldType.pickList) {
            clearAssociatedFilter()

            if (!isValueEmpty && filter && filter.type !== newFilter.type) {
                dispatch(actions.bcRemoveFilter({ bcName: widget.bcName, filter }))
                newFilter.value = String(value)
            }
        }

        cleanOldRangeFilters(newFilter)

        if (isValueEmpty) {
            if (fieldType === FieldType.checkbox) {
                // For Checkbox, an empty value is 'false'
                dispatch(
                    actions.bcAddFilter({
                        bcName: widget.bcName,
                        filter: { ...newFilter, value: false },
                        widgetName: widget.name
                    })
                )
            } else if (filter) {
                // Delete an existing filter if the value has become empty
                dispatch(actions.bcRemoveFilter({ bcName: widget.bcName, filter }))
            }
        } else {
            // Adding or updating a filter
            dispatch(actions.bcAddFilter({ bcName: widget.bcName, filter: newFilter, widgetName: widget.name }))
        }

        // FullHierarchy has its own implementation of data search without backend query filtered data
        if (!widget.options?.hierarchyFull) {
            dispatch(actions.bcForceUpdate({ bcName: widget.bcName }))
        }

        onApply?.()
    }

    const handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()

        if (fieldType === FieldType.pickList) {
            clearAssociatedFilter()
        }

        if (filter) {
            dispatch(actions.bcRemoveFilter({ bcName: widget?.bcName as string, filter }))
        }

        if ((filter || associatedFilter) && !widget?.options?.hierarchyFull) {
            dispatch(actions.bcForceUpdate({ bcName: widget?.bcName as string }))
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
