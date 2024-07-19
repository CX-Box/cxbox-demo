import React, { useEffect, useState } from 'react'
import { DatePicker } from 'antd'
import { DatePickerProps, SinglePickerProps } from 'antd/lib/date-picker/interface'
import { DataValue } from '@cxbox-ui/schema'
import moment, { Moment } from 'moment'
import styles from './RangePicker.less'
import { useTranslation } from 'react-i18next'
import { isoLocalFormatter } from '@utils/date'

interface RangePickerProps extends Omit<DatePickerProps, 'onChange' | 'value'> {
    onChange: (v: DataValue[]) => void
    value: DataValue[]
}

function RangePicker({ value, onChange, open, ...rest }: RangePickerProps) {
    const startDate = Array.isArray(value) && value?.[0] ? moment(value[0] as string, moment.ISO_8601) : null
    const endDate = Array.isArray(value) && value?.[1] ? moment(value[1] as string, moment.ISO_8601) : null
    const [endOpen, setEndOpen] = useState(false)
    const [startOpen, setStartOpen] = useState(false)

    useEffect(() => {
        if (open && !startDate) {
            setTimeout(() => {
                setStartOpen(true)
            }, 100)
        }
    }, [open, startDate])

    const disabledStartDate = (startValue: Moment | null) => {
        if (!startValue || !endDate) {
            return false
        }
        return startValue.valueOf() > endDate.valueOf()
    }

    const disabledEndDate = (endValue: Moment | null) => {
        if (!endValue || !startDate) {
            return false
        }
        return endValue.valueOf() <= startDate.valueOf()
    }

    const handleStartOpenChange = (openValue: boolean) => {
        setStartOpen(openValue)
        if (!openValue && !endDate && open) {
            setEndOpen(true)
        }
    }

    const handleEndOpenChange = (open: boolean) => {
        setEndOpen(open)
    }

    const { t } = useTranslation()

    const handleChange = (pickerType: 'start' | 'end'): SinglePickerProps['onChange'] => {
        return date => {
            const newStartDate = pickerType === 'start' ? (!startDate ? date?.startOf('day') : date) : startDate
            const newEndDate = pickerType === 'end' ? (!endDate ? date?.endOf('day') : date) : endDate

            onChange([isoLocalFormatter(newStartDate), isoLocalFormatter(newEndDate)])
        }
    }

    return (
        <div className={styles.container}>
            <DatePicker
                {...rest}
                data-test-filter-popup-start-value={true}
                placeholder={t('Start date')}
                disabledDate={disabledStartDate}
                onChange={handleChange('start')}
                value={startDate}
                onOpenChange={handleStartOpenChange}
                open={startOpen}
            />
            <DatePicker
                {...rest}
                data-test-filter-popup-end-value={true}
                placeholder={t('End date')}
                disabledDate={disabledEndDate}
                onChange={handleChange('end')}
                value={endDate}
                open={endOpen}
                onOpenChange={handleEndOpenChange}
            />
        </div>
    )
}

export default React.memo(RangePicker)
