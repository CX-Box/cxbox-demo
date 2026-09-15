import { WidgetTypes } from '@cxbox-ui/core'
import { CustomWidgetTypes } from '@interfaces/widget'

export const sidebarWidgetsTypes: string[] = [CustomWidgetTypes.AdditionalInfo, CustomWidgetTypes.AdditionalList]

/**
 * Widget grid of the view layout: widget.gridWidth is the Col span of 24 columns, rows have a 24px gutter
 */
export const LAYOUT_GRID_COLUMNS = 24
export const LAYOUT_ROW_GUTTER = 24

export const popupWidgets = [
    WidgetTypes.AssocListPopup,
    WidgetTypes.PickListPopup,
    WidgetTypes.FlatTreePopup,
    CustomWidgetTypes.FormPopup,
    CustomWidgetTypes.AssocTreePopup,
    CustomWidgetTypes.PickTreePopup
]
