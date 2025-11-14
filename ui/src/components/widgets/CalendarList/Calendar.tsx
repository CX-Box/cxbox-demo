import React, { useCallback, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import { getFirsDay } from '@components/widgets/CalendarList/utils'
import { useTranslation } from 'react-i18next'
import styles from './Calendar.less'
import { useCalendarCellAspectRatio } from '@components/widgets/CalendarList/hooks'
import { CALENDAR_GRID } from '@components/widgets/CalendarList/interfaces'
import { DatesSetArg } from '@fullcalendar/core'

export interface FullCalendarProps extends React.ComponentProps<typeof FullCalendar> {}

interface CalendarProps extends Omit<FullCalendarProps, 'headerToolbar'> {
    initialView: string
    autoHeight?: boolean
}

const EVENT_MAIN_BG_COLOR = 'rgb(193, 233, 254)'
const EVENT_MAIN_TEXT_COLOR = '#141F35'

const Calendar = React.forwardRef<FullCalendar, CalendarProps>(({ initialView, datesSet, autoHeight, ...restProps }, ref) => {
    const restCalendarProps = { ...restProps }
    const { i18n } = useTranslation()
    const wrapperRef = useRef<HTMLDivElement>(null)

    const needToSetAspectRatio = useCallback((view: string) => view === CALENDAR_GRID.dayGridMonth, [])

    const [aspectRatioEnabled, setAspectRatioEnabled] = useState<boolean>(needToSetAspectRatio(initialView))

    useCalendarCellAspectRatio(wrapperRef, !aspectRatioEnabled)

    const calendarRef = useRef<FullCalendar | null>(null)

    const setRefs = useCallback(
        (instance: FullCalendar) => {
            calendarRef.current = instance

            if (typeof ref === 'function') {
                ref(instance)
            } else if (ref) {
                ref.current = instance
            }
        },
        [ref]
    )

    const handleDateSet = useCallback(
        (arg: DatesSetArg) => {
            setAspectRatioEnabled(needToSetAspectRatio(arg.view.type))
            datesSet?.(arg)
        },
        [datesSet, needToSetAspectRatio]
    )

    if (autoHeight) {
        restCalendarProps.height = aspectRatioEnabled ? 'auto' : restCalendarProps.height ?? 'auto'
        restCalendarProps.contentHeight = aspectRatioEnabled ? 'auto' : restCalendarProps.contentHeight ?? 'auto'
    }

    return (
        <div ref={wrapperRef} className={styles.calendar}>
            <FullCalendar
                ref={setRefs}
                headerToolbar={false}
                eventBackgroundColor={EVENT_MAIN_BG_COLOR}
                eventBorderColor={EVENT_MAIN_BG_COLOR}
                eventTextColor={EVENT_MAIN_TEXT_COLOR}
                locale={i18n.language}
                firstDay={getFirsDay()} // To avoid desynchronization of filtering with the display
                initialView={initialView}
                datesSet={handleDateSet}
                {...restCalendarProps}
            />
        </div>
    )
})

export default React.memo(Calendar)
