import moment from 'moment'
import React from 'react'
import { TimePicker } from 'antd'
import { TimePickerProps } from 'antd/lib/time-picker'
import ReadOnlyField from '../../components/ui/ReadOnlyField/ReadOnlyField'
import { WidgetFieldBase } from '@cxbox-ui/schema'
import { BaseFieldProps } from '@cxboxComponents/Field/Field'

export const enum TimeFormat {
    outputHourFormat = 'HH',
    outputMinuteFormat = 'mm',
    outputSecondFormat = 'ss',
    outputMinuteSecondsFormat = 'mm:ss',
    outputHourMinuteFormat = 'HH:mm',
    outputHourMinuteAFormat = 'HH:mm A',
    outputFullTimeFormat = 'HH:mm:ss',
    outputFullTimeAFormat = 'HH:mm:ss A'
}

const aDateFormats = [TimeFormat.outputHourMinuteAFormat, TimeFormat.outputFullTimeAFormat]

const isoLocalFormatter = (date: moment.Moment) => date.format('YYYY-MM-DD[T]HH:mm:ss')

interface ITimePickerFieldMeta extends WidgetFieldBase {
    format: TimeFormat
    hourStep?: number
    minuteStep?: number
    secondStep?: number
}

export interface ITimePickerProps extends BaseFieldProps {
    value?: string | null
    onChange?: (date: string | null) => void
    allowClear?: boolean
    onOpenChange?: (status: boolean) => void
    disabledDate?: (current: moment.Moment) => boolean
    resetForceFocus?: () => void
    filterValue?: string
    meta: ITimePickerFieldMeta
    popupContainer?: HTMLElement
}

const TimePickerField: React.FunctionComponent<ITimePickerProps> = ({
    disabled,
    value,
    widgetName,
    meta,
    className,
    backgroundColor,
    readOnly,
    onDrillDown,
    onChange,
    placeholder,
    ...props
}) => {
    const { secondStep = 1, hourStep = 1, minuteStep = 1, format = TimeFormat.outputFullTimeAFormat } = meta

    const handleChange = React.useCallback(
        (date: moment.Moment | null) => {
            if (onChange) {
                onChange(date ? isoLocalFormatter(date) : null)
            }
        },
        [onChange]
    )

    let momentObject

    if (value) {
        momentObject = moment.parseZone(value)
    }

    const getPopupContainer = React.useCallback((triggerNode: Element) => props.popupContainer as HTMLElement, [props.popupContainer])

    const extendedProps: TimePickerProps = {
        ...props,
        className: className,
        value: momentObject,
        disabled,
        format,
        onChange: handleChange,
        style: {
            backgroundColor
        },
        secondStep,
        hourStep,
        minuteStep,
        placeholder,
        use12Hours: aDateFormats.includes(format),
        getPopupContainer: props.popupContainer && getPopupContainer
    }

    if (disabled) {
        extendedProps.open = false
    }

    if (readOnly) {
        return (
            <ReadOnlyField
                widgetName={widgetName}
                meta={meta}
                className={className}
                backgroundColor={backgroundColor}
                onDrillDown={onDrillDown}
            >
                {momentObject?.format(format)}
            </ReadOnlyField>
        )
    }

    return <TimePicker {...extendedProps} />
}

export default React.memo(TimePickerField)
