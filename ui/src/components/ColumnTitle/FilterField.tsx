import React from 'react'
import { FilterField as CoreFilterField, NumberInput } from '@cxbox-ui/core'
import { ColumnFilterControlProps } from '@cxbox-ui/core/components/ui/FilterField/FilterField'
import { FieldType } from '@cxbox-ui/core/interfaces/view'
import { DataValue } from '@cxbox-ui/core/interfaces/data'
import { CheckboxFilter } from './CheckboxFilter/CheckboxFilter'
import { CustomFieldTypes } from '../../interfaces/widget'
import { NumberFieldMeta } from '@cxbox-ui/schema/dist/interfaces/widget'
import { getFormat } from '../../utils/date'
import RangePicker from './RangePicker'
import DatePicker from './DatePicker'
import { DateFieldTypes } from '../../interfaces/date'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { Checkbox } from 'antd'

interface FilterFieldProps extends ColumnFilterControlProps {
    visible?: boolean
}

function FilterField({ visible, ...props }: FilterFieldProps) {
    const { widgetFieldMeta, value, onChange, rowFieldMeta } = props
    const fieldType = widgetFieldMeta.type as string

    switch (fieldType) {
        case FieldType.checkbox: {
            return (
                <Checkbox
                    data-test-filter-popup-select-value={true}
                    checked={value as boolean}
                    onChange={(e: CheckboxChangeEvent) => {
                        onChange(e.target.checked)
                    }}
                />
            )
        }
        case FieldType.number:
        case FieldType.money:
        case FieldType.percent:
            const fieldMeta = widgetFieldMeta as NumberFieldMeta
            return (
                <NumberInput
                    data-test-filter-popup-value={true}
                    value={value as number}
                    type={widgetFieldMeta.type as any}
                    onChange={onChange}
                    digits={fieldMeta.digits}
                    nullable={fieldMeta.nullable}
                    forceFocus={true}
                />
            )
        case CustomFieldTypes.MultipleSelect:
        case FieldType.radio: {
            return (
                <CheckboxFilter
                    title={widgetFieldMeta.title}
                    value={value as DataValue[]}
                    filterValues={rowFieldMeta.filterValues ? rowFieldMeta.filterValues : []}
                    onChange={onChange}
                />
            )
        }
        case FieldType.dateTimeWithSeconds:
        case FieldType.dateTime:
        case FieldType.date: {
            if (props.widgetOptions?.filterDateByRange) {
                return (
                    <RangePicker
                        value={props.value as DataValue[]}
                        onChange={onChange}
                        format={getFormat(fieldType === FieldType.dateTime, fieldType === FieldType.dateTimeWithSeconds)}
                        startOf={getStartOf(fieldType)}
                        open={visible}
                        showTime={getShowTime(fieldType)}
                    />
                )
            }
            return (
                <DatePicker
                    data-test-filter-popup-value={true}
                    autoFocus
                    onChange={onChange}
                    value={value as DataValue[]}
                    format={getFormat()}
                    open={visible}
                />
            )
        }

        default: {
            return <CoreFilterField {...props} />
        }
    }
}

export default React.memo(FilterField)

function getShowTime(type: DateFieldTypes | string) {
    switch (type) {
        case FieldType.dateTimeWithSeconds:
            return { format: 'HH:mm:ss' }
        case FieldType.dateTime:
            return { format: 'HH:mm' }
        default:
            return undefined
    }
}

function getStartOf(type: DateFieldTypes | string) {
    switch (type) {
        case FieldType.dateTimeWithSeconds:
            return 's'
        case FieldType.dateTime:
            return 'm'
        default:
            return 'd'
    }
}
