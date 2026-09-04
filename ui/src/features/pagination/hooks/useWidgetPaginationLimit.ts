import { AppWidgetMeta } from '@interfaces/widget'
import { AVAILABLE_LIMITS_LIST } from '@constants/pagination'
import { usePaginationLimit } from './usePaginationLimit'

export const useWidgetPaginationLimit = (widget: AppWidgetMeta) => {
    const { hideLimitOptions = false, availableLimitsList = AVAILABLE_LIMITS_LIST } = widget.options?.pagination ?? {}
    const paginationLimit = usePaginationLimit(widget.bcName, {
        availableLimits: availableLimitsList,
        hideOptions: hideLimitOptions
    })

    return {
        hideLimitOptions: !paginationLimit.visible,
        changePageLimit: paginationLimit.changeLimit,
        value: paginationLimit.limit,
        options: paginationLimit.options
    }
}
