import moment from 'moment'
import React, { useEffect } from 'react'
import { TimePicker } from 'antd'
import { TimePickerProps } from 'antd/lib/time-picker'
import ReadOnlyField from '../../components/ui/ReadOnlyField/ReadOnlyField'
import { WidgetFieldBase } from '@cxbox-ui/schema'
import { BaseFieldProps } from '@cxboxComponents/Field/Field'
import { useVisibility } from '@components/widgets/Table/hooks/useVisibility'
import Button from '@components/ui/Button/Button'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@store'

export const isoLocalFormatter = (date: moment.Moment) => date.format('YYYY-MM-DD[T]HH:mm:ss')

const unsupportedFormats = ['mm:ss', 'mm', 'ss']

export interface ITimePickerFieldMeta extends WidgetFieldBase {
    format?: string
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
    popupClassName?: string
    enabledAddon?: boolean
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
    popupClassName,
    enabledAddon,
    ...props
}) => {
    const { t } = useTranslation()

    const { visibility, changeVisibility } = useVisibility()

    const handleClose = () => changeVisibility(false)

    const { secondStep = 1, hourStep = 1, minuteStep = 1, format = 'HH:mm:ss' } = meta

    const defaultDate = useAppSelector(state => state.session.featureSettings?.find(setting => setting.key === 'defaultDate'))

    useEffect(() => {
        if (unsupportedFormats.includes(format)) {
            console.warn(`Unsupported format "${format}" for ${widgetName}.${meta.key}`)
        }
        if ((format.includes('A') || format.includes('a')) && (!format.includes('hh') || !format.includes('h'))) {
            console.warn(`Wrong format "${format}" for ${widgetName}.${meta.key}
            Conflict between 12 and 24 hour format`)
        }
    }, [format, meta.key, widgetName])

    const handleChange = React.useCallback(
        (date: moment.Moment | null) => {
            if (onChange) {
                if (!value && defaultDate && date) {
                    const emptyDate = moment(`${defaultDate.value}T00:00:00`)
                    emptyDate.hours(date.hours())
                    emptyDate.minutes(date.minutes())
                    emptyDate.seconds(date.seconds())
                    onChange(isoLocalFormatter(emptyDate))
                    return
                }
                onChange(date ? isoLocalFormatter(date) : null)
            }
        },
        [defaultDate, onChange, value]
    )

    let momentObject

    if (value) {
        momentObject = moment.parseZone(value)
    }

    const getPopupContainer = React.useCallback((triggerNode: Element) => props.popupContainer as HTMLElement, [props.popupContainer])

    const extendedProps: TimePickerProps = {
        ...props,
        className: className,
        popupClassName: popupClassName,
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
        use12Hours: format.includes('A') || format.includes('a'),
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
                cursor={props.cursor}
                onDrillDown={onDrillDown}
            >
                {momentObject?.format(format)}
            </ReadOnlyField>
        )
    }

    const addon = enabledAddon
        ? () => (
              <Button size="small" type="primary" onClick={handleClose}>
                  {t('Ok')}
              </Button>
          )
        : undefined

    return <TimePicker {...extendedProps} open={visibility} onOpenChange={changeVisibility} addon={addon} />
}

export default React.memo(TimePickerField)
