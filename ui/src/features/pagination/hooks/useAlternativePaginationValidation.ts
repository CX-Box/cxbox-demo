import { useEffect } from 'react'
import { AppWidgetMeta } from '@interfaces/widget'
import { PaginationModeState } from '@features/pagination/hooks/usePaginationMode'
import { isAvailablePaginationType } from '@features/pagination/utils/common'

export const useAlternativePaginationValidation = (meta: AppWidgetMeta, pagination: PaginationModeState) => {
    const { hideLimitOptions, alternativeType } = meta.options?.pagination ?? {}
    const isAlternativeTypeAvailable = isAvailablePaginationType(alternativeType)

    useEffect(() => {
        if (!alternativeType) {
            return
        }

        if (!pagination.enabled) {
            console.info(
                `${meta.name} widget: alternativeType parameter was not applied, because options.pagination.enabled is set to false`
            )
        }

        if (hideLimitOptions) {
            console.info(
                `${meta.name} widget: alternativeType parameter was not applied, because options.pagination.hideLimitOptions is set to true`
            )
        }

        if (alternativeType === pagination.initialType) {
            console.info(
                `${meta.name} widget: pagination.alternativeType was not applied - pagination.type and pagination.alternativeType are the same`
            )
        }

        if (!isAlternativeTypeAvailable) {
            console.info(
                `${meta.name} widget: The value in options.pagination.alternativeType is not correct. Please, indicate the correct pagination type in options.pagination.alternativeType`
            )
        }
    }, [alternativeType, hideLimitOptions, isAlternativeTypeAvailable, meta.name, pagination.enabled, pagination.initialType])
}
