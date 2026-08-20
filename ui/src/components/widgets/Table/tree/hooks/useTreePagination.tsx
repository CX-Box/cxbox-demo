import { AppWidgetMeta } from '@interfaces/widget'
import { usePaginationState } from '@features/pagination/hooks/usePaginationState'
import { usePaginationMode } from '@features/pagination/hooks/usePaginationMode'

export const useTreePagination = (bcName?: string, widgetMeta?: AppWidgetMeta) => {
    const pagination = usePaginationState(bcName)
    const { type } = usePaginationMode(widgetMeta)

    return {
        ...pagination,
        paginationType: type
    }
}
