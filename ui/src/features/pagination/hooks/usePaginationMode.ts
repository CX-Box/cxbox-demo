import { useMemo } from 'react'
import { useAppSelector } from '@store'
import { AppWidgetMeta } from '@interfaces/widget'
import { MAIN_DEFAULT_PAGINATION_TYPE, PaginationMode } from '@constants/pagination'
import { getWidgetPaginationType, isAvailablePaginationType } from '@features/pagination/utils/common'

export interface PaginationModeState {
    enabled: boolean
    initialType: PaginationMode
    type: PaginationMode
    alternativeType?: PaginationMode
}

export const usePaginationMode = (meta?: AppWidgetMeta): PaginationModeState => {
    const selectedAlternativeType = useAppSelector(state => (meta ? state.screen.alternativePagination[meta.name] : undefined))
    const initialType = useMemo(() => (meta ? getWidgetPaginationType(meta) : MAIN_DEFAULT_PAGINATION_TYPE), [meta])
    const configuredAlternativeType = meta?.options?.pagination?.alternativeType
    const alternativeType =
        isAvailablePaginationType(configuredAlternativeType) && configuredAlternativeType !== initialType
            ? configuredAlternativeType
            : undefined

    return {
        enabled: meta?.options?.pagination?.enabled ?? true,
        initialType,
        type: selectedAlternativeType ?? initialType,
        alternativeType
    }
}
