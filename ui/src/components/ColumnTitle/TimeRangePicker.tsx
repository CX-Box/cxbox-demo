import React, { useEffect, useState } from 'react'
import { Button, Icon, TimePicker } from 'antd'
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

function TimeRangePicker({ value, onChange, ...rest }: TimeRangePickerProps) {
    const defaultDate = useAppSelector(state => state.session.featureSettings?.find(setting => setting.key === 'defaultDate'))
    const startTime = Array.isArray(value) && value?.[0] ? moment(value[0] as string) : moment(`${defaultDate?.value}T00:00:00`)
    const endTime = Array.isArray(value) && value?.[1] ? moment(value[1] as string) : moment(`${defaultDate?.value}T23:59:59`)
    const [endOpen, setEndOpen] = useState(false)
    const [startOpen, setStartOpen] = useState(false)

    const { t } = useTranslation()

    const handleChange = (pickerType: 'start' | 'end'): TimePickerProps['onChange'] => {
        return date => {
            if (pickerType === 'start') {
                onChange([isoLocalFormatter(date), isoLocalFormatter(endTime)])
                return
            }
            if (pickerType === 'end') {
                onChange([isoLocalFormatter(startTime), isoLocalFormatter(date)])
                return
            }
        }
    }

    const handleSetValue = (setter: 'toStart' | 'toEnd') => {
        if (setter === 'toStart') {
            onChange([isoLocalFormatter(startTime), isoLocalFormatter(startTime)])
            return
        }
        if (setter === 'toEnd') {
            onChange([isoLocalFormatter(endTime), isoLocalFormatter(endTime)])
            return
        }
    }

    return (
        <div className={styles.container}>
            <TimePicker
                {...rest}
                data-test-filter-popup-start-value={true}
                placeholder={t('Start date')}
                onChange={handleChange('start')}
                value={startTime}
                open={startOpen}
                onOpenChange={open => setStartOpen(open)}
                popupClassName={styles.popupContainer}
                addon={() => (
                    <Button size="small" type="primary" onClick={() => setStartOpen(false)}>
                        {t('Ok')}
                    </Button>
                )}
            />
            <div className={styles.arrowContainer}>
                {/*TODO: пофиксить стили в рамках 903 тикета*/}
                {/*<Icon style={{ color: '#c5c5c5' }} type="right-square" onClick={() => handleSetValue('toStart')} />*/}
                {/*<Icon style={{ color: '#c5c5c5' }} type="left-square" onClick={() => handleSetValue('toEnd')} />*/}
            </div>
            <TimePicker
                {...rest}
                data-test-filter-popup-end-value={true}
                placeholder={t('End time')}
                onChange={handleChange('end')}
                value={endTime}
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
