import { AppWidgetMeta, CustomWidgetTypes, InternalWidgetStyle } from '@interfaces/widget'

// "inlineForm" in a calendar has no table row to expand, so the form is shown in a popup (create) or a popover (edit), the same as "popup"
export const POPUP_FORM_STYLES: Array<InternalWidgetStyle | undefined> = [undefined, 'inlineForm', 'popup']

const CALENDAR_WIDGET_TYPES: string[] = [CustomWidgetTypes.CalendarList, CustomWidgetTypes.CalendarYearList]

/**
 * Whether the widget is a calendar which creates records in a popup (options.create.style "inlineForm" (default) or "popup")
 */
export const isCalendarCreatePopupStyle = (widget: AppWidgetMeta) => {
    return (
        CALENDAR_WIDGET_TYPES.includes(widget.type) &&
        !!widget.options?.create?.widget &&
        POPUP_FORM_STYLES.includes(widget.options.create.style)
    )
}

/**
 * Whether the widget is a calendar which edits records in a popover (options.edit.style "inlineForm" (default) or "popup")
 */
export const isCalendarEditPopoverStyle = (widget: AppWidgetMeta) => {
    return (
        CALENDAR_WIDGET_TYPES.includes(widget.type) &&
        !!widget.options?.edit?.widget &&
        POPUP_FORM_STYLES.includes(widget.options.edit.style)
    )
}

/**
 * Edit widgets of calendars shown in a popover, keyed by the edit widget name.
 * The layout gives them a place like popup widgets, where the width of the popover is measured the same way as of a popup.
 */
export const getCalendarEditPopoverOwners = (widgets: AppWidgetMeta[]) => {
    return widgets.reduce<Record<string, AppWidgetMeta>>((owners, widget) => {
        const editWidgetName = widget.options?.edit?.widget

        if (editWidgetName && isCalendarEditPopoverStyle(widget) && widgets.some(item => item.name === editWidgetName)) {
            owners[editWidgetName] = widget
        }

        return owners
    }, {})
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
