import { AppWidgetMeta } from '@interfaces/widget'
import { useCallback, useMemo } from 'react'
import { EventInput } from '@fullcalendar/core'
import {
    EVENT_ALL_REFINERS,
    EVENT_ALL_REFINERS_DICTIONARY,
    EventAllRefiners,
    EventAllRefinersKeys,
    mapRefinerKeyToFieldKey
} from '@components/widgets/CalendarList/interfaces'
import { isAllDayOrMultiDay } from '@components/widgets/CalendarList/utils'
import { WidgetFieldBase } from '@cxbox-ui/core'
import { hasOwn } from '@utils/object'

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
                            refiners.title = value ?? ''
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

            return {
                ...refiners,
                allDay: isAllDayOrMultiDay([refiners.start, refiners.end]),
                extendedProps: {
                    ...raw
                }
            }
        },
        [bgColorKey, refinerKeyToFieldKeyMapper, staticBgColor]
    )
}
