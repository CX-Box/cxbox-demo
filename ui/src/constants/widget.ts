import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'

const CALENDAR_WIDGETS = [CustomWidgetTypes.CalendarList, CustomWidgetTypes.CalendarYearList]

export const isCalendarWidget = <T extends AppWidgetMeta>(widget: T | undefined): widget is T => {
    if (!widget) {
        return false
    }

    return (CALENDAR_WIDGETS as readonly string[]).includes(widget.type)
}
