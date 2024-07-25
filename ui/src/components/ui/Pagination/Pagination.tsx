import React from 'react'
import ArrowPaginationContainer from '@components/ui/Pagination/ArrowPagination'
import DefaultPagination from '@components/ui/Pagination/DefaultPagination'
import { AppWidgetMeta } from '@interfaces/widget'

export interface DefaultPaginationProps {
    meta: AppWidgetMeta
    disabledLimit?: boolean
}

function Pagination({ meta, disabledLimit }: DefaultPaginationProps) {
    if (meta.options?.pagination?.type === 'nextAndPreviousSmart') {
        return <ArrowPaginationContainer meta={meta} disabledLimit={disabledLimit} mode="smart" />
    }

    if (meta.options?.pagination?.type === 'nextAndPreviousWihHasNext') {
        return <ArrowPaginationContainer meta={meta} disabledLimit={disabledLimit} mode="default" />
    }

    // nextAndPreviousWithCount (default)
    return <DefaultPagination meta={meta} disabledLimit={disabledLimit} />
}

export default React.memo(Pagination)
