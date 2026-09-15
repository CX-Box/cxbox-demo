import { AppWidgetMeta, CustomWidgetTypes, InternalWidgetStyle } from '@interfaces/widget'

// "inlineForm" in a calendar has no table row to expand, so it is shown as a popup, the same as "popup"
export const POPUP_CREATE_STYLES: Array<InternalWidgetStyle | undefined> = [undefined, 'inlineForm', 'popup']

const CALENDAR_WIDGET_TYPES: string[] = [CustomWidgetTypes.CalendarList, CustomWidgetTypes.CalendarYearList]

/**
 * Whether the widget is a calendar which creates records in a popup (options.create.style "inlineForm" (default) or "popup")
 */
export const isCalendarCreatePopupStyle = (widget: AppWidgetMeta) => {
    return (
        CALENDAR_WIDGET_TYPES.includes(widget.type) &&
        !!widget.options?.create?.widget &&
        POPUP_CREATE_STYLES.includes(widget.options.create.style)
    )
}

/**
 * Create widgets of calendars shown in a popup, keyed by the create widget name.
 * The layout renders them like popup widgets: own row, width by gridWidth of the create widget in the view.
 */
export const getCalendarCreatePopupOwners = (widgets: AppWidgetMeta[]) => {
    return widgets.reduce<Record<string, AppWidgetMeta>>((owners, widget) => {
        const createWidgetName = widget.options?.create?.widget

        if (createWidgetName && isCalendarCreatePopupStyle(widget) && widgets.some(item => item.name === createWidgetName)) {
            owners[createWidgetName] = widget
        }

        return owners
    }, {})
}
