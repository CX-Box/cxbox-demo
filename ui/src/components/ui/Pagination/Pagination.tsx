import React from 'react'
import ArrowPaginationContainer from '@components/ui/Pagination/ArrowPagination'
import DefaultPagination from '@components/ui/Pagination/DefaultPagination'
import { AppWidgetMeta } from '@interfaces/widget'
import { usePaginationMode } from '@features/pagination/hooks/usePaginationMode'
import { useAlternativePaginationValidation } from '@features/pagination/hooks/useAlternativePaginationValidation'

export interface DefaultPaginationProps {
    meta: AppWidgetMeta
    disabledLimit?: boolean
}

function Pagination({ meta, disabledLimit }: DefaultPaginationProps) {
    const pagination = usePaginationMode(meta)
    useAlternativePaginationValidation(meta, pagination)

    if (!pagination.enabled) {
        return null
    }

    if (pagination.type === 'nextAndPreviousSmart') {
        return (
            <ArrowPaginationContainer meta={meta} alternativeType={pagination.alternativeType} disabledLimit={disabledLimit} mode="smart" />
        )
    } else if (pagination.type === 'nextAndPreviousWithHasNext') {
        return (
            <ArrowPaginationContainer
                meta={meta}
                alternativeType={pagination.alternativeType}
                disabledLimit={disabledLimit}
                mode="default"
            />
        )
    } else if (pagination.type === 'nextAndPreviousWithCount') {
        return <DefaultPagination meta={meta} alternativeType={pagination.alternativeType} disabledLimit={disabledLimit} />
    } else {
        return null
    }
}

export default React.memo(Pagination)
