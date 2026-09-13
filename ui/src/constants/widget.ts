import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { Lookup } from '@utils/Lookup'

const CALENDAR_WIDGETS = [CustomWidgetTypes.CalendarList, CustomWidgetTypes.CalendarYearList]

export const isCalendarWidget = <T extends AppWidgetMeta>(widget: T | undefined): widget is T => {
    if (!widget) {
        return false
    }

    return Lookup.has(CALENDAR_WIDGETS, widget.type)
}

const TREE_WIDGETS = [CustomWidgetTypes.Tree, CustomWidgetTypes.AssocTreePopup, CustomWidgetTypes.PickTreePopup]

export const isTreeWidget = <T extends AppWidgetMeta>(widget: T | undefined): widget is T => {
    if (!widget) {
        return false
    }

    return Lookup.has(TREE_WIDGETS, widget.type)
}
