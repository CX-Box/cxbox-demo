import { useAppSelector } from '@store'
import { selectBcData, selectWidget } from '@selectors/selectors'
import { isRangeValid } from '@utils/date'
import { AppWidgetMeta } from '@interfaces/widget'
import { mapRefinerKeyToFieldKey } from '@components/widgets/CalendarList/interfaces'
import { useMemo } from 'react'
import type { MomentInput } from 'moment'

export const useCalendarDataCheck = (widgetName: string) => {
    const widget = useAppSelector(selectWidget(widgetName)) as AppWidgetMeta | undefined
    const data = useAppSelector(selectBcData(widget?.bcName))
    const calendarWidgetOptions = widget?.options?.calendar

    const refinerKeyToFieldKeyMapper = useMemo(() => mapRefinerKeyToFieldKey(calendarWidgetOptions), [calendarWidgetOptions])

    const error = useMemo(() => {
        if (!data || data.length === 0) {
            return false
        }

        const { start: startKey, end: endKey } = refinerKeyToFieldKeyMapper

        return data.some(item => {
            const start = item?.[startKey] as MomentInput
            const end = item?.[endKey] as MomentInput

            return !isRangeValid(start, end).ok
        })
    }, [data, refinerKeyToFieldKeyMapper])

    return { isIncorrectData: error }
}
