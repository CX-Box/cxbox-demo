import { AppWidgetMeta } from '@interfaces/widget'
import { usePaginationState } from '@features/pagination/hooks/usePaginationState'
import { usePaginationMode } from '@features/pagination/hooks/usePaginationMode'
import { useEffect } from 'react'

export const useTreePagination = (bcName?: string, widgetMeta?: AppWidgetMeta) => {
    const pagination = usePaginationState(bcName)
    const { type, enabled } = usePaginationMode(widgetMeta)

    useEffect(() => {
        if (widgetMeta && !enabled) {
            console.error(
                `"${widgetMeta.type}" "${widgetMeta.name}": options.pagination.enabled is ignored - Tree-like widgets don't have the standard pagination panel to show or hide.`
            )
        }
    }, [enabled, widgetMeta])

    return {
        ...pagination,
        enabled: true,
        paginationType: type
    }
}
