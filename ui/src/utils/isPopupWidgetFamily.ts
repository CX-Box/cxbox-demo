const POPUP_FAMILY_POSTFIX = 'Popup'

export const isPopupWidgetFamily = (widgetType?: string) => {
    return widgetType?.endsWith(POPUP_FAMILY_POSTFIX) ?? false
}
