import React from 'react'
import { useAppSelector } from '@store'
import { AppWidgetMeta } from '@interfaces/widget'
import { FilterType } from '@interfaces/filters'

const hasHighlightFromFullTextSearch = (widget: AppWidgetMeta | undefined, fieldKey: string, filterType: FilterType | string) =>
    filterType === FilterType.fullTextSearch && widget?.options?.fullTextSearch?.highLight?.fieldKeys?.includes(fieldKey)

/**
 * Get filters from the store for specific widget and field
 *
 * @param widgetName
 * @param fieldKey
 * @category Hooks
 */
export function useWidgetFilters(widgetName: string, fieldKey: string) {
    return useAppSelector(state => {
        const viewName = state.view.name
        const widget = state.view.widgets.find(item => item.name === widgetName)
        const filters = state.screen.filters[widget?.bcName as string]?.filter(item => {
            let match = item.fieldName === fieldKey || hasHighlightFromFullTextSearch(widget, fieldKey, item.type)
            if (item.viewName) {
                match = match && item.viewName === viewName
            }
            if (item.widgetName) {
                match = match && item.widgetName === widget?.name
            }
            return match
        })
        return filters || []
    })
}

/**
 *
 * @param widgetName
 * @param fieldKey
 * @category Hooks
 */
export function useWidgetHighlightFilter(widgetName: string, fieldKey: string) {
    const filters = useWidgetFilters(widgetName, fieldKey)
    const filter = filters[0]
    return React.useMemo(() => filter, [filter])
}
