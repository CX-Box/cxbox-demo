import React, { useEffect, useMemo } from 'react'
import ArrowPaginationContainer from '@components/ui/Pagination/ArrowPagination'
import DefaultPagination from '@components/ui/Pagination/DefaultPagination'
import { useAppSelector } from '@store'
import { getWidgetPaginationType } from '@components/ui/Pagination/utils'
import { AppWidgetMeta } from '@interfaces/widget'

export interface DefaultPaginationProps {
    meta: AppWidgetMeta
    disabledLimit?: boolean
}

function Pagination({ meta, disabledLimit }: DefaultPaginationProps) {
    const alternativePagination = useAppSelector(state => state.screen.alternativePagination)

    const paginationType = useMemo(() => getWidgetPaginationType(meta, alternativePagination[meta.name]), [alternativePagination, meta])

    const { enabled, hideLimitOptions, type, alternativeType } = meta.options?.pagination ?? {}
    const paginationEnabled = enabled ?? true

    useEffect(() => {
        if (alternativeType) {
            if (!paginationEnabled) {
                console.info(
                    `${meta.name} widget: alternativeType parameter was not applied, because options.pagination.enabled is set to false`
                )
            }

            if (hideLimitOptions) {
                console.info(
                    `${meta.name} widget: alternativeType parameter was not applied, because options.pagination.hideLimitOptions is set to true`
                )
            }

            if (alternativeType === type) {
                console.info(
                    `${meta.name} widget: pagination.alternativeType was not applied - pagination.type and pagination.alternativeType are the same`
                )
            }
        }
    }, [alternativeType, hideLimitOptions, meta.name, paginationEnabled, type])

    if (!paginationEnabled) {
        return null
    }

    const resolvedAlternativeType = alternativeType !== type ? alternativeType : undefined

    if (paginationType === 'nextAndPreviousSmart') {
        return <ArrowPaginationContainer meta={meta} alternativeType={resolvedAlternativeType} disabledLimit={disabledLimit} mode="smart" />
    } else if (paginationType === 'nextAndPreviousWithHasNext') {
        return (
            <ArrowPaginationContainer meta={meta} alternativeType={resolvedAlternativeType} disabledLimit={disabledLimit} mode="default" />
        )
    } else if (paginationType === 'nextAndPreviousWithCount') {
        return <DefaultPagination meta={meta} alternativeType={resolvedAlternativeType} disabledLimit={disabledLimit} />
    } else {
        return null
    }
}

export default React.memo(Pagination)
