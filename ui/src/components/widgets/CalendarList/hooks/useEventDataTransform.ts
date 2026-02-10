import { AppWidgetMeta, WidgetField } from '@interfaces/widget'
import { useCallback, useMemo } from 'react'
import { EventInput } from '@fullcalendar/core'
import {
    EVENT_ALL_REFINERS,
    EVENT_ALL_REFINERS_DICTIONARY,
    EventAllRefiners,
    EventAllRefinersKeys,
    mapRefinerKeyToFieldKey
} from '@components/widgets/CalendarList/constants'
import { getEventTimeGranularity, isAllDayOrMultiDay } from '@components/widgets/CalendarList/utils'
import { WidgetFieldBase } from '@cxbox-ui/core'
import { hasOwn } from '@utils/object'
import moment from 'moment'
import { isoLocalFormatter } from '@utils/date'

/**
 * Normalizes the end date for all-day events.
 *
 * FullCalendar treats the end date as exclusive (e.g., [start, end)) according to iCalendar Specifications (RFC 5545).
 * To include the last day in the visualization, we need to change an end date.
 *
 * @param endDate
 */
const normalizeAllDayEndDate = (endDate: moment.MomentInput) => {
    return isoLocalFormatter(moment(endDate).endOf('day').add(1, 'ms'))
}

export const useEventDataTransform = (widget: AppWidgetMeta) => {
    const calendarWidgetOptions = widget.options?.calendar
    const refinerKeyToFieldKeyMapper = useMemo(() => mapRefinerKeyToFieldKey(calendarWidgetOptions), [calendarWidgetOptions])

    const { staticBgColor, bgColorKey } = useMemo(() => {
        const fields = (widget.fields as WidgetFieldBase[]) ?? []
        const valueField = fields.find(field => field.key === refinerKeyToFieldKeyMapper.title)

        return {
            staticBgColor: valueField?.bgColor,
            bgColorKey: valueField?.bgColorKey
        }
    }, [refinerKeyToFieldKeyMapper.title, widget.fields])

    return useCallback(
        (raw: any): EventInput => {
            const refiners: EventAllRefiners = {}

            if (typeof raw === 'object' && raw !== null) {
                for (const key of EVENT_ALL_REFINERS) {
                    if (hasOwn(raw, key)) {
                        refiners[key] = raw[key]
                    }
                }

                Object.entries(refinerKeyToFieldKeyMapper).forEach(([refinerKey, fieldKey]) => {
                    if (hasOwn(raw, fieldKey)) {
                        const key = refinerKey as EventAllRefinersKeys
                        const value = raw[fieldKey]

                        // Title must be a string. Nullish values can cause rendering issues.
                        if (key === 'title') {
                            // Use non-breaking space to prevent event from collapsing if title is empty
                            refiners.title = value ?? '\u00A0'
                        } else {
                            refiners[key] = value
                        }
                    }
                })
            }

            if (!hasOwn(refiners, EVENT_ALL_REFINERS_DICTIONARY.color)) {
                const dynamicBgColor = bgColorKey ? (raw?.[bgColorKey] as string | undefined) : undefined
                const bcColor = dynamicBgColor || staticBgColor

                if (bcColor) {
                    refiners.color = bcColor
                }
            }

            const granularity = getEventTimeGranularity(
                (widget.fields as WidgetField[])
                    .filter(field => [refinerKeyToFieldKeyMapper.start, refinerKeyToFieldKeyMapper.end].includes(field.key))
                    .map(item => item.type)
            )

            const isAllDay = isAllDayOrMultiDay([refiners.start, refiners.end], granularity)

            if (isAllDay) {
                refiners.end = normalizeAllDayEndDate(refiners.end)
            }

            return {
                ...refiners,
                allDay: isAllDay,
                extendedProps: {
                    ...raw
                }
            }
        },
        [bgColorKey, refinerKeyToFieldKeyMapper, staticBgColor, widget.fields]
    )
}
