import React from 'react'
import { Checkbox, Icon, Input } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import NumberInput from '@components/ui/NumberInput/NumberInput'
import CheckboxFilter from './CheckboxFilter/CheckboxFilter'
import RangePicker from './RangePicker'
import DatePicker from './DatePicker'
import NumberRangeFilter from './components/NumberRangeFilter/NumberRangeFilter'
import { getFormat } from '@utils/date'
import { NumberTypes } from '@components/ui/NumberInput/formaters'
import { DataValue, FieldType, RowMetaField, WidgetListField, WidgetMeta } from '@cxbox-ui/core'
import { DateFieldTypes } from '@interfaces/date'
import { AppNumberFieldMeta, CustomFieldTypes } from '@interfaces/widget'
import TimeRangePicker from '@components/ColumnTitle/TimeRangePicker'
import { ITimePickerFieldMeta } from '../../fields/TimePicker/TimePickerField'

interface FilterFieldProps {
    widgetFieldMeta: WidgetListField
    rowFieldMeta: RowMetaField
    value: DataValue | DataValue[]
    onChange: (value: DataValue | DataValue[]) => void
    visible?: boolean
    widgetOptions?: WidgetMeta['options']
    filterByRangeEnabled?: boolean
}

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
                        value={value as DataValue[]}
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
                    value={value as DataValue[]}
                    visible={visible}
                    filterValues={rowFieldMeta.filterValues ? rowFieldMeta.filterValues : []}
                    onChange={onChange}
                />
            )
        }
        case FieldType.dictionary: {
            const rowFieldMeta = props.rowFieldMeta
            const rowFieldMetaFilterValues =
                rowFieldMeta?.filterValues?.map(item => ({
                    ...item,
                    icon: rowFieldMeta?.allValues?.find(allValuesItem => allValuesItem.value === item.value)?.icon
                })) || []
            return (
                <CheckboxFilter
                    title={props.widgetFieldMeta.title}
                    value={props.value as DataValue[]}
                    filterValues={rowFieldMetaFilterValues}
                    visible={props.visible}
                    onChange={props.onChange}
                />
            )
        }
        case FieldType.dateTimeWithSeconds:
        case FieldType.dateTime:
        case FieldType.date: {
            if (filterByRangeEnabled) {
                return (
                    <RangePicker
                        value={props.value as DataValue[]}
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
                    value={value as DataValue[]}
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
                    value={value as DataValue[]}
                    onChange={onChange}
                    use12Hours={use12Hours}
                    format={widgetFieldMeta.format}
                    hourStep={widgetFieldMeta.hourStep}
                    minuteStep={widgetFieldMeta.minuteStep}
                    secondStep={widgetFieldMeta.secondStep}
                />
            )
        }
        case FieldType.pickList:
        case FieldType.input:
        case FieldType.text:
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
