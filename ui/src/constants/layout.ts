import { WidgetTypes } from '@cxbox-ui/core'
import { CustomWidgetTypes } from '@interfaces/widget'

export const sidebarWidgetsTypes: string[] = [CustomWidgetTypes.AdditionalInfo, CustomWidgetTypes.AdditionalList]

export const popupWidgets = [
    WidgetTypes.AssocListPopup,
    WidgetTypes.PickListPopup,
    WidgetTypes.FlatTreePopup,
    CustomWidgetTypes.FormPopup,
    CustomWidgetTypes.AssocTreePopup,
    CustomWidgetTypes.PickTreePopup
]

/**
 * Widgets which open their create or edit form in a popup for "style": "popup".
 * The value lists the forms which the widget also opens in the popup for "style": "inlineForm" (the default):
 * a calendar has no place for the form of a new event.
 * The layout draws the popup in place of the form widget, so the popup width is the gridWidth of the form in the view, like for popup widgets.
 */
export const internalFormPopupWidgets: Partial<Record<string, Array<'create' | 'edit'>>> = {
    [CustomWidgetTypes.CalendarList]: ['create'],
    [CustomWidgetTypes.CalendarYearList]: ['create']
}
