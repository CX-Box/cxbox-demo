import { AppWidgetMeta } from '@interfaces/widget'
import { internalFormPopupWidgets } from '@constants/layout'
import { InternalWidgetOptionsName } from '@hooks/useInternalWidget'

const INTERNAL_FORM_TYPES: InternalWidgetOptionsName[] = ['create', 'edit']

/**
 * Whether the widget opens its create or edit form in the popup drawn by the layout (see internalFormPopupWidgets)
 */
export const isInternalFormPopup = (widget: AppWidgetMeta, type: InternalWidgetOptionsName) => {
    const inlineFormPopups = internalFormPopupWidgets[widget.type]
    const formOptions = widget.options?.[type]

    if (!inlineFormPopups || !formOptions?.widget) {
        return false
    }

    const style = formOptions.style ?? 'inlineForm'

    return style === 'popup' || (style === 'inlineForm' && inlineFormPopups.includes(type))
}

/**
 * Create and edit forms of internalFormPopupWidgets in the view, keyed by the form name, with the widget which options refer to the form.
 * The layout gives these forms a place like popup widgets.
 */
export const getInternalFormPlaces = (widgets: AppWidgetMeta[]) => {
    return widgets.reduce<Record<string, AppWidgetMeta>>((places, widget) => {
        if (internalFormPopupWidgets[widget.type]) {
            INTERNAL_FORM_TYPES.forEach(type => {
                const formName = widget.options?.[type]?.widget

                if (formName && widgets.some(item => item.name === formName)) {
                    places[formName] = widget
                }
            })
        }

        return places
    }, {})
}
