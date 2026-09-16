import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { Lookup } from '@utils/Lookup'
import { TREE_WIDGETS, WIDGETS_COMPATIBLE_WITH_TREE } from '@constants/tree'

const CALENDAR_WIDGETS = [CustomWidgetTypes.CalendarList, CustomWidgetTypes.CalendarYearList]

export const isCalendarWidget = <T extends AppWidgetMeta>(widget: T | undefined): widget is T => {
    if (!widget) {
        return false
    }

    return Lookup.has(CALENDAR_WIDGETS, widget.type)
}

export const isTreeWidgetType = (widgetType: string | undefined): boolean => {
    if (!widgetType) {
        return false
    }

    return Lookup.has(TREE_WIDGETS, widgetType)
}

export const isTreeCompatibleWidgetType = (widgetType: string | undefined): boolean => {
    if (!widgetType) {
        return false
    }

    return Lookup.has(WIDGETS_COMPATIBLE_WITH_TREE, widgetType)
}

export const isTreeWidget = <T extends AppWidgetMeta>(widget: T | undefined): widget is T => {
    return isTreeWidgetType(widget?.type)
}

export const isTreeCompatibleWidget = <T extends AppWidgetMeta>(widget: T | undefined): widget is T => {
    return isTreeCompatibleWidgetType(widget?.type)
}
