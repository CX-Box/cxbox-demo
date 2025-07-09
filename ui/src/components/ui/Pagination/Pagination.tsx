import React, { useMemo } from 'react'
import ArrowPaginationContainer from '@components/ui/Pagination/ArrowPagination'
import DefaultPagination from '@components/ui/Pagination/DefaultPagination'
import { AppWidgetMeta } from '@interfaces/widget'
import { getWidgetPaginationType } from '@components/ui/Pagination/utils'

export interface DefaultPaginationProps {
    meta: AppWidgetMeta
    disabledLimit?: boolean
}

function Pagination({ meta, disabledLimit }: DefaultPaginationProps) {
    const paginationType = useMemo(() => getWidgetPaginationType(meta), [meta])
    const paginationEnabled = meta.options?.pagination?.enabled ?? true

    if (!paginationEnabled) {
        return null
    }

    if (paginationType === 'nextAndPreviousSmart') {
        return <ArrowPaginationContainer meta={meta} disabledLimit={disabledLimit} mode="smart" />
    } else if (paginationType === 'nextAndPreviousWithHasNext') {
        return <ArrowPaginationContainer meta={meta} disabledLimit={disabledLimit} mode="default" />
    } else if (paginationType === 'nextAndPreviousWithCount') {
        return <DefaultPagination meta={meta} disabledLimit={disabledLimit} />
    } else {
        return null
    }
}

export default React.memo(Pagination)
