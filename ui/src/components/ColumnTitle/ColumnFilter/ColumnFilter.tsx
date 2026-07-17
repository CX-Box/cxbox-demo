import React, { memo, useCallback, useEffect, useMemo, useState, FormEvent } from 'react'
import { Button, Popover } from 'antd'
import {
    BcFilter,
    DataValue,
    FilterType as CoreFilterType,
    interfaces,
    MultivalueFieldMeta,
    PickListFieldMeta,
    RowMetaField
} from '@cxbox-ui/core'
import { FieldType, WidgetListField } from '@cxbox-ui/schema'
import { useAppDispatch, useAppSelector } from '@store'
import { actions } from '@actions'
import { EFeatureSettingKey } from '@interfaces/session'
import { isRangeFieldType } from '@constants/field'
import { isPartialRangeFilter, transformRangeFilters, getLocalFilterType } from '@utils/filters'
import { useAssociateFieldKeyForPickList } from '@components/ColumnTitle/hooks/useAssociateFieldKeyForPickList'
import FilterField from './FilterField'
import { FilterIcon } from '@components/ColumnTitle/ColumnFilter/ui/FilterIcon'
import FilterForm from '@components/ColumnTitle/ColumnFilter/ui/FilterForm'
import styles from './ColumnFilter.less'
import { useCleanOldRangeFilters } from '@hooks/useCleanOldRangeFilters'
import { checkboxFilterCounterLimit, checkboxFilterFieldTypes, checkboxFilterMaxVisibleItems } from '@constants/filter'
import { selectBcFilters, selectHasBcTree, selectWidget } from '@selectors/selectors'
import { treeActions } from '../../../slices/tree'
import { CustomWidgetTypes } from '@interfaces/widget'

const isFilterValueEmpty = (value: unknown): boolean => {
    if (value === null || value === undefined) {
        return true
    }

    if (Array.isArray(value) && value.length === 0) {
        return true
    }

    return false
}

interface ColumnFilterProps {
    className?: string
    widgetName: string
    widgetMeta: WidgetListField
    rowMeta: RowMetaField
}

