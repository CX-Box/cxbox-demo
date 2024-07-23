import React from 'react'
import ArrowPaginationContainer from '@components/ui/Pagination/ArrowPagination'
import DefaultPagination from '@components/ui/Pagination/DefaultPagination'
import { AppWidgetMeta } from '@interfaces/widget'

export interface DefaultPaginationProps {
    meta: AppWidgetMeta
    disabledLimit?: boolean
}

function Pagination({ meta, disabledLimit }: DefaultPaginationProps) {
    if (meta.options?.pagination?.type === 'nextAndPrevious') {
        return <ArrowPaginationContainer meta={meta} disabledLimit={disabledLimit} />
    }

    return <DefaultPagination meta={meta} disabledLimit={disabledLimit} />
}

export default React.memo(Pagination)
