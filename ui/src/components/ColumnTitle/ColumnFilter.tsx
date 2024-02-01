import React, { memo, useCallback, useEffect } from 'react'
import { Popover } from 'antd'
import styles from './ColumnFilter.less'
import cn from 'classnames'
import { ReactComponent as FilterIcon } from './filter-solid.svg'
import { interfaces } from '@cxbox-ui/core'
import FilterPopup from '../FilterPopup/FilterPopup'
import FilterField from './FilterField'
import { useAppDispatch, useAppSelector } from '@store'
import { showViewPopup } from '@actions'

interface ColumnFilterProps {
    widgetName: string
    widgetMeta: interfaces.WidgetListField
    rowMeta: interfaces.RowMetaField

    components?: {
        popup: React.ReactNode
    }
}

function ColumnFilter({ widgetName, widgetMeta, rowMeta, components }: ColumnFilterProps) {
    const widget = useAppSelector(state => state.view.widgets.find(item => item.name === widgetName))
    const bcName = widget?.bcName ?? ''
    const listFields = widget?.fields as interfaces.WidgetListField[]
    const effectiveFieldMeta = (listFields?.find(item => item.key === widgetMeta.filterBy) ?? widgetMeta) as interfaces.WidgetListField
    const widgetOptions = widget?.options
    const filter = useAppSelector(state => state.screen.filters[bcName]?.find(item => item.fieldName === effectiveFieldMeta.key))
    const [value, setValue] = React.useState(filter?.value)
    const [visible, setVisible] = React.useState(false)
    const dispatch = useAppDispatch()

    React.useEffect(() => {
        setValue(filter?.value)
    }, [filter?.value])

    const fieldMeta = effectiveFieldMeta as interfaces.MultivalueFieldMeta | interfaces.PickListFieldMeta
    const fieldMetaMultivalue = effectiveFieldMeta as interfaces.MultivalueFieldMeta
    const fieldMetaPickListField = effectiveFieldMeta as interfaces.PickListFieldMeta
    const assocWidget = useAppSelector(state =>
        state.view.widgets.find(
            item => item.bcName === fieldMetaPickListField.popupBcName && item.type === interfaces.WidgetTypes.AssocListPopup
        )
    )

    const isPickList = effectiveFieldMeta.type === interfaces.FieldType.pickList
    const isMultivalue =
        [interfaces.FieldType.multivalue, interfaces.FieldType.multivalueHover].includes(effectiveFieldMeta.type) || isPickList
    const { associateFieldKeyForPickList } = useAssociateFieldKeyForPickList(fieldMetaPickListField)

    const handleVisibleChange = useCallback(
        (eventVisible: boolean) => {
            if (isMultivalue && eventVisible) {
                setVisible(false)

                dispatch(
                    showViewPopup({
                        bcName: fieldMeta.popupBcName as string,
                        widgetName: assocWidget?.name,
                        calleeBCName: widget?.bcName,
                        calleeWidgetName: widget?.name,
                        assocValueKey: !isPickList ? fieldMetaMultivalue.assocValueKey : fieldMetaPickListField.pickMap[fieldMeta.key],
                        associateFieldKey: !isPickList
                            ? fieldMetaMultivalue.associateFieldKey ?? fieldMeta.key
                            : associateFieldKeyForPickList ?? fieldMeta.key,
                        isFilter: true
                    })
                )
            } else {
                setVisible(!visible)
            }
        },
        [
            isMultivalue,
            dispatch,
            fieldMeta.popupBcName,
            fieldMeta.key,
            assocWidget?.name,
            widget?.bcName,
            widget?.name,
            isPickList,
            fieldMetaMultivalue.assocValueKey,
            fieldMetaMultivalue.associateFieldKey,
            fieldMetaPickListField.pickMap,
            associateFieldKeyForPickList,
            visible
        ]
    )

    const handleApply = useCallback(() => {
        setVisible(false)
    }, [])

    const handleClose = useCallback(() => {
        setVisible(false)
        setValue(undefined)
    }, [])

    const content = components?.popup ?? (
        <FilterPopup
            widgetName={widgetName}
            fieldKey={effectiveFieldMeta.key}
            value={value}
            onApply={handleApply}
            onCancel={handleClose}
            fieldType={effectiveFieldMeta.type}
        >
            <FilterField
                widgetFieldMeta={effectiveFieldMeta}
                rowFieldMeta={rowMeta}
                value={value}
                onChange={setValue}
                widgetOptions={widgetOptions}
                visible={visible}
            />
        </FilterPopup>
    )

    return (
        <Popover
            trigger="click"
            content={!isMultivalue && content}
            visible={!isMultivalue && visible}
            onVisibleChange={handleVisibleChange}
        >
            <div
                className={cn(styles.icon, { [styles.active]: (filter?.value?.toString()?.length as number) > 0 })}
                data-test-widget-list-header-column-filter={true}
            >
                <FilterIcon />
            </div>
        </Popover>
    )
}

export default memo(ColumnFilter)

function getAssociateFieldKeyForPickList(fieldMeta: interfaces.PickListFieldMeta) {
    if (!fieldMeta?.pickMap) {
        return null
    }

    return Object.entries(fieldMeta.pickMap).reduce((acc: null | string, [key, value]) => {
        if (value === 'id') {
            return key
        }

        return acc
    }, null)
}

function useAssociateFieldKeyForPickList(fieldMeta: interfaces.PickListFieldMeta) {
    const isPickList = fieldMeta.type === interfaces.FieldType.pickList
    const associateFieldKeyForPickList = getAssociateFieldKeyForPickList(fieldMeta)

    useEffect(() => {
        if (isPickList && !associateFieldKeyForPickList) {
            console.info(`pickmap with "id" on right side not found - filter will be applied to field referenced in "key"`)
        }
    }, [associateFieldKeyForPickList, isPickList])

    return {
        associateFieldKeyForPickList
    }
}