function ColumnFilter({ widgetName, widgetMeta: widgetFieldMeta, rowMeta, className }: ColumnFilterProps) {
    const viewName = useAppSelector(state => state.view.name)
    const widget = useAppSelector(selectWidget(widgetName))
    const hasBcTree = useAppSelector(selectHasBcTree(widget?.bcName))
    const filterByRangeEnabled = useAppSelector(
        state =>
            state.session.featureSettings?.find(featureSetting => featureSetting.key === EFeatureSettingKey.filterByRangeEnabled)?.value ===
            'true'
    )
    const effectiveFieldMeta = (widget?.fields as WidgetListField[])?.find(item => item.key === widgetFieldMeta.filterBy) ?? widgetFieldMeta
    const filters = useAppSelector(selectBcFilters(widget?.bcName))

    const { raw: rawFilter, normalized: normalizedFilter } = useMemo(() => {
        const raw = filters?.find(item => item.fieldName === effectiveFieldMeta.key)

        const isRangeFilter = isRangeFieldType(effectiveFieldMeta.type, { filterByRangeEnabled })

        if (isRangeFilter) {
            const fieldFilters = filters?.filter(item => item.fieldName === effectiveFieldMeta.key)
            const partialRangeFilters = fieldFilters?.filter(isPartialRangeFilter)
            // This conversion is done to display the filter value correctly in UI components that expect a range (like date pickers or number ranges),
            // since locally they work with 'range' type, while globally (backend) these transformed into 'greaterOrEqualThan' and 'lessOrEqualThan'.
            if (partialRangeFilters?.length) {
                return {
                    raw: raw,
                    normalized: transformRangeFilters(partialRangeFilters)[0]
                }
            }
        }

        return {
            raw: raw,
            normalized: raw
        }
    }, [effectiveFieldMeta.key, effectiveFieldMeta.type, filterByRangeEnabled, filters])

    const [value, setValue] = useState(normalizedFilter?.value)
    const [visible, setVisible] = useState(false)

    const dispatch = useAppDispatch()

    useEffect(() => {
        setValue(normalizedFilter?.value)
    }, [normalizedFilter?.value])

    const fieldMeta = effectiveFieldMeta as MultivalueFieldMeta | PickListFieldMeta
    const fieldMetaMultivalue = effectiveFieldMeta as MultivalueFieldMeta
    const fieldMetaPickListField = effectiveFieldMeta as PickListFieldMeta

    const { associateFieldKeyForPickList } = useAssociateFieldKeyForPickList(fieldMetaPickListField)
    const associateFieldKey = associateFieldKeyForPickList || fieldMetaMultivalue?.associateFieldKey
    const associatedFilter = associateFieldKey ? filters?.find(filter => filter.fieldName === associateFieldKey) : undefined

    const assocWidget = useAppSelector(state =>
        state.view.widgets.find(
            item =>
                item.bcName === fieldMetaPickListField.popupBcName &&
                (item.type === interfaces.WidgetTypes.AssocListPopup || item.type === CustomWidgetTypes.AssocTreePopup)
        )
    )

    const isPickList = effectiveFieldMeta.type === FieldType.pickList
    const isMultivalue = [FieldType.multivalue, FieldType.multivalueHover].includes(effectiveFieldMeta.type)

    const showPopup = useCallback(() => {
        dispatch(
            actions.showViewPopup({
                bcName: fieldMeta.popupBcName as string,
                widgetName: assocWidget?.name,
                calleeBCName: widget?.bcName,
                calleeWidgetName: widget?.name,
                assocValueKey: !isPickList ? fieldMetaMultivalue.assocValueKey : fieldMetaPickListField.pickMap[fieldMeta.key],
                associateFieldKey: !isPickList
                    ? fieldMetaMultivalue.associateFieldKey ?? fieldMeta.key
                    : associateFieldKeyForPickList ?? fieldMeta.key,
                isFilter: true,
                options: {
                    calleeFieldKey: fieldMeta.key
                }
            })
        )
    }, [
        assocWidget?.name,
        associateFieldKeyForPickList,
        dispatch,
        fieldMeta.key,
        fieldMeta.popupBcName,
        fieldMetaMultivalue.assocValueKey,
        fieldMetaMultivalue.associateFieldKey,
        fieldMetaPickListField.pickMap,
        isPickList,
        widget?.bcName,
        widget?.name
    ])

    const cleanOldRangeFilters = useCleanOldRangeFilters(widget?.bcName)

    const clearAssociatedFilter = useCallback(() => {
        if (associatedFilter) {
            dispatch(actions.bcRemoveFilter({ bcName: widget?.bcName as string, filter: associatedFilter }))
        }
    }, [associatedFilter, dispatch, widget?.bcName])

    const handleApply = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()

            if (!widget?.name || !widget.bcName) {
                return
            }

            const newFilter: BcFilter = {
                type: getLocalFilterType(effectiveFieldMeta.type!, { filterByRangeEnabled }) as CoreFilterType,
                value: value,
                fieldName: effectiveFieldMeta.key,
                viewName,
                widgetName: widget.name
            }

            const isValueEmpty = isFilterValueEmpty(value)

            if (effectiveFieldMeta.type === FieldType.pickList) {
                clearAssociatedFilter()

                if (!isValueEmpty && rawFilter && rawFilter.type !== newFilter.type) {
                    dispatch(actions.bcRemoveFilter({ bcName: widget.bcName, filter: rawFilter }))
                    newFilter.value = String(value)
                }
            }

            cleanOldRangeFilters(newFilter)

            if (isValueEmpty) {
                if (effectiveFieldMeta.type === FieldType.checkbox) {
                    dispatch(
                        actions.bcAddFilter({
                            bcName: widget.bcName,
                            filter: { ...newFilter, value: false },
                            widgetName: widget.name
                        })
                    )
                } else if (rawFilter) {
                    dispatch(actions.bcRemoveFilter({ bcName: widget.bcName, filter: rawFilter }))
                }
            } else {
                dispatch(actions.bcAddFilter({ bcName: widget.bcName, filter: newFilter, widgetName: widget.name }))
            }

            const needApplyListFilter = !widget.options?.hierarchyFull && !hasBcTree
            const needApplyTreeFilter = hasBcTree

            if (needApplyListFilter) {
                dispatch(actions.bcForceUpdate({ bcName: widget.bcName }))
            } else if (needApplyTreeFilter) {
                dispatch(treeActions.applyFilter({ bcName: widget.bcName }))
            }

            setVisible(false)
        },
        [
            widget,
            effectiveFieldMeta.type,
            effectiveFieldMeta.key,
            filterByRangeEnabled,
            value,
            viewName,
            cleanOldRangeFilters,
            hasBcTree,
            clearAssociatedFilter,
            rawFilter,
            dispatch
        ]
    )

    const handleCancel = useCallback(
        (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
            e.preventDefault()

            if (effectiveFieldMeta.type === FieldType.pickList) {
                clearAssociatedFilter()
            }

            if (rawFilter) {
                dispatch(actions.bcRemoveFilter({ bcName: widget?.bcName as string, filter: rawFilter }))
            }
            const hasAppliedFilter = rawFilter || associatedFilter
            const needApplyListFilter = hasAppliedFilter && !widget?.options?.hierarchyFull && !hasBcTree
            const needApplyTreeFilter = hasAppliedFilter && hasBcTree

            if (needApplyListFilter) {
                dispatch(actions.bcForceUpdate({ bcName: widget?.bcName as string }))
            } else if (needApplyTreeFilter) {
                dispatch(treeActions.applyFilter({ bcName: widget?.bcName as string }))
            }

            setVisible(false)
            setValue(undefined)
        },
        [
            effectiveFieldMeta.type,
            rawFilter,
            widget?.options?.hierarchyFull,
            widget?.bcName,
            hasBcTree,
            associatedFilter,
            clearAssociatedFilter,
            dispatch
        ]
    )

    const handleVisibleChange = useCallback(
        (eventVisible: boolean) => {
            if (isMultivalue && eventVisible) {
                setVisible(false)
                showPopup()
            } else {
                setVisible(prev => !prev)
            }
        },
        [isMultivalue, showPopup]
    )

    const handlePicklistFilterOpen = useCallback(() => {
        setVisible(false)
        showPopup()
    }, [showPopup])

    const filtersCounter = useMemo(() => {
        if (checkboxFilterFieldTypes.includes(effectiveFieldMeta.type as FieldType)) {
            const filterValuesLength = rowMeta?.filterValues?.length || 0

            if (filterValuesLength > checkboxFilterMaxVisibleItems) {
                const selectedFilterValuesLength = (value as DataValue[])?.length || 0

                return selectedFilterValuesLength > checkboxFilterCounterLimit
                    ? ` (${checkboxFilterCounterLimit}+)`
                    : ` (${selectedFilterValuesLength})`
            }
        }

        return null
    }, [effectiveFieldMeta.type, rowMeta?.filterValues?.length, value])

    const isActiveFilter =
        (normalizedFilter?.value?.toString()?.length as number) > 0 || Array.isArray((normalizedFilter || associatedFilter)?.value)

    if (isMultivalue) {
        return (
            <Popover trigger="click" content={false} visible={false} onVisibleChange={handleVisibleChange}>
                <FilterIcon className={className} active={isActiveFilter} />
            </Popover>
        )
    }

    const content = (
        <FilterForm filtersCounter={filtersCounter} onApply={handleApply} onCancel={handleCancel}>
            <div className={styles.filterContainer}>
                <FilterField
                    widgetFieldMeta={effectiveFieldMeta}
                    rowFieldMeta={rowMeta}
                    value={value}
                    onChange={setValue}
                    widgetOptions={widget?.options}
                    visible={visible}
                    filterByRangeEnabled={filterByRangeEnabled}
                />
                {isPickList && <Button icon="ellipsis" onClick={handlePicklistFilterOpen} />}
            </div>
        </FilterForm>
    )

    return (
        <Popover trigger="click" content={content} visible={visible} onVisibleChange={handleVisibleChange}>
            <FilterIcon className={className} active={isActiveFilter} />
        </Popover>
    )
}

export default memo(ColumnFilter)
