import React from 'react'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { NumberInput, FilterField as CoreFilterField } from '@cxboxComponents'
import { CheckboxFilter } from './CheckboxFilter/CheckboxFilter'
import RangePicker from './RangePicker'
import DatePicker from './DatePicker'
import NumberRangeFilter from './components/NumberRangeFilter/NumberRangeFilter'
import { getFormat } from '@utils/date'
import { ColumnFilterControlProps } from '@cxboxComponents/ui/FilterField/FilterField'
import { NumberTypes } from '@cxboxComponents/ui/NumberInput/formaters'
import { interfaces } from '@cxbox-ui/core'
import { DateFieldTypes } from '@interfaces/date'
import { AppNumberFieldMeta, CustomFieldTypes } from '@interfaces/widget'
import TimeRangePicker from '@components/ColumnTitle/TimeRangePicker'
import { ITimePickerFieldMeta } from '../../fields/TimePicker/TimePickerField'

interface FilterFieldProps extends ColumnFilterControlProps {
    filterByRangeEnabled?: boolean
}

const { FieldType } = interfaces

function FilterField({ filterByRangeEnabled, ...props }: FilterFieldProps) {
    const { widgetFieldMeta, value, onChange, rowFieldMeta, visible } = props
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
                >
                    {rowFieldMeta?.placeholder}
                </Checkbox>
            )
        }
        case FieldType.number:
        case FieldType.money:
        case FieldType.percent:
            const fieldMeta = widgetFieldMeta as AppNumberFieldMeta

            if (filterByRangeEnabled) {
                return (
                    <NumberRangeFilter
                        value={value as interfaces.DataValue[]}
                        type={widgetFieldMeta.type as unknown as NumberTypes}
                        onChange={onChange}
                        digits={fieldMeta.digits}
                        currency={fieldMeta.currency}
                        nullable={true}
                    />
                )
            }

            return (
                <NumberInput
                    data-test-filter-popup-value={true}
                    value={value as number}
                    type={widgetFieldMeta.type as any}
                    onChange={onChange}
                    digits={fieldMeta.digits}
                    nullable={fieldMeta.nullable}
                    currency={fieldMeta.currency}
                    forceFocus={true}
                />
            )
        case CustomFieldTypes.MultipleSelect:
        case FieldType.radio: {
            return (
                <CheckboxFilter
                    title={widgetFieldMeta.title}
                    value={value as interfaces.DataValue[]}
                    visible={visible}
                    filterValues={rowFieldMeta.filterValues ? rowFieldMeta.filterValues : []}
                    onChange={onChange}
                />
            )
        }
        case FieldType.pickList: {
            return <CoreFilterField {...props} widgetFieldMeta={{ ...props.widgetFieldMeta, type: FieldType.input }} />
        }
        case FieldType.dateTimeWithSeconds:
        case FieldType.dateTime:
        case FieldType.date: {
            if (filterByRangeEnabled) {
                return (
                    <RangePicker
                        value={props.value as interfaces.DataValue[]}
                        onChange={onChange}
                        format={getFormat(fieldType === FieldType.dateTime, fieldType === FieldType.dateTimeWithSeconds)}
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
                    value={value as interfaces.DataValue[]}
                    format={getFormat()}
                    open={visible}
                />
            )
        }
        case CustomFieldTypes.Time: {
            const widgetFieldMeta = props.widgetFieldMeta as ITimePickerFieldMeta
            const use12Hours = widgetFieldMeta.format?.includes('A') || widgetFieldMeta.format?.includes('a')
            return (
                <TimeRangePicker
                    value={value as interfaces.DataValue[]}
                    onChange={onChange}
                    use12Hours={use12Hours}
                    format={widgetFieldMeta.format}
                    hourStep={widgetFieldMeta.hourStep}
                    minuteStep={widgetFieldMeta.minuteStep}
                    secondStep={widgetFieldMeta.secondStep}
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
