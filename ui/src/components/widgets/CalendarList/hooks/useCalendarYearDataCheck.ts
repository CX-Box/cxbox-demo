import { useAppSelector } from '@store'
import { selectBcData, selectWidget } from '@selectors/selectors'
import { isCalendarYearEventRangeValid, toYMD } from '@utils/date'
import { AppWidgetMeta } from '@interfaces/widget'
import { mapRefinerKeyToFieldKey } from '@components/widgets/CalendarList/interfaces'
import { useMemo } from 'react'
import { MomentInput } from 'moment'

export const useCalendarYearDataCheck = (widgetName: string) => {
    const widget = useAppSelector(selectWidget(widgetName)) as AppWidgetMeta | undefined
    const data = useAppSelector(selectBcData(widget?.bcName))
    const calendarWidgetOptions = widget?.options?.calendar

    const refinerKeyToFieldKeyMapper = useMemo(() => mapRefinerKeyToFieldKey(calendarWidgetOptions), [calendarWidgetOptions])

    const error = useMemo(() => {
        if (!data || data.length === 0) {
            return false
        }

        const { start: startKey, end: endKey } = refinerKeyToFieldKeyMapper

        const eventsInDay = new Map<string, number>()

        return data.some(item => {
            const start = item?.[startKey] as MomentInput
            const end = item?.[endKey] as MomentInput

            const isEventInvalid = !isCalendarYearEventRangeValid(start, end).ok
            const dayKey = toYMD(start)

            if (dayKey) {
                const eventsCount = eventsInDay.get(dayKey) || 0
                const newEventsCount = eventsCount + 1
                eventsInDay.set(dayKey, newEventsCount)

                return isEventInvalid || newEventsCount > 1
            }

            return isEventInvalid
        })
    }, [data, refinerKeyToFieldKeyMapper])

    return { isIncorrectData: error }
}
