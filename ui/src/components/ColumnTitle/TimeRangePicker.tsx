import React, { useEffect, useState } from 'react'
import { Button, TimePicker } from 'antd'
import { DataValue } from '@cxbox-ui/schema'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { isoLocalFormatter } from '@utils/date'
import { TimePickerProps } from 'antd/lib/time-picker'
import { useAppSelector } from '@store'
import styles from './TimeRangePicker.less'

interface TimeRangePickerProps extends Omit<TimePickerProps, 'onChange' | 'value'> {
    onChange: (v: DataValue[]) => void
    value: DataValue[]
}

function TimeRangePicker({ value, onChange, format, ...rest }: TimeRangePickerProps) {
    const defaultDate = useAppSelector(state => state.session.featureSettings?.find(setting => setting.key === 'defaultDate'))
    const startTime = Array.isArray(value) && value?.[0] ? moment(value[0] as string) : undefined
    const endTime = Array.isArray(value) && value?.[1] ? moment(value[1] as string) : undefined
    const [endOpen, setEndOpen] = useState(false)
    const [startOpen, setStartOpen] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setStartOpen(true)
        }, 100)
    }, [])

    const { t } = useTranslation()

    const handleChange = (pickerType: 'start' | 'end'): TimePickerProps['onChange'] => {
        return time => {
            const newTime = moment(time)
            if (pickerType === 'start') {
                if (!format?.includes('s')) {
                    newTime.seconds(0)
                }
                if (!format?.includes('m')) {
                    newTime.minutes(0)
                }
                onChange([isoLocalFormatter(newTime), isoLocalFormatter(endTime)])
                return
            }
            if (pickerType === 'end') {
                if (!format?.includes('s')) {
                    newTime.seconds(59)
                }
                if (!format?.includes('m')) {
                    newTime.minutes(59)
                }
                onChange([isoLocalFormatter(startTime), isoLocalFormatter(newTime)])
                return
            }
        }
    }

    const handleSetValue = (setter: 'toStart' | 'toEnd') => {
        if (setter === 'toStart') {
            const newStartTime = moment(startTime)
            if (!format?.includes('s')) {
                newStartTime.seconds(59)
            }
            if (!format?.includes('m')) {
                newStartTime.minutes(59)
            }
            onChange([isoLocalFormatter(startTime), isoLocalFormatter(newStartTime)])
            return
        }
        if (setter === 'toEnd') {
            const newEndTime = moment(endTime)
            if (!format?.includes('s')) {
                newEndTime.seconds(0)
            }
            if (!format?.includes('m')) {
                newEndTime.minutes(0)
            }
            onChange([isoLocalFormatter(newEndTime), isoLocalFormatter(endTime)])
            return
        }
    }

    return (
        <div className={styles.container}>
            <TimePicker
                {...rest}
                data-test-filter-popup-start-value={true}
                format={format}
                placeholder={t('Start time')}
                onChange={handleChange('start')}
                value={startTime}
                defaultOpenValue={moment(`${defaultDate?.value}T00:00:00`)}
                open={startOpen}
                onOpenChange={open => setStartOpen(open)}
                popupClassName={styles.popupContainer}
                addon={() => (
                    <Button size="small" type="primary" onClick={() => setStartOpen(false)}>
                        {t('Ok')}
                    </Button>
                )}
            />
            <div className={styles.transferButtons}>
                <Button disabled={!startTime} onClick={() => handleSetValue('toStart')} icon="right" />
                <Button disabled={!endTime} onClick={() => handleSetValue('toEnd')} icon="left" />
            </div>
            <TimePicker
                {...rest}
                data-test-filter-popup-end-value={true}
                format={format}
                placeholder={t('End time')}
                onChange={handleChange('end')}
                value={endTime}
                defaultOpenValue={moment(`${defaultDate?.value}T23:59:59`)}
                open={endOpen}
                onOpenChange={open => setEndOpen(open)}
                popupClassName={styles.popupContainer}
                addon={() => (
                    <Button size="small" type="primary" onClick={() => setEndOpen(false)}>
                        {t('Ok')}
                    </Button>
                )}
            />
        </div>
    )
}

export default React.memo(TimeRangePicker)
