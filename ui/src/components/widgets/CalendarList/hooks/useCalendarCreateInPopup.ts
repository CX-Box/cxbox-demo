import { AppWidgetMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { selectWidget } from '@selectors/selectors'
import { isInternalFormPopup } from '@utils/internalFormPopup'

/**
 * Whether the calendar creates records in the popup of the layout.
 * Without its create form in the view the calendar creates records in the table mode.
 */
export const useCalendarCreateInPopup = (widget: AppWidgetMeta) => {
    const createWidget = useAppSelector(selectWidget(widget.options?.create?.widget))

    return !!createWidget && isInternalFormPopup(widget, 'create')
}
