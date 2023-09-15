import React, { memo, useCallback } from 'react'
import { Popover } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import styles from './ColumnFilter.less'
import cn from 'classnames'
import { ReactComponent as FilterIcon } from './filter-solid.svg'
import FilterPopup from '../FilterPopup/FilterPopup'
import { FieldType, PickListFieldMeta, WidgetTypes, RowMetaField, useFilter, WidgetListField, MultivalueFieldMeta } from '@cxbox-ui/core'
import { AppState } from '@interfaces/storeSlices'
import { $do } from '@actions'
import { FilterField } from '@teslerComponents'

export interface ColumnFilterProps {
    widgetName: string
    widgetMeta: WidgetListField
    rowMeta: RowMetaField
    components?: {
        popup: React.ReactNode
    }
}

export function ColumnFilter({ widgetName, widgetMeta, rowMeta, components }: ColumnFilterProps) {
    const { widget, hiddenFilter, filter, widgetField, applyFilter, cancelFilter, value, changeValue } = useFilter({
        widgetName,
        fieldKey: widgetMeta.key
    })

    const [visible, setVisible] = React.useState(false)

    const dispatch = useDispatch()

    const fieldMeta = widgetField as MultivalueFieldMeta | PickListFieldMeta

    const assocWidget = useSelector((store: AppState) =>
        store.view.widgets.find(item => item.bcName === fieldMeta.popupBcName && item.type === WidgetTypes.AssocListPopup)
    )

    const isMultivalue = isMultivalueField(widgetField.type)

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
                        ...getPopupAssocKeys(fieldMeta),
                        isFilter: true
                    })
                )
            } else {
                setVisible(!visible)
            }
        },
        [visible, isMultivalue, fieldMeta, assocWidget, widget, dispatch]
    )

    const handleApply = useCallback(() => {
        applyFilter()
        setVisible(false)
    }, [applyFilter])

    const handleClose = useCallback(() => {
        cancelFilter()
        setVisible(false)
    }, [cancelFilter])

    const content = components?.popup ?? (
        <FilterPopup hideFilter={hiddenFilter} onApply={handleApply} onCancel={handleClose}>
            <FilterField
                widgetFieldMeta={widgetField}
                rowFieldMeta={rowMeta}
                value={value}
                onChange={changeValue}
                widgetOptions={widget?.options}
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
            <div className={cn(styles.icon, { [styles.active]: (filter?.value?.toString()?.length as number) > 0 })}>
                <FilterIcon />
            </div>
        </Popover>
    )
}

export default memo(ColumnFilter)

function isMultivalueField(fieldType: FieldType) {
    const isPickList = fieldType === FieldType.pickList

    return [FieldType.multivalue, FieldType.multivalueHover].includes(fieldType) || isPickList
}

function getPopupAssocKeys(fieldMeta: MultivalueFieldMeta | PickListFieldMeta) {
    const isPickList = fieldMeta.type === FieldType.pickList

    let currentFieldMeta
    let assocValueKey: string = ''
    let associateFieldKey: string = ''

    if (isPickList) {
        currentFieldMeta = fieldMeta as PickListFieldMeta

        assocValueKey = currentFieldMeta.pickMap[fieldMeta.key]
        associateFieldKey = currentFieldMeta.key
    }

    if (!isPickList) {
        currentFieldMeta = fieldMeta as MultivalueFieldMeta

        assocValueKey = currentFieldMeta.assocValueKey ?? assocValueKey
        associateFieldKey = currentFieldMeta.associateFieldKey ?? associateFieldKey
    }

    return {
        assocValueKey,
        associateFieldKey
    }
}
