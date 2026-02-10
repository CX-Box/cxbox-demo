import React, { useCallback, useState } from 'react'
import { DatePicker } from 'antd'
import styles from '@components/widgets/CalendarList/components/toolbar/CalendarTitle.less'
import moment from 'moment'
import { getFormat } from '@components/ui/DatePickerField/DatePickerField'
import cn from 'classnames'

interface CalendarTitleProps {
    mode: 'year' | 'month'
    title: string
    onDateChange: (date: Date) => void
    currentDate: Date
    disableFilter?: boolean
}

const CalendarTitle: React.FC<CalendarTitleProps> = ({ mode = 'month', currentDate, title, onDateChange, disableFilter }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false)

    const openPicker = useCallback(() => {
        if (!disableFilter) {
            setIsPickerOpen(true)
        }
    }, [disableFilter])

    const handleDateChange = useCallback(
        (date: moment.Moment | null) => {
            if (date) {
                onDateChange(date.toDate())
                setIsPickerOpen(false)
            }
        },
        [onDateChange]
    )

    let datePickerElement = null

    if (!disableFilter) {
        if (mode === 'month') {
            datePickerElement = (
                <DatePicker.MonthPicker
                    className={styles.datePicker}
                    open={isPickerOpen}
                    onOpenChange={setIsPickerOpen}
                    value={moment(currentDate)}
                    onChange={handleDateChange}
                    format={getFormat(false, false, true)}
                    allowClear={false}
                />
            )
        } else {
            datePickerElement = (
                <DatePicker
                    dropdownClassName={styles.yearInput}
                    mode="year"
                    className={styles.datePicker}
                    open={isPickerOpen}
                    onOpenChange={setIsPickerOpen}
                    value={moment(currentDate)}
                    onPanelChange={handleDateChange}
                    format="YYYY"
                    allowClear={false}
                />
            )
        }
    }

    return (
        <h2 className={cn(styles.title, { [styles.disabled]: disableFilter })}>
            <span onClick={openPicker}>{title}</span>
            {datePickerElement}
        </h2>
    )
}

export default React.memo(CalendarTitle)
