import React, { RefAttributes } from 'react'
import moment, { Moment } from 'moment'
import { DatePicker } from 'antd'
import styles from './DatePickerField.module.less'
import cn from 'classnames'
import { BaseFieldProps } from '@components/Field/Field'
import ReadOnlyField from '@components/ui/ReadOnlyField/ReadOnlyField'
import { DatePickerProps } from 'antd/lib/date-picker/interface'

export interface IDatePickerFieldProps extends BaseFieldProps {
    value?: string | null
    onChange?: (date?: string | null) => void
    showToday?: boolean
    allowClear?: boolean
    onOpenChange?: (status: boolean) => void
    disabledDate?: (current: moment.Moment | null) => boolean
    showTime?: boolean
    monthYear?: boolean
    showSeconds?: boolean
    resetForceFocus?: () => void
    dateFormatter?: (date: moment.Moment) => string
    calendarContainer?: HTMLElement
    filterValue?: string
}

const dateFormat = moment.ISO_8601
const outputMonthYearFormat = 'MMMM YYYY'
const outputDateFormat = 'DD.MM.YYYY'
const outputDateTimeFormat = 'DD.MM.YYYY HH:mm'
const outputDateTimeWithSecondsFormat = 'DD.MM.YYYY HH:mm:ss'
const isoLocalFormatter = (date: Moment) => date.format('YYYY-MM-DD[T]HH:mm:ss')

/**
 *
 * @param props
 * @category Components
 */
const DatePickerField: React.FunctionComponent<IDatePickerFieldProps> = ({
    disabled,
    value = null,
    showTime,
    showSeconds,
    monthYear,
    widgetName,
    meta,
    className,
    backgroundColor,
    readOnly,
    onDrillDown,
    onChange,
    ...props
}) => {
    const dateFormatter = props.dateFormatter ? props.dateFormatter : isoLocalFormatter
    const datePickerRef = React.useRef(null)
    const handleChange = React.useCallback(
        (date: moment.Moment | null) => {
            if (onChange) {
                if (monthYear) {
                    onChange(date ? dateFormatter(date.startOf('month')) : null)
                } else {
                    onChange(date ? dateFormatter(date) : null)
                }
            }
        },
        [onChange, monthYear, dateFormatter]
    )
    const getCalendarContainer = React.useCallback(
        (triggerNode: Element) => props.calendarContainer as HTMLElement,
        [props.calendarContainer]
    )

    let momentObject
    if (value) {
        momentObject = monthYear ? moment(value, dateFormat, true).startOf('month') : moment(value, dateFormat, true)
    }

    const format = getFormat(showTime, showSeconds, monthYear)
    const timeOptions = showTime ? { format: showSeconds ? 'HH:mm:ss' : 'HH:mm' } : false

    const extendedProps: DatePickerProps & RefAttributes<any> = {
        ...props,
        className: cn(styles.datePicker, className),
        value: momentObject,
        disabled: disabled,
        format,
        onChange: handleChange,
        showTime: timeOptions,
        style: {
            backgroundColor
        },
        getCalendarContainer: props.calendarContainer ? getCalendarContainer : undefined,
        ref: datePickerRef
    }

    if (disabled) {
        extendedProps.open = false
    }

    if (readOnly) {
        const datePickerFormat = DatePickerFieldFormat(value, showTime, showSeconds, monthYear)
        return (
            <ReadOnlyField
                widgetName={widgetName}
                meta={meta}
                className={className}
                backgroundColor={backgroundColor}
                cursor={props.cursor}
                onDrillDown={onDrillDown}
            >
                {datePickerFormat}
            </ReadOnlyField>
        )
    }

    return monthYear ? <DatePicker.MonthPicker {...extendedProps} /> : <DatePicker {...extendedProps} />
}

export const getFormat = (showTime?: boolean, showSeconds?: boolean, monthYear?: boolean) => {
    if (showSeconds) {
        return outputDateTimeWithSecondsFormat
    } else if (showTime) {
        return outputDateTimeFormat
    } else if (monthYear) {
        return outputMonthYearFormat
    } else {
        return outputDateFormat
    }
}

export const DatePickerFieldFormat = (date: string | null, withTime?: boolean, withSeconds?: boolean, monthYear?: boolean): string => {
    if (monthYear) {
        moment.locale('ru')
    }
    if (!date) {
        return ''
    }
    return moment(date, dateFormat).format(getFormat(withTime, withSeconds, monthYear))
}

export default React.memo(DatePickerField)
