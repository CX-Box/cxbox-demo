import React, { useEffect, useMemo } from 'react'
import ArrowPaginationContainer from '@components/ui/Pagination/ArrowPagination'
import DefaultPagination from '@components/ui/Pagination/DefaultPagination'
import { useAppSelector } from '@store'
import { getWidgetPaginationType, isAvailablePaginationType } from '@components/ui/Pagination/utils'
import { AppWidgetMeta } from '@interfaces/widget'

export interface DefaultPaginationProps {
    meta: AppWidgetMeta
    disabledLimit?: boolean
}

function Pagination({ meta, disabledLimit }: DefaultPaginationProps) {
    const alternativePagination = useAppSelector(state => state.screen.alternativePagination)

    const initialPaginationType = useMemo(() => getWidgetPaginationType(meta), [meta])
    const paginationType = alternativePagination[meta.name] || initialPaginationType

    const { enabled, hideLimitOptions, alternativeType } = meta.options?.pagination ?? {}
    const isAlternativeTypeAvailable = isAvailablePaginationType(alternativeType)
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

            if (alternativeType === initialPaginationType) {
                console.info(
                    `${meta.name} widget: pagination.alternativeType was not applied - pagination.type and pagination.alternativeType are the same`
                )
            }

            if (!isAlternativeTypeAvailable) {
                console.info(
                    `${meta.name} widget: The value in options.pagination.alternativeType is not correct. Please, indicate the correct pagination type in options.pagination.alternativeType`
                )
            }
        }
    }, [alternativeType, hideLimitOptions, initialPaginationType, isAlternativeTypeAvailable, meta.name, paginationEnabled])

    if (!paginationEnabled) {
        return null
    }

    const resolvedAlternativeType = isAlternativeTypeAvailable && alternativeType !== initialPaginationType ? alternativeType : undefined

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
