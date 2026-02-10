import { AppWidgetMeta } from '@interfaces/widget'
import {
    AVAILABLE_PAGINATION_TYPES,
    MAIN_DEFAULT_PAGINATION_TYPE,
    PaginationMode,
    SECONDARY_DEFAULT_PAGINATION_TYPE_WITH_COUNT,
    WIDGETS_WITH_SECONDARY_DEFAULT_PAGINATION_TYPE_WITH_COUNT
} from '@constants/pagination'

export const isAvailablePaginationType = (paginationType: PaginationMode | undefined): paginationType is PaginationMode => {
    return typeof paginationType === 'string' && AVAILABLE_PAGINATION_TYPES.includes(paginationType)
}

export const getWidgetPaginationType = (meta: AppWidgetMeta) => {
    const optionsPaginationType = meta.options?.pagination?.type
    let widgetPaginationType: PaginationMode

    if (isAvailablePaginationType(optionsPaginationType)) {
        widgetPaginationType = optionsPaginationType
    } else if ((WIDGETS_WITH_SECONDARY_DEFAULT_PAGINATION_TYPE_WITH_COUNT as string[]).includes(meta.type)) {
        widgetPaginationType = SECONDARY_DEFAULT_PAGINATION_TYPE_WITH_COUNT
    } else {
        widgetPaginationType = MAIN_DEFAULT_PAGINATION_TYPE
    }

    return widgetPaginationType
}

export const getBcPaginationTypes = (
    bcName: string | undefined,
    widgets: AppWidgetMeta[] | undefined,
    alternativePagination: { [widgetName: string]: PaginationMode }
) => {
    const usedPaginationTypes = new Set<PaginationMode>()

    widgets?.forEach(
        widget => widget.bcName === bcName && usedPaginationTypes.add(alternativePagination[widget.name] || getWidgetPaginationType(widget))
    )

    return usedPaginationTypes
}

export const findWidgetHasCount = (
    bcName: string | undefined,
    widgets: AppWidgetMeta[] | undefined,
    alternativePagination: { [widgetName: string]: PaginationMode }
) => {
    return widgets?.find(
        widget =>
            widget.bcName === bcName &&
            (alternativePagination[widget.name] || getWidgetPaginationType(widget)) === SECONDARY_DEFAULT_PAGINATION_TYPE_WITH_COUNT
    )
}
