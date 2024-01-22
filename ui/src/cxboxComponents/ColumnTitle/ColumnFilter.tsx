import React, { memo, useCallback } from 'react'
import { Popover } from 'antd'
import styles from './ColumnFilter.less'
import cn from 'classnames'
import { ReactComponent as FilterIcon } from './filter-solid.svg'
import FilterPopup from '@cxboxComponents/FilterPopup/FilterPopup'
import FilterField from '@cxboxComponents/ui/FilterField/FilterField'
import { useAppDispatch, useAppSelector } from '@store'
import { interfaces } from '@cxbox-ui/core'
import { showViewPopup } from '@actions'

/**
 * @deprecated TODO: Remove in 2.0.0 by merging with ColumnFilterProps
 */
export interface ColumnFilterOwnProps {
    widgetName: string
    widgetMeta: interfaces.WidgetListField
    rowMeta: interfaces.RowMetaField
}

export interface ColumnFilterProps extends ColumnFilterOwnProps {
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of widget
     */
    bcName?: string
    /**
     * @deprecated TODO: Remove in 2.0.0, handled internally
     */
    filter?: interfaces.BcFilter
    /**
     * @deprecated TODO: Remove in 2.0.0, handled internaly
     */
    widget?: interfaces.WidgetMeta
    components?: {
        popup: React.ReactNode
    }
    /**
     * @deprecated TODO: Remove in 2.0.0, handled by ColumnFilterPopup now
     */
    onApply?: (bcName: string, filter: interfaces.BcFilter) => void
    /**
     * @deprecated TODO: Remove in 2.0.0, handled by ColumnFilterPopup now
     */
    onCancel?: (bcName: string, filter: interfaces.BcFilter) => void
    /**
     * @deprecated TODO: Remove in 2.0.0, handled internally
     */
    onMultivalueAssocOpen?: (bcName: string, calleeBCName: string, assocValueKey: string, associateFieldKey: string) => void
}

export function ColumnFilter({ widgetName, widgetMeta, rowMeta, components }: ColumnFilterProps) {
    const widget = useAppSelector(state => state.view.widgets.find(item => item.name === widgetName))
    const bcName = widget?.bcName || ''
    const effectiveFieldMeta: interfaces.WidgetListField =
        (widget?.fields as interfaces.WidgetListField[])?.find(item => item.key === widgetMeta.filterBy) ?? widgetMeta
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
                        associateFieldKey: !isPickList ? fieldMetaMultivalue.associateFieldKey : fieldMeta.key,
                        isFilter: true
                    })
                )
            } else {
                setVisible(!visible)
            }
        },
        [visible, isMultivalue, isPickList, fieldMeta, assocWidget, widget, fieldMetaMultivalue, fieldMetaPickListField, dispatch]
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

/**
 * @category Components
 */
export default memo(ColumnFilter)
