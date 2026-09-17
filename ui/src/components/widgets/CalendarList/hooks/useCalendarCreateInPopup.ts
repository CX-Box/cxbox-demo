import { AppWidgetMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { selectWidget } from '@selectors/selectors'
import { isCalendarCreatePopupStyle } from '@components/widgets/CalendarList/utils/calendarFormPopups'

/**
 * Calendar widgets create records in a popup for options.create.style "inlineForm" (default) and "popup".
 * "inline" keeps creating in the table mode, "none" disables the create form.
 */
export const useCalendarCreateInPopup = (widget: AppWidgetMeta) => {
    const createWidget = useAppSelector(selectWidget(widget.options?.create?.widget))

    return !!createWidget && isCalendarCreatePopupStyle(widget)
}
