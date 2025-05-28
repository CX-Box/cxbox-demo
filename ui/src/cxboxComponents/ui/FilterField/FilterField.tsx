/**
 * Decides what control will be used for specific field type
 */

import React from 'react'
import { Icon, Input } from 'antd'
import { CheckboxFilter } from '@cxboxComponents/ui/CheckboxFilter/CheckboxFilter'
import { interfaces } from '@cxbox-ui/core'
import { CustomFieldTypes } from '@interfaces/widget'
import TimePickerField, { ITimePickerFieldMeta } from '../../../fields/TimePicker/TimePickerField'
import styles from './FilterField.less'

export interface ColumnFilterControlProps {
    widgetFieldMeta: interfaces.WidgetListField
    rowFieldMeta: interfaces.RowMetaField
    value: interfaces.DataValue | interfaces.DataValue[]
    onChange: (value: interfaces.DataValue | interfaces.DataValue[]) => void
    visible?: boolean
    widgetOptions?: interfaces.WidgetMeta['options']
}

const { FieldType } = interfaces

/**
 *
 * @param props
 * @category Components
 */
export const ColumnFilterControl: React.FC<ColumnFilterControlProps> = props => {
    switch (props.widgetFieldMeta.type as string) {
        case FieldType.dictionary: {
            const rowFieldMeta = props.rowFieldMeta
            const rowFieldMetaFilterValues = rowFieldMeta?.filterValues?.map(item => ({
                ...item,
                icon: rowFieldMeta?.allValues?.find(allValuesItem => allValuesItem.value === item.value)?.icon
            }))
            return (
                <CheckboxFilter
                    title={props.widgetFieldMeta.title}
                    value={props.value as interfaces.DataValue[]}
                    filterValues={rowFieldMetaFilterValues}
                    visible={props.visible}
                    onChange={props.onChange}
                />
            )
        }
        case CustomFieldTypes.Time: {
            const { widgetFieldMeta, value, onChange } = props
            return (
                <TimePickerField
                    meta={widgetFieldMeta as ITimePickerFieldMeta}
                    value={value as string}
                    onChange={onChange}
                    readOnly={false}
                    className={styles.timeFilter}
                    popupClassName={styles.timeFilterPopup}
                    enabledAddon={true}
                />
            )
        }
        case FieldType.input:
        case FieldType.text:
        case FieldType.number:
        default: {
            return (
                <Input
                    data-test-filter-popup-value={true}
                    autoFocus
                    value={props.value as string}
                    suffix={<Icon type="search" />}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const textValue = e.target.value.substr(0, 100)
                        props.onChange(textValue || null)
                    }}
                />
            )
        }
    }
}

/**
 * @category Components
 */
const MemoizedColumnFilterControl = React.memo(ColumnFilterControl)

export default MemoizedColumnFilterControl
