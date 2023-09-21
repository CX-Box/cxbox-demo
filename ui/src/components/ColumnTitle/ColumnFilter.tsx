import React, { memo, useCallback, useEffect } from 'react'
import { Popover } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import styles from './ColumnFilter.less'
import cn from 'classnames'
import { ReactComponent as FilterIcon } from './filter-solid.svg'
import { PickListFieldMeta, WidgetTypes } from '@cxbox-ui/schema'
import { WidgetListField, MultivalueFieldMeta } from '@cxbox-ui/core/interfaces/widget'
import { RowMetaField } from '@cxbox-ui/core/interfaces/rowMeta'
import { AppState } from '../../interfaces/storeSlices'
import { FieldType } from '@cxbox-ui/core/interfaces/view'
import { $do } from '../../actions/types'
import FilterPopup from '../FilterPopup/FilterPopup'
import FilterField from './FilterField'

interface ColumnFilterProps {
    widgetName: string
    widgetMeta: WidgetListField
    rowMeta: RowMetaField

    components?: {
        popup: React.ReactNode
    }
}

function ColumnFilter({ widgetName, widgetMeta, rowMeta, components }: ColumnFilterProps) {
    const widget = useSelector((state: AppState) => state.view.widgets.find(item => item.name === widgetName))
    const bcName = widget?.bcName ?? ''
    const listFields = widget?.fields as WidgetListField[]
    const effectiveFieldMeta = (listFields?.find(item => item.key === widgetMeta.filterBy) ?? widgetMeta) as WidgetListField
    const widgetOptions = widget?.options
    const filter = useSelector((state: AppState) => state.screen.filters[bcName]?.find(item => item.fieldName === effectiveFieldMeta.key))
    const [value, setValue] = React.useState(filter?.value)
    const [visible, setVisible] = React.useState(false)
    const dispatch = useDispatch()

    React.useEffect(() => {
        setValue(filter?.value)
    }, [filter?.value])

    const fieldMeta = effectiveFieldMeta as MultivalueFieldMeta | PickListFieldMeta
    const fieldMetaMultivalue = effectiveFieldMeta as MultivalueFieldMeta
    const fieldMetaPickListField = effectiveFieldMeta as PickListFieldMeta
    const assocWidget = useSelector((state: AppState) =>
        state.view.widgets.find(item => item.bcName === fieldMetaPickListField.popupBcName && item.type === WidgetTypes.AssocListPopup)
    )

    const isPickList = effectiveFieldMeta.type === FieldType.pickList
    const isMultivalue = [FieldType.multivalue, FieldType.multivalueHover].includes(effectiveFieldMeta.type) || isPickList
    const { associateFieldKeyForPickList } = useAssociateFieldKeyForPickList(fieldMetaPickListField)

    const handleVisibleChange = useCallback(
        (eventVisible: boolean) => {
            if (isMultivalue && eventVisible) {
                setVisible(false)

                dispatch(
                    $do.showViewPopup({
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

function getAssociateFieldKeyForPickList(fieldMeta: PickListFieldMeta) {
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

function useAssociateFieldKeyForPickList(fieldMeta: PickListFieldMeta) {
    const isPickList = fieldMeta.type === FieldType.pickList
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
