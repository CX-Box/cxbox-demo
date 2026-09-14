import { AppWidgetMeta, InternalWidgetStyle } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { selectWidget } from '@selectors/selectors'

// "inlineForm" in a calendar has no table row to expand, so it is shown as a popup, the same as "popup"
const POPUP_CREATE_STYLES: Array<InternalWidgetStyle | undefined> = [undefined, 'inlineForm', 'popup']

/**
 * Calendar widgets create records in a popup for options.create.style "inlineForm" (default) and "popup".
 * "inline" keeps creating in the table mode, "none" disables the create form.
 */
export const useCalendarCreateInPopup = (widget: AppWidgetMeta) => {
    const createOptions = widget.options?.create
    const createWidget = useAppSelector(selectWidget(createOptions?.widget))

    return !!createWidget && POPUP_CREATE_STYLES.includes(createOptions?.style)
}
